package site.janchwi.domain.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import site.janchwi.domain.users.repository.UserRepository;
import site.janchwi.global.common.Constants;

import java.time.Instant;

/**
 * 로그인 시도 카운팅 전용 서비스
 * REQUIRES_NEW 트랜잭션으로 부모 트랜잭션 롤백과 무관하게 실패 횟수 저장
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    private final UserRepository userRepository;

    /**
     * 로그인 실패 시 호출
     * - 실패 횟수 +1 (원자적 업데이트)
     * - 최대 횟수 도달 시 자동 계정 잠금
     * - 별도 트랜잭션으로 반드시 커밋됨
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onLoginFailure(Long userId) {
        Instant lockUntil = Instant.now().plusSeconds(Constants.ACCOUNT_LOCK_DURATION_MINUTES * 60L);

        int updated = userRepository.incrementFailedLoginAttempts(
            userId,
            Constants.MAX_LOGIN_ATTEMPTS,
            lockUntil
        );

        if (updated > 0) {
            log.debug("로그인 실패 횟수 증가: userId={}", userId);
        } else {
            log.warn("로그인 실패 카운트 업데이트 실패: userId={} (사용자 없음)", userId);
        }
    }

    /**
     * 로그인 성공 시 호출
     * - 실패 횟수 리셋
     * - 계정 잠금 해제
     * - 마지막 로그인 시간 업데이트
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onLoginSuccess(Long userId) {
        Instant now = Instant.now();

        int updated = userRepository.resetFailedLoginAttempts(userId, now);

        if (updated > 0) {
            log.debug("로그인 성공 - 실패 횟수 리셋: userId={}", userId);
        } else {
            log.warn("로그인 성공 카운트 리셋 실패: userId={} (사용자 없음)", userId);
        }
    }
}
