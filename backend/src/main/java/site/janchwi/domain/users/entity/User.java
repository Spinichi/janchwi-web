package site.janchwi.domain.users.entity;

import jakarta.persistence.*;
import lombok.*;
import site.janchwi.global.common.BaseEntity;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 60)
    private String password; // BCrypt 해시 길이

    @Column(nullable = false, unique = true, length = 10)
    private String nickname;

    @Column(nullable = false)
    private LocalDate birthDate;

    @Column(length = 500)
    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;

    @Column(length = 50)
    private String bio;

    // 이메일 인증 관련
    @Column(nullable = false)
    @Builder.Default
    private boolean isEmailVerified = false;

    @Column(length = 255)
    private String emailVerificationCodeHash; // 6자리 인증 코드의 SHA-256 해시

    @Column
    private Instant emailVerificationExpiry;

    @Column(nullable = false)
    @Builder.Default
    private Integer verificationAttempts = 0; // 인증 시도 횟수 (브루트포스 방지)

    // 계정 상태 관련
    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true; // 계정 활성화 상태

    @Column
    private Instant lastLoginAt; // 마지막 로그인 시간

    @Column(nullable = false)
    @Builder.Default
    private Integer failedLoginAttempts = 0; // 로그인 실패 횟수

    @Column
    private Instant accountLockedUntil; // 계정 잠금 해제 시간

    /**
     * 이메일 인증 완료 처리
     */
    public void verifyEmail() {
        this.isEmailVerified = true;
        this.emailVerificationCodeHash = null;
        this.emailVerificationExpiry = null;
        this.verificationAttempts = 0;
    }

    /**
     * 이메일 인증 코드 설정 (해시로 저장)
     */
    public void setEmailVerificationCode(String codeHash, Instant expiry) {
        this.emailVerificationCodeHash = codeHash;
        this.emailVerificationExpiry = expiry;
        this.verificationAttempts = 0; // 새 코드 발급 시 시도 횟수 초기화
    }

    /**
     * 인증 시도 횟수 증가
     */
    public void incrementVerificationAttempts() {
        this.verificationAttempts++;
    }

    /**
     * 인증 시도 횟수 초과 확인 (최대 5회)
     */
    public boolean isVerificationAttemptsExceeded() {
        return this.verificationAttempts >= 5;
    }

    /**
     * 로그인 성공 처리
     */
    public void onLoginSuccess() {
        this.lastLoginAt = Instant.now();
        this.failedLoginAttempts = 0;
        this.accountLockedUntil = null;
    }

    /**
     * 로그인 실패 처리
     */
    public void onLoginFailure() {
        this.failedLoginAttempts++;
    }

    /**
     * 계정 잠금 처리
     */
    public void lockAccount(int durationMinutes) {
        this.accountLockedUntil = Instant.now().plusSeconds(durationMinutes * 60L);
    }

    /**
     * 계정 잠금 여부 확인
     */
    public boolean isAccountLocked() {
        if (accountLockedUntil == null) {
            return false;
        }
        return Instant.now().isBefore(accountLockedUntil);
    }

    /**
     * 이메일 인증 만료 확인 (Null 체크 포함)
     */
    public boolean isEmailVerificationExpired() {
        if (emailVerificationExpiry == null) {
            return true;
        }
        return emailVerificationExpiry.isBefore(Instant.now());
    }
}
