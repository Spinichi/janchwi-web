package site.janchwi.domain.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import site.janchwi.domain.auth.dto.LoginRequest;
import site.janchwi.domain.auth.dto.SignupRequest;
import site.janchwi.domain.auth.dto.TokenPairDto;
import site.janchwi.domain.refreshtokens.entity.RefreshToken;
import site.janchwi.domain.refreshtokens.repository.RefreshTokenRepository;
import site.janchwi.domain.users.entity.User;
import site.janchwi.domain.users.repository.UserRepository;
import site.janchwi.global.common.Constants;
import site.janchwi.global.config.JwtTokenProvider;
import site.janchwi.global.email.EmailService;
import site.janchwi.global.exception.AccountLockedException;
import site.janchwi.global.exception.EmailNotVerifiedException;
import site.janchwi.global.exception.HashingException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Period;
import java.time.temporal.ChronoUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;

    /**
     * 로그인
     */
    @Transactional
    public TokenPairDto login(LoginRequest request) {
        log.info("로그인 시도: email={}", request.getEmail());

        // 사용자 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("로그인 실패 - 존재하지 않는 이메일: {}", request.getEmail());
                    return new ResponseStatusException(
                            HttpStatus.UNAUTHORIZED,
                            "이메일 또는 비밀번호가 일치하지 않습니다."
                    );
                });

        // 계정 잠금 확인
        if (user.isAccountLocked()) {
            log.warn("로그인 실패 - 계정 잠금: email={}", request.getEmail());
            throw new AccountLockedException(
                    "계정이 일시적으로 잠겼습니다. " + Constants.ACCOUNT_LOCK_DURATION_MINUTES + "분 후 다시 시도해주세요."
            );
        }

        // 계정 활성화 확인
        if (!user.isActive()) {
            log.warn("로그인 실패 - 비활성화 계정: email={}", request.getEmail());
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "비활성화된 계정입니다. 관리자에게 문의해주세요."
            );
        }

        // 이메일 인증 확인
        if (!user.isEmailVerified()) {
            log.warn("로그인 실패 - 이메일 미인증: email={}", request.getEmail());
            throw new EmailNotVerifiedException("이메일 인증이 필요합니다. 인증 후 로그인해주세요.");
        }

        // 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            user.onLoginFailure();

            // 실패 횟수가 최대치에 도달하면 계정 잠금
            if (user.getFailedLoginAttempts() >= Constants.MAX_LOGIN_ATTEMPTS) {
                user.lockAccount(Constants.ACCOUNT_LOCK_DURATION_MINUTES);
                log.warn("계정 잠금 - 로그인 실패 횟수 초과: email={}", request.getEmail());
            }

            log.warn("로그인 실패 - 비밀번호 불일치: email={}, 실패 횟수={}",
                    request.getEmail(), user.getFailedLoginAttempts());

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "이메일 또는 비밀번호가 일치하지 않습니다."
            );
        }

        // 로그인 성공 처리
        user.onLoginSuccess();
        log.info("로그인 성공: userId={}, email={}", user.getId(), request.getEmail());

        // 토큰 생성
        String accessToken = jwtTokenProvider.createAccessToken(user.getId());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        // Refresh Token 해시화 및 저장
        String refreshTokenHash = hashToken(refreshToken);
        saveOrUpdateRefreshToken(user, refreshTokenHash);

        return TokenPairDto.builder()
                .userId(user.getId())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    /**
     * 회원가입
     */
    @Transactional
    public TokenPairDto signup(SignupRequest request) {
        log.info("회원가입 시도: email={}, nickname={}", request.getEmail(), request.getNickname());

        // 이메일 중복 체크
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("회원가입 실패 - 이메일 중복: {}", request.getEmail());
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "이미 사용 중인 이메일입니다."
            );
        }

        // 닉네임 중복 체크
        if (userRepository.existsByNickname(request.getNickname())) {
            log.warn("회원가입 실패 - 닉네임 중복: {}", request.getNickname());
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "이미 사용 중인 닉네임입니다."
            );
        }

        // 만 19세 이상 검증
        LocalDate birthDate = request.getBirthDate();
        LocalDate today = LocalDate.now();
        int age = Period.between(birthDate, today).getYears();

        if (age < Constants.MINIMUM_AGE) {
            log.warn("회원가입 실패 - 나이 제한: email={}, age={}", request.getEmail(), age);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "만 " + Constants.MINIMUM_AGE + "세 이상만 가입할 수 있습니다."
            );
        }

        // 사용자 생성
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .birthDate(birthDate)
                .profileImageUrl(request.getProfileImageUrl())
                .gender(request.getGender())
                .bio(request.getBio())
                .build();

        User savedUser = userRepository.save(user);
        log.info("회원가입 성공: userId={}, email={}", savedUser.getId(), request.getEmail());

        // 이메일 인증 코드 발송
        sendVerificationCode(savedUser.getEmail());

        // 토큰 생성 및 반환
        String accessToken = jwtTokenProvider.createAccessToken(savedUser.getId());
        String refreshToken = jwtTokenProvider.createRefreshToken(savedUser.getId());

        // Refresh Token 해시화 및 저장
        String refreshTokenHash = hashToken(refreshToken);
        saveOrUpdateRefreshToken(savedUser, refreshTokenHash);

        return TokenPairDto.builder()
                .userId(savedUser.getId())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    /**
     * 이메일 중복 체크
     */
    @Transactional(readOnly = true)
    public boolean checkEmailAvailable(String email) {
        boolean available = !userRepository.existsByEmail(email);
        log.debug("이메일 중복 체크: email={}, available={}", email, available);
        return available;
    }

    /**
     * 이메일 인증 코드 발송
     */
    @Transactional
    public void sendVerificationCode(String email) {
        log.info("이메일 인증 코드 발송 요청: email={}", email);

        // 사용자 조회 - 이메일 존재 여부 노출 방지를 위해 조용히 처리
        User user = userRepository.findByEmail(email).orElse(null);

        // 사용자가 없거나 이미 인증된 경우 조용히 성공 처리 (보안)
        if (user == null) {
            log.warn("이메일 인증 코드 발송 - 존재하지 않는 이메일: {}", email);
            // 이메일 존재 여부를 노출하지 않기 위해 예외를 던지지 않음
            return;
        }

        if (user.isEmailVerified()) {
            log.info("이메일 인증 코드 발송 - 이미 인증된 이메일: {}", email);
            // 이메일 존재 여부를 노출하지 않기 위해 예외를 던지지 않음
            return;
        }

        // 6자리 랜덤 코드 생성
        String verificationCode = generateVerificationCode();

        // 코드 해시화 및 저장
        String codeHash = hashToken(verificationCode);
        Instant expiry = Instant.now().plus(Constants.EMAIL_VERIFICATION_EXPIRY_MINUTES, ChronoUnit.MINUTES);
        user.setEmailVerificationCode(codeHash, expiry);

        // 이메일 발송
        emailService.sendVerificationEmail(email, verificationCode);
        log.info("이메일 인증 코드 발송 완료: email={}", email);
    }

    /**
     * 이메일 인증 코드 검증
     */
    @Transactional
    public void verifyEmail(String email, String code) {
        log.info("이메일 인증 시도: email={}", email);

        // 사용자 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("이메일 인증 실패 - 존재하지 않는 이메일: {}", email);
                    return new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "해당 이메일로 가입된 사용자를 찾을 수 없습니다."
                    );
                });

        // 이미 인증된 사용자
        if (user.isEmailVerified()) {
            log.info("이메일 인증 - 이미 인증된 이메일: {}", email);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이미 인증된 이메일입니다."
            );
        }

        // 인증 코드가 없는 경우
        if (user.getEmailVerificationCodeHash() == null) {
            log.warn("이메일 인증 실패 - 인증 코드 미발급: {}", email);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "인증 코드를 먼저 요청해주세요."
            );
        }

        // 시도 횟수 초과 확인
        if (user.isVerificationAttemptsExceeded()) {
            log.warn("이메일 인증 실패 - 시도 횟수 초과: email={}", email);
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "인증 시도 횟수를 초과했습니다. 새로운 인증 코드를 요청해주세요."
            );
        }

        // 만료 시간 확인 (Null 체크 포함)
        if (user.isEmailVerificationExpired()) {
            log.warn("이메일 인증 실패 - 인증 코드 만료: email={}", email);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "인증 코드가 만료되었습니다. 새로운 인증 코드를 요청해주세요."
            );
        }

        // 코드 검증
        String inputCodeHash = hashToken(code);
        if (!user.getEmailVerificationCodeHash().equals(inputCodeHash)) {
            user.incrementVerificationAttempts();
            log.warn("이메일 인증 실패 - 코드 불일치: email={}, 남은 시도={}회",
                    email, (Constants.EMAIL_VERIFICATION_MAX_ATTEMPTS - user.getVerificationAttempts()));
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "인증 코드가 일치하지 않습니다. (남은 시도: " +
                            (Constants.EMAIL_VERIFICATION_MAX_ATTEMPTS - user.getVerificationAttempts()) + "회)"
            );
        }

        // 인증 완료
        user.verifyEmail();
        log.info("이메일 인증 성공: email={}", email);
    }

    /**
     * Refresh Token으로 Access Token 재발급
     */
    @Transactional
    public TokenPairDto refreshAccessToken(String refreshTokenValue) {
        log.info("Access Token 재발급 요청");

        // Refresh Token 해시화
        String tokenHash = hashToken(refreshTokenValue);

        // DB에서 Refresh Token 조회
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> {
                    log.warn("Access Token 재발급 실패 - 유효하지 않은 Refresh Token");
                    return new ResponseStatusException(
                            HttpStatus.UNAUTHORIZED,
                            "유효하지 않은 Refresh Token입니다."
                    );
                });

        // Refresh Token 만료 확인
        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            log.warn("Access Token 재발급 실패 - Refresh Token 만료: userId={}", refreshToken.getUser().getId());
            refreshTokenRepository.delete(refreshToken);
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Refresh Token이 만료되었습니다. 다시 로그인해주세요."
            );
        }

        User user = refreshToken.getUser();

        // 새로운 Access Token 생성
        String newAccessToken = jwtTokenProvider.createAccessToken(user.getId());
        log.info("Access Token 재발급 성공: userId={}", user.getId());

        return TokenPairDto.builder()
                .userId(user.getId())
                .accessToken(newAccessToken)
                .refreshToken(refreshTokenValue) // 기존 Refresh Token 재사용
                .build();
    }

    /**
     * 로그아웃 (Refresh Token 삭제)
     */
    @Transactional
    public void logout(Long userId) {
        log.info("로그아웃 요청: userId={}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "사용자를 찾을 수 없습니다."
                ));

        refreshTokenRepository.deleteByUser(user);
        log.info("로그아웃 성공: userId={}", userId);
    }

    /**
     * 6자리 랜덤 인증 코드 생성
     */
    private String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        int codeRange = Constants.EMAIL_VERIFICATION_CODE_MAX - Constants.EMAIL_VERIFICATION_CODE_MIN;
        int code = random.nextInt(codeRange) + Constants.EMAIL_VERIFICATION_CODE_MIN;
        return String.valueOf(code);
    }

    /**
     * Token SHA-256 해시화
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-256 해시 알고리즘을 찾을 수 없습니다.", e);
            throw new HashingException("SHA-256 해시 알고리즘을 찾을 수 없습니다.", e);
        }
    }

    /**
     * Refresh Token 저장 또는 업데이트
     */
    private void saveOrUpdateRefreshToken(User user, String tokenHash) {
        Instant expiresAt = Instant.now().plus(Constants.REFRESH_TOKEN_EXPIRY_DAYS, ChronoUnit.DAYS);

        RefreshToken refreshToken = refreshTokenRepository.findByUser(user)
                .orElse(null);

        if (refreshToken == null) {
            // 새로 생성
            refreshToken = RefreshToken.builder()
                    .user(user)
                    .tokenHash(tokenHash)
                    .expiresAt(expiresAt)
                    .build();
            refreshTokenRepository.save(refreshToken);
        } else {
            // 기존 토큰 업데이트
            refreshToken.updateTokenHash(tokenHash, expiresAt);
        }
    }
}
