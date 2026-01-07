package site.janchwi.domain.users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import site.janchwi.domain.users.entity.User;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByNickname(String nickname);

    /**
     * 로그인 실패 횟수 증가 및 계정 잠금 처리 (원자적 업데이트)
     * @param userId 사용자 ID
     * @param maxFailAttempts 최대 실패 횟수
     * @param lockUntil 계정 잠금 해제 시간
     * @return 업데이트된 행 수
     */
    @Modifying
    @Query("""
        UPDATE User u
        SET u.failedLoginAttempts = u.failedLoginAttempts + 1,
            u.accountLockedUntil = CASE
                WHEN (u.failedLoginAttempts + 1) >= :maxFailAttempts THEN :lockUntil
                ELSE u.accountLockedUntil
            END
        WHERE u.id = :userId
    """)
    int incrementFailedLoginAttempts(
        @Param("userId") Long userId,
        @Param("maxFailAttempts") int maxFailAttempts,
        @Param("lockUntil") Instant lockUntil
    );

    /**
     * 로그인 성공 시 실패 횟수 리셋 및 계정 잠금 해제 (원자적 업데이트)
     * @param userId 사용자 ID
     * @param lastLoginAt 마지막 로그인 시간
     * @return 업데이트된 행 수
     */
    @Modifying
    @Query("""
        UPDATE User u
        SET u.failedLoginAttempts = 0,
            u.accountLockedUntil = NULL,
            u.lastLoginAt = :lastLoginAt
        WHERE u.id = :userId
    """)
    int resetFailedLoginAttempts(
        @Param("userId") Long userId,
        @Param("lastLoginAt") Instant lastLoginAt
    );
}
