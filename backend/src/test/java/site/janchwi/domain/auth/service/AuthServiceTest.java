package site.janchwi.domain.auth.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import site.janchwi.domain.auth.dto.LoginRequest;
import site.janchwi.domain.auth.dto.SignupRequest;
import site.janchwi.domain.auth.dto.TokenPairDto;
import site.janchwi.domain.refreshtokens.entity.RefreshToken;
import site.janchwi.domain.refreshtokens.repository.RefreshTokenRepository;
import site.janchwi.domain.users.entity.Gender;
import site.janchwi.domain.users.entity.User;
import site.janchwi.domain.users.repository.UserRepository;
import site.janchwi.global.common.Constants;
import site.janchwi.global.config.JwtTokenProvider;
import site.janchwi.global.email.EmailService;
import site.janchwi.global.exception.AccountLockedException;
import site.janchwi.global.exception.EmailNotVerifiedException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService 테스트")
@SuppressWarnings("DataFlowIssue")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private EmailService emailService;

    @Mock
    private LoginAttemptService loginAttemptService;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private LoginRequest loginRequest;
    private SignupRequest signupRequest;

    @BeforeEach
    void setUp() {
        // 테스트용 사용자 생성 (Builder 패턴 사용)
        testUser = User.builder()
                .email("test@example.com")
                .password("encodedPassword")
                .nickname("testuser")
                .birthDate(LocalDate.of(2000, 1, 1))
                .gender(Gender.MALE)
                .isEmailVerified(true)
                .isActive(true)
                .failedLoginAttempts(0)
                .build();

        // 리플렉션으로 id 설정 (Lombok Builder에서 id를 설정할 수 없으므로)
        try {
            java.lang.reflect.Field idField = User.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(testUser, 1L);  // Long 타입으로 변경
        } catch (Exception e) {
            throw new RuntimeException("Failed to set user id", e);
        }

        loginRequest = new LoginRequest("test@example.com", "password123");

        signupRequest = new SignupRequest(
                "new@example.com",
                "password123",
                "newuser",
                LocalDate.of(2000, 1, 1),
                null,
                Gender.MALE,
                "테스트 자기소개"
        );
    }

    @Nested
    @DisplayName("로그인 테스트")
    class LoginTests {

        @Test
        @DisplayName("로그인 성공")
        void login_Success() {
            // given
            given(userRepository.findByEmail("test@example.com")).willReturn(Optional.of(testUser));
            given(passwordEncoder.matches("password123", "encodedPassword")).willReturn(true);
            given(jwtTokenProvider.createAccessToken(1L)).willReturn("accessToken");
            given(jwtTokenProvider.createRefreshToken(1L)).willReturn("refreshToken");
            given(refreshTokenRepository.findByUser(testUser)).willReturn(Optional.empty());
            doNothing().when(loginAttemptService).onLoginSuccess(1L);

            // when
            TokenPairDto result = authService.login(loginRequest);

            // then
            assertThat(result).isNotNull();
            assertThat(result.getUserId()).isEqualTo(1L);
            assertThat(result.getAccessToken()).isEqualTo("accessToken");
            assertThat(result.getRefreshToken()).isEqualTo("refreshToken");

            // LoginAttemptService.onLoginSuccess 호출 검증
            verify(loginAttemptService).onLoginSuccess(1L);

            // RefreshToken 저장 검증
            verify(refreshTokenRepository).save(any(RefreshToken.class));
        }

        @Test
        @DisplayName("로그인 실패 - 존재하지 않는 이메일")
        void login_Fail_UserNotFound() {
            // given
            given(userRepository.findByEmail("test@example.com")).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> authService.login(loginRequest))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(ex -> {
                        ResponseStatusException rse = (ResponseStatusException) ex;
                        assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
                        assertThat(rse.getReason()).contains("이메일 또는 비밀번호가 일치하지 않습니다");
                    });

            verify(passwordEncoder, never()).matches(anyString(), anyString());
        }

        @Test
        @DisplayName("로그인 실패 - 비밀번호 불일치")
        void login_Fail_WrongPassword() {
            // given
            given(userRepository.findByEmail("test@example.com")).willReturn(Optional.of(testUser));
            given(passwordEncoder.matches("password123", "encodedPassword")).willReturn(false);
            doNothing().when(loginAttemptService).onLoginFailure(1L);

            // when & then
            assertThatThrownBy(() -> authService.login(loginRequest))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(ex -> {
                        ResponseStatusException rse = (ResponseStatusException) ex;
                        assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
                        assertThat(rse.getReason()).contains("이메일 또는 비밀번호가 일치하지 않습니다");
                    });

            // LoginAttemptService.onLoginFailure 호출 검증
            verify(loginAttemptService).onLoginFailure(1L);

            verify(jwtTokenProvider, never()).createAccessToken(anyLong());
        }

        @Test
        @DisplayName("로그인 실패 - 이메일 미인증")
        void login_Fail_EmailNotVerified() {
            // given
            User unverifiedUser = User.builder()
                    .email("test@example.com")
                    .password("encodedPassword")
                    .nickname("testuser")
                    .birthDate(LocalDate.of(2000, 1, 1))
                    .isEmailVerified(false) // 이메일 미인증
                    .isActive(true)
                    .failedLoginAttempts(0)
                    .build();

            // id 설정
            try {
                java.lang.reflect.Field idField = User.class.getDeclaredField("id");
                idField.setAccessible(true);
                idField.set(unverifiedUser, 1L);
            } catch (Exception e) {
                throw new RuntimeException("Failed to set user id", e);
            }

            given(userRepository.findByEmail("test@example.com")).willReturn(Optional.of(unverifiedUser));
            given(passwordEncoder.matches("password123", "encodedPassword")).willReturn(true); // 비밀번호는 맞음

            // when & then
            assertThatThrownBy(() -> authService.login(loginRequest))
                    .isInstanceOf(EmailNotVerifiedException.class)
                    .hasMessageContaining("이메일 인증이 필요합니다");

            // 비밀번호는 검증되어야 함
            verify(passwordEncoder).matches("password123", "encodedPassword");
        }

        @Test
        @DisplayName("로그인 실패 - 계정 잠금")
        void login_Fail_AccountLocked() {
            // given
            testUser.lockAccount(30); // 30분 잠금
            given(userRepository.findByEmail("test@example.com")).willReturn(Optional.of(testUser));

            // when & then
            assertThatThrownBy(() -> authService.login(loginRequest))
                    .isInstanceOf(AccountLockedException.class)
                    .hasMessageContaining("계정이 일시적으로 잠겼습니다")
                    .hasMessageContaining(String.valueOf(Constants.ACCOUNT_LOCK_DURATION_MINUTES));

            verify(passwordEncoder, never()).matches(anyString(), anyString());
        }

        @Test
        @DisplayName("계정 잠금 만료 후 실패 횟수 자동 초기화")
        void login_AccountLockExpired_ResetFailedAttempts() {
            // given - 계정 잠금이 만료된 상태 (accountLockedUntil은 과거)
            User lockedUser = User.builder()
                    .email("test@example.com")
                    .password("encodedPassword")
                    .nickname("testuser")
                    .birthDate(LocalDate.of(2000, 1, 1))
                    .isEmailVerified(true)
                    .isActive(true)
                    .failedLoginAttempts(5) // 5번 실패했었음
                    .build();

            // id 설정
            try {
                java.lang.reflect.Field idField = User.class.getDeclaredField("id");
                idField.setAccessible(true);
                idField.set(lockedUser, 1L);

                // accountLockedUntil을 과거로 설정 (이미 만료됨)
                java.lang.reflect.Field lockField = User.class.getDeclaredField("accountLockedUntil");
                lockField.setAccessible(true);
                lockField.set(lockedUser, Instant.now().minusSeconds(60)); // 1분 전에 만료
            } catch (Exception e) {
                throw new RuntimeException("Failed to set user fields", e);
            }

            given(userRepository.findByEmail("test@example.com")).willReturn(Optional.of(lockedUser));
            given(passwordEncoder.matches("password123", "encodedPassword")).willReturn(true);
            given(jwtTokenProvider.createAccessToken(1L)).willReturn("accessToken");
            given(jwtTokenProvider.createRefreshToken(1L)).willReturn("refreshToken");
            given(refreshTokenRepository.findByUser(lockedUser)).willReturn(Optional.empty());
            doNothing().when(loginAttemptService).onLoginSuccess(1L);

            // when
            TokenPairDto result = authService.login(loginRequest);

            // then
            assertThat(result).isNotNull();
            assertThat(result.getAccessToken()).isEqualTo("accessToken");

            // 잠금 만료로 인한 초기화 + 로그인 성공 초기화 = 총 2번 호출
            verify(loginAttemptService, times(2)).onLoginSuccess(1L);
        }

        @Test
        @DisplayName("로그인 실패 - 5회 실패 시 계정 자동 잠금")
        void login_Fail_AccountAutoLock_After5Attempts() {
            // given
            User user = User.builder()
                    .email("test@example.com")
                    .password("encodedPassword")
                    .nickname("testuser")
                    .birthDate(LocalDate.of(2000, 1, 1))
                    .isEmailVerified(true)
                    .isActive(true)
                    .failedLoginAttempts(4) // 이미 4번 실패
                    .build();

            // id 설정
            try {
                java.lang.reflect.Field idField = User.class.getDeclaredField("id");
                idField.setAccessible(true);
                idField.set(user, 1L);
            } catch (Exception e) {
                throw new RuntimeException("Failed to set user id", e);
            }

            given(userRepository.findByEmail("test@example.com")).willReturn(Optional.of(user));
            given(passwordEncoder.matches("password123", "encodedPassword")).willReturn(false);
            doNothing().when(loginAttemptService).onLoginFailure(1L);

            // when & then
            assertThatThrownBy(() -> authService.login(loginRequest))
                    .isInstanceOf(ResponseStatusException.class);

            // LoginAttemptService.onLoginFailure 호출 검증 (5번째 실패)
            verify(loginAttemptService).onLoginFailure(1L);
        }

        @Test
        @DisplayName("로그인 실패 - 비활성화된 계정")
        void login_Fail_InactiveAccount() {
            // given
            User inactiveUser = User.builder()
                    .email("test@example.com")
                    .password("encodedPassword")
                    .nickname("testuser")
                    .birthDate(LocalDate.of(2000, 1, 1))
                    .isEmailVerified(true)
                    .isActive(false) // 비활성화
                    .failedLoginAttempts(0)
                    .build();

            given(userRepository.findByEmail("test@example.com")).willReturn(Optional.of(inactiveUser));

            // when & then
            assertThatThrownBy(() -> authService.login(loginRequest))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(ex -> {
                        ResponseStatusException rse = (ResponseStatusException) ex;
                        assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
                        assertThat(rse.getReason()).contains("비활성화된 계정입니다");
                    });
        }
    }

    @Nested
    @DisplayName("회원가입 테스트")
    class SignupTests {

        @Test
        @DisplayName("회원가입 성공")
        void signup_Success() {
            // given
            given(userRepository.existsByEmail("new@example.com")).willReturn(false);
            given(userRepository.existsByNickname("newuser")).willReturn(false);
            given(passwordEncoder.encode(anyString())).willReturn("encodedPassword");

            User savedUser = User.builder()
                    .email("new@example.com")
                    .password("encodedPassword")
                    .nickname("newuser")
                    .birthDate(LocalDate.of(2000, 1, 1))
                    .gender(Gender.MALE)
                    .bio("테스트 자기소개")
                    .build();

            // id 설정
            try {
                java.lang.reflect.Field idField = User.class.getDeclaredField("id");
                idField.setAccessible(true);
                idField.set(savedUser, 1L);
            } catch (Exception e) {
                throw new RuntimeException("Failed to set user id", e);
            }

            given(userRepository.save(any(User.class))).willReturn(savedUser);

            // when
            Long userId = authService.signup(signupRequest);

            // then
            assertThat(userId).isNotNull();
            assertThat(userId).isEqualTo(1L);

            // User 저장 검증
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());

            User capturedUser = userCaptor.getValue();
            assertThat(capturedUser.getEmail()).isEqualTo("new@example.com");
            assertThat(capturedUser.getNickname()).isEqualTo("newuser");
            assertThat(capturedUser.getPassword()).isEqualTo("encodedPassword");

            // 이메일 인증 코드는 회원가입 시 발송하지 않음 (로그인 시도 시 안내)
            verify(emailService, never()).sendVerificationEmail(anyString(), anyString());

            // 토큰은 생성되지 않음
            verify(jwtTokenProvider, never()).createAccessToken(anyLong());
            verify(jwtTokenProvider, never()).createRefreshToken(anyLong());
            verify(refreshTokenRepository, never()).save(any(RefreshToken.class));
        }

        @Test
        @DisplayName("회원가입 실패 - 이메일 중복")
        void signup_Fail_DuplicateEmail() {
            // given
            given(userRepository.existsByEmail("new@example.com")).willReturn(true);

            // when & then
            assertThatThrownBy(() -> authService.signup(signupRequest))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(ex -> {
                        ResponseStatusException rse = (ResponseStatusException) ex;
                        assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                        assertThat(rse.getReason()).contains("이미 사용 중인 이메일입니다");
                    });

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("회원가입 실패 - 닉네임 중복")
        void signup_Fail_DuplicateNickname() {
            // given
            given(userRepository.existsByEmail("new@example.com")).willReturn(false);
            given(userRepository.existsByNickname("newuser")).willReturn(true);

            // when & then
            assertThatThrownBy(() -> authService.signup(signupRequest))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(ex -> {
                        ResponseStatusException rse = (ResponseStatusException) ex;
                        assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                        assertThat(rse.getReason()).contains("이미 사용 중인 닉네임입니다");
                    });

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("회원가입 실패 - 만 19세 미만")
        void signup_Fail_UnderAge() {
            // given
            SignupRequest underAgeRequest = new SignupRequest(
                    "new@example.com",
                    "password123",
                    "newuser",
                    LocalDate.now().minusYears(18), // 18세
                    null,
                    Gender.MALE,
                    "테스트"
            );

            given(userRepository.existsByEmail("new@example.com")).willReturn(false);
            given(userRepository.existsByNickname("newuser")).willReturn(false);

            // when & then
            assertThatThrownBy(() -> authService.signup(underAgeRequest))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(ex -> {
                        ResponseStatusException rse = (ResponseStatusException) ex;
                        assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                        assertThat(rse.getReason()).contains("만 " + Constants.MINIMUM_AGE + "세 이상만 가입할 수 있습니다");
                    });

            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("이메일 인증 테스트")
    class EmailVerificationTests {

        @Test
        @DisplayName("이메일 인증 코드 발송 성공")
        void sendVerificationCode_Success() {
            // given
            User unverifiedUser = User.builder()
                    .email("test@example.com")
                    .isEmailVerified(false)
                    .build();

            given(userRepository.findByEmail("test@example.com")).willReturn(Optional.of(unverifiedUser));
            doNothing().when(emailService).sendVerificationEmail(anyString(), anyString());

            // when
            authService.sendVerificationCode("test@example.com");

            // then
            assertThat(unverifiedUser.getEmailVerificationCodeHash()).isNotNull();
            assertThat(unverifiedUser.getEmailVerificationExpiry()).isNotNull();
            assertThat(unverifiedUser.getVerificationAttempts()).isEqualTo(0);

            // 만료 시간 검증 (15분)
            Instant expectedExpiry = Instant.now().plus(Constants.EMAIL_VERIFICATION_EXPIRY_MINUTES, ChronoUnit.MINUTES);
            assertThat(unverifiedUser.getEmailVerificationExpiry()).isBetween(
                    expectedExpiry.minusSeconds(5),
                    expectedExpiry.plusSeconds(5)
            );

            verify(emailService).sendVerificationEmail(eq("test@example.com"), anyString());
        }

        @Test
        @DisplayName("이메일 인증 코드 발송 - 존재하지 않는 이메일 (조용히 성공)")
        void sendVerificationCode_UserNotFound_SilentlySucceed() {
            // given
            given(userRepository.findByEmail("nonexistent@example.com")).willReturn(Optional.empty());

            // when
            authService.sendVerificationCode("nonexistent@example.com");

            // then - 예외가 발생하지 않고 조용히 성공
            verify(emailService, never()).sendVerificationEmail(anyString(), anyString());
        }

        @Test
        @DisplayName("이메일 인증 코드 발송 - 이미 인증된 이메일 (조용히 성공)")
        void sendVerificationCode_AlreadyVerified_SilentlySucceed() {
            // given
            given(userRepository.findByEmail("test@example.com")).willReturn(Optional.of(testUser));

            // when
            authService.sendVerificationCode("test@example.com");

            // then - 예외가 발생하지 않고 조용히 성공
            verify(emailService, never()).sendVerificationEmail(anyString(), anyString());
        }

        @Test
        @DisplayName("이메일 인증 성공")
        void verifyEmail_Success() {
            // given
            String verificationCode = "123456";
            User unverifiedUser = User.builder()
                    .id(1L)
                    .email("test@example.com")
                    .password("encodedPassword")
                    .nickname("testuser")
                    .birthDate(LocalDate.of(2000, 1, 1))
                    .gender(Gender.MALE)
                    .isEmailVerified(false)
                    .build();

            // 인증 코드 설정
            String codeHash = hashToken(verificationCode);
            unverifiedUser.setEmailVerificationCode(
                    codeHash,
                    Instant.now().plus(15, ChronoUnit.MINUTES)
            );

            given(userRepository.findByEmail("test@example.com")).willReturn(Optional.of(unverifiedUser));
            given(jwtTokenProvider.createAccessToken(1L)).willReturn("mock-access-token");
            given(jwtTokenProvider.createRefreshToken(1L)).willReturn("mock-refresh-token");
            given(refreshTokenRepository.findByUser(any(User.class))).willReturn(Optional.empty());

            // when
            TokenPairDto result = authService.verifyEmail("test@example.com", verificationCode);

            // then
            assertThat(unverifiedUser.isEmailVerified()).isTrue();
            assertThat(unverifiedUser.getEmailVerificationCodeHash()).isNull();
            assertThat(unverifiedUser.getVerificationAttempts()).isEqualTo(0);
            assertThat(result.getUserId()).isEqualTo(1L);
            assertThat(result.getAccessToken()).isEqualTo("mock-access-token");
            assertThat(result.getRefreshToken()).isEqualTo("mock-refresh-token");
            verify(refreshTokenRepository).save(any(RefreshToken.class));
        }

        @Test
        @DisplayName("이메일 인증 실패 - 코드 불일치")
        void verifyEmail_Fail_WrongCode() {
            // given
            User unverifiedUser = User.builder()
                    .email("test@example.com")
                    .isEmailVerified(false)
                    .verificationAttempts(0)
                    .build();

            unverifiedUser.setEmailVerificationCode(
                    hashToken("123456"),
                    Instant.now().plus(15, ChronoUnit.MINUTES)
            );

            given(userRepository.findByEmail("test@example.com")).willReturn(Optional.of(unverifiedUser));

            // when & then
            assertThatThrownBy(() -> authService.verifyEmail("test@example.com", "wrongcode"))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(ex -> {
                        ResponseStatusException rse = (ResponseStatusException) ex;
                        assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                        assertThat(rse.getReason()).contains("인증 코드가 일치하지 않습니다");
                    });

            assertThat(unverifiedUser.getVerificationAttempts()).isEqualTo(1);
        }

        @Test
        @DisplayName("이메일 인증 실패 - 만료된 코드")
        void verifyEmail_Fail_ExpiredCode() {
            // given
            User unverifiedUser = User.builder()
                    .email("test@example.com")
                    .isEmailVerified(false)
                    .build();

            unverifiedUser.setEmailVerificationCode(
                    hashToken("123456"),
                    Instant.now().minus(1, ChronoUnit.HOURS) // 이미 만료
            );

            given(userRepository.findByEmail("test@example.com")).willReturn(Optional.of(unverifiedUser));

            // when & then
            assertThatThrownBy(() -> authService.verifyEmail("test@example.com", "123456"))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(ex -> {
                        ResponseStatusException rse = (ResponseStatusException) ex;
                        assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                        assertThat(rse.getReason()).contains("인증 코드가 만료되었습니다");
                    });
        }

        @Test
        @DisplayName("이메일 인증 실패 - 시도 횟수 초과")
        void verifyEmail_Fail_TooManyAttempts() {
            // given
            User unverifiedUser = User.builder()
                    .email("test@example.com")
                    .isEmailVerified(false)
                    .build();

            // 먼저 인증 코드 설정 (이 메서드가 verificationAttempts를 0으로 초기화함)
            unverifiedUser.setEmailVerificationCode(
                    hashToken("123456"),
                    Instant.now().plus(15, ChronoUnit.MINUTES)
            );

            // 그 다음 리플렉션으로 verificationAttempts를 5로 설정
            try {
                java.lang.reflect.Field attemptsField = User.class.getDeclaredField("verificationAttempts");
                attemptsField.setAccessible(true);
                attemptsField.set(unverifiedUser, 5);
            } catch (Exception e) {
                throw new RuntimeException("Failed to set verification attempts", e);
            }

            given(userRepository.findByEmail("test@example.com")).willReturn(Optional.of(unverifiedUser));

            // when & then
            assertThatThrownBy(() -> authService.verifyEmail("test@example.com", "123456"))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(ex -> {
                        ResponseStatusException rse = (ResponseStatusException) ex;
                        assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
                        assertThat(rse.getReason()).contains("인증 시도 횟수를 초과했습니다");
                    });
        }

        @Test
        @DisplayName("이메일 인증 실패 - 인증 코드 미발급")
        void verifyEmail_Fail_NoCode() {
            // given
            User unverifiedUser = User.builder()
                    .email("test@example.com")
                    .isEmailVerified(false)
                    .build();

            given(userRepository.findByEmail("test@example.com")).willReturn(Optional.of(unverifiedUser));

            // when & then
            assertThatThrownBy(() -> authService.verifyEmail("test@example.com", "123456"))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(ex -> {
                        ResponseStatusException rse = (ResponseStatusException) ex;
                        assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                        assertThat(rse.getReason()).contains("인증 코드를 먼저 요청해주세요");
                    });
        }
    }

    @Nested
    @DisplayName("토큰 재발급 테스트")
    class RefreshTokenTests {

        @Test
        @DisplayName("Access Token 재발급 성공")
        void refreshAccessToken_Success() {
            // given
            String refreshTokenValue = "refreshToken";
            String tokenHash = hashToken(refreshTokenValue);

            RefreshToken refreshToken = RefreshToken.builder()
                    .user(testUser)
                    .tokenHash(tokenHash)
                    .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
                    .build();

            given(refreshTokenRepository.findByTokenHash(tokenHash))
                    .willReturn(Optional.of(refreshToken));
            given(jwtTokenProvider.createAccessToken(1L)).willReturn("newAccessToken");

            // when
            TokenPairDto result = authService.refreshAccessToken(refreshTokenValue);

            // then
            assertThat(result).isNotNull();
            assertThat(result.getUserId()).isEqualTo(1L);
            assertThat(result.getAccessToken()).isEqualTo("newAccessToken");
            assertThat(result.getRefreshToken()).isEqualTo(refreshTokenValue); // 기존 토큰 재사용
        }

        @Test
        @DisplayName("Access Token 재발급 실패 - 유효하지 않은 토큰")
        void refreshAccessToken_Fail_InvalidToken() {
            // given
            String invalidToken = "invalidToken";
            String tokenHash = hashToken(invalidToken);

            given(refreshTokenRepository.findByTokenHash(tokenHash)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> authService.refreshAccessToken(invalidToken))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(ex -> {
                        ResponseStatusException rse = (ResponseStatusException) ex;
                        assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
                        assertThat(rse.getReason()).contains("유효하지 않은 Refresh Token입니다");
                    });
        }

        @Test
        @DisplayName("Access Token 재발급 실패 - 만료된 토큰")
        void refreshAccessToken_Fail_ExpiredToken() {
            // given
            String refreshTokenValue = "refreshToken";
            String tokenHash = hashToken(refreshTokenValue);

            RefreshToken expiredToken = RefreshToken.builder()
                    .user(testUser)
                    .tokenHash(tokenHash)
                    .expiresAt(Instant.now().minus(1, ChronoUnit.DAYS)) // 이미 만료
                    .build();

            given(refreshTokenRepository.findByTokenHash(tokenHash))
                    .willReturn(Optional.of(expiredToken));

            // when & then
            assertThatThrownBy(() -> authService.refreshAccessToken(refreshTokenValue))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(ex -> {
                        ResponseStatusException rse = (ResponseStatusException) ex;
                        assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
                        assertThat(rse.getReason()).contains("Refresh Token이 만료되었습니다");
                    });

            // 만료된 토큰 삭제 확인
            verify(refreshTokenRepository).delete(expiredToken);
        }
    }

    @Nested
    @DisplayName("로그아웃 테스트")
    class LogoutTests {

        @Test
        @DisplayName("로그아웃 성공")
        void logout_Success() {
            // given
            given(userRepository.findById(1L)).willReturn(Optional.of(testUser));
            doNothing().when(refreshTokenRepository).deleteByUser(testUser);

            // when
            authService.logout(1L);

            // then
            verify(refreshTokenRepository).deleteByUser(testUser);
        }

        @Test
        @DisplayName("로그아웃 실패 - 존재하지 않는 사용자")
        void logout_Fail_UserNotFound() {
            // given
            given(userRepository.findById(999L)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> authService.logout(999L))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(ex -> {
                        ResponseStatusException rse = (ResponseStatusException) ex;
                        assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                        assertThat(rse.getReason()).contains("사용자를 찾을 수 없습니다");
                    });

            verify(refreshTokenRepository, never()).deleteByUser(any());
        }
    }

    @Nested
    @DisplayName("이메일 중복 체크 테스트")
    class CheckEmailTests {

        @Test
        @DisplayName("이메일 사용 가능")
        void checkEmailAvailable_Available() {
            // given
            given(userRepository.existsByEmail("new@example.com")).willReturn(false);

            // when
            boolean result = authService.checkEmailAvailable("new@example.com");

            // then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("이메일 이미 사용 중")
        void checkEmailAvailable_NotAvailable() {
            // given
            given(userRepository.existsByEmail("existing@example.com")).willReturn(true);

            // when
            boolean result = authService.checkEmailAvailable("existing@example.com");

            // then
            assertThat(result).isFalse();
        }
    }

    // 해시 헬퍼 메서드 (AuthService의 private 메서드와 동일한 로직)
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
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }
}
