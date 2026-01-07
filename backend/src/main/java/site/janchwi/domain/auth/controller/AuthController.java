package site.janchwi.domain.auth.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import site.janchwi.domain.auth.dto.*;
import site.janchwi.domain.auth.service.AuthService;
import site.janchwi.global.util.CookieUtils;
import site.janchwi.global.util.SecurityUtils;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SecurityUtils securityUtils;

    /**
     * 로그인
     * POST /v1/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        TokenPairDto tokenPair = authService.login(request);

        // Refresh Token을 HttpOnly 쿠키로 설정
        ResponseCookie refreshTokenCookie = CookieUtils.createRefreshTokenCookie(tokenPair.getRefreshToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenPair.getAccessToken())
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .body(new LoginResponse(tokenPair.getUserId()));
    }

    /**
     * 회원가입
     * POST /v1/auth/signup
     */
    @PostMapping("/signup")
    public ResponseEntity<LoginResponse> signup(@Valid @RequestBody SignupRequest request) {
        Long userId = authService.signup(request);

        // userId만 반환 (토큰은 이메일 인증 후 로그인 시 발급)
        return ResponseEntity.ok()
                .body(new LoginResponse(userId));
    }

    /**
     * 이메일 중복 체크
     * GET /v1/auth/check-email?email=test@example.com
     */
    @GetMapping("/check-email")
    public ResponseEntity<CheckEmailResponse> checkEmail(
            @RequestParam @NotBlank(message = "이메일을 입력해주세요.") @Email(message = "올바른 이메일 형식이 아닙니다.") String email
    ) {
        boolean available = authService.checkEmailAvailable(email);
        return ResponseEntity.ok(new CheckEmailResponse(available));
    }

    /**
     * 이메일 인증 코드 발송
     * POST /v1/auth/send-verification
     */
    @PostMapping("/send-verification")
    public ResponseEntity<MessageResponse> sendVerificationCode(@Valid @RequestBody SendVerificationRequest request) {
        authService.sendVerificationCode(request.getEmail());
        return ResponseEntity.ok(new MessageResponse("인증 코드가 발송되었습니다."));
    }

    /**
     * 이메일 인증 코드 검증 (인증 성공 시 자동 로그인)
     * POST /v1/auth/verify-email
     */
    @PostMapping("/verify-email")
    public ResponseEntity<LoginResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        TokenPairDto tokenPair = authService.verifyEmail(request.getEmail(), request.getCode());

        // Refresh Token 쿠키 생성
        ResponseCookie refreshTokenCookie = CookieUtils.createRefreshTokenCookie(tokenPair.getRefreshToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenPair.getAccessToken())
                .body(new LoginResponse(tokenPair.getUserId()));
    }

    /**
     * Access Token 재발급
     * POST /v1/auth/refresh
     */
    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refreshAccessToken(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalArgumentException("Refresh Token이 필요합니다.");
        }

        TokenPairDto tokenPair = authService.refreshAccessToken(refreshToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenPair.getAccessToken())
                .body(new RefreshTokenResponse(tokenPair.getAccessToken()));
    }

    /**
     * 로그아웃
     * POST /v1/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout() {
        Long userId = securityUtils.getCurrentUserId();
        authService.logout(userId);

        // Refresh Token 쿠키 삭제
        ResponseCookie deleteCookie = CookieUtils.deleteRefreshTokenCookie();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .body(new MessageResponse("로그아웃되었습니다."));
    }
}
