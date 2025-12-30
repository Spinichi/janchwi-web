package site.janchwi.global.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import site.janchwi.domain.refreshtokens.repository.RefreshTokenRepository;

import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class TokenCleanupScheduler {

    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * 만료된 Refresh Token 정리
     * - 매일 한국 시간(KST) 기준 새벽 3시 실행
     * - zone="Asia/Seoul"로 명시적 지정하여 서버 타임존과 무관하게 동작
     */
    @Scheduled(cron = "0 0 3 * * *", zone = "Asia/Seoul")
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("만료된 Refresh Token 정리 시작");

        long deletedCount = refreshTokenRepository.deleteByExpiresAtBefore(Instant.now());

        log.info("만료된 Refresh Token 정리 완료: {}개 삭제", deletedCount);
    }
}
