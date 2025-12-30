package site.janchwi.global.common;

public final class Constants {

    private Constants() {
        throw new UnsupportedOperationException("Constants class cannot be instantiated");
    }

    // 이메일 인증 관련
    public static final int EMAIL_VERIFICATION_CODE_LENGTH = 6;
    public static final int EMAIL_VERIFICATION_EXPIRY_MINUTES = 15;
    public static final int EMAIL_VERIFICATION_MAX_ATTEMPTS = 5;
    public static final int EMAIL_VERIFICATION_CODE_MIN = 100000;
    public static final int EMAIL_VERIFICATION_CODE_MAX = 999999;

    // 토큰 관련
    public static final int REFRESH_TOKEN_EXPIRY_DAYS = 7;
    public static final int REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7일

    // 비밀번호 관련
    public static final int PASSWORD_MIN_LENGTH = 8;
    public static final int PASSWORD_MAX_LENGTH = 20;

    // 닉네임 관련
    public static final int NICKNAME_MIN_LENGTH = 2;
    public static final int NICKNAME_MAX_LENGTH = 20;

    // 자기소개 관련
    public static final int BIO_MAX_LENGTH = 50;

    // 나이 제한
    public static final int MINIMUM_AGE = 19;

    // 계정 잠금 관련
    public static final int MAX_LOGIN_ATTEMPTS = 5;
    public static final int ACCOUNT_LOCK_DURATION_MINUTES = 30;

    // 쿠키 관련
    public static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
    public static final String COOKIE_PATH = "/";
    public static final String COOKIE_SAME_SITE = "None";
}
