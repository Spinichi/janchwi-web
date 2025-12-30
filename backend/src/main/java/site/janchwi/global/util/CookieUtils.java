package site.janchwi.global.util;

import org.springframework.http.ResponseCookie;
import site.janchwi.global.common.Constants;

public final class CookieUtils {

    private CookieUtils() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }

    /**
     * Refresh Token 쿠키 생성
     */
    public static ResponseCookie createRefreshTokenCookie(String refreshToken) {
        return ResponseCookie.from(Constants.REFRESH_TOKEN_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .secure(true) // HTTPS에서만 전송
                .sameSite(Constants.COOKIE_SAME_SITE) // CORS 환경에서 쿠키 전송 허용
                .path(Constants.COOKIE_PATH)
                .maxAge(Constants.REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS)
                .build();
    }

    /**
     * Refresh Token 쿠키 삭제용 쿠키 생성
     */
    public static ResponseCookie deleteRefreshTokenCookie() {
        return ResponseCookie.from(Constants.REFRESH_TOKEN_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(true)
                .sameSite(Constants.COOKIE_SAME_SITE)
                .path(Constants.COOKIE_PATH)
                .maxAge(0) // 즉시 만료
                .build();
    }
}
