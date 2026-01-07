package site.janchwi.domain.auth.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import site.janchwi.domain.users.repository.UserRepository;
import site.janchwi.global.common.Constants;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("LoginAttemptService 테스트")
class LoginAttemptServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private LoginAttemptService loginAttemptService;

    @Test
    @DisplayName("로그인 실패 시 실패 횟수 증가 - 원자적 업데이트")
    void onLoginFailure_IncrementFailedAttempts() {
        // given
        Long userId = 1L;
        given(userRepository.incrementFailedLoginAttempts(anyLong(), anyInt(), any(Instant.class)))
                .willReturn(1);

        // when
        loginAttemptService.onLoginFailure(userId);

        // then
        ArgumentCaptor<Long> userIdCaptor = ArgumentCaptor.forClass(Long.class);
        ArgumentCaptor<Integer> maxAttemptsCaptor = ArgumentCaptor.forClass(Integer.class);
        ArgumentCaptor<Instant> lockUntilCaptor = ArgumentCaptor.forClass(Instant.class);

        verify(userRepository).incrementFailedLoginAttempts(
                userIdCaptor.capture(),
                maxAttemptsCaptor.capture(),
                lockUntilCaptor.capture()
        );

        // 올바른 파라미터로 호출되었는지 검증
        assertThat(userIdCaptor.getValue()).isEqualTo(userId);
        assertThat(maxAttemptsCaptor.getValue()).isEqualTo(Constants.MAX_LOGIN_ATTEMPTS);

        // lockUntil이 현재 시간 + 30분인지 확인 (±5초 오차 허용)
        Instant expectedLockUntil = Instant.now().plusSeconds(Constants.ACCOUNT_LOCK_DURATION_MINUTES * 60L);
        assertThat(lockUntilCaptor.getValue())
                .isBetween(
                        expectedLockUntil.minusSeconds(5),
                        expectedLockUntil.plusSeconds(5)
                );
    }

    @Test
    @DisplayName("로그인 실패 - 존재하지 않는 사용자 (업데이트 실패)")
    void onLoginFailure_UserNotFound() {
        // given
        Long nonExistentUserId = 999L;
        given(userRepository.incrementFailedLoginAttempts(anyLong(), anyInt(), any(Instant.class)))
                .willReturn(0); // 업데이트된 행 수 0

        // when
        loginAttemptService.onLoginFailure(nonExistentUserId);

        // then
        // 예외가 발생하지 않고 조용히 처리됨
        verify(userRepository).incrementFailedLoginAttempts(anyLong(), anyInt(), any(Instant.class));
    }

    @Test
    @DisplayName("로그인 성공 시 실패 횟수 리셋 및 계정 잠금 해제")
    void onLoginSuccess_ResetFailedAttempts() {
        // given
        Long userId = 1L;
        given(userRepository.resetFailedLoginAttempts(anyLong(), any(Instant.class)))
                .willReturn(1);

        // when
        loginAttemptService.onLoginSuccess(userId);

        // then
        ArgumentCaptor<Long> userIdCaptor = ArgumentCaptor.forClass(Long.class);
        ArgumentCaptor<Instant> lastLoginAtCaptor = ArgumentCaptor.forClass(Instant.class);

        verify(userRepository).resetFailedLoginAttempts(
                userIdCaptor.capture(),
                lastLoginAtCaptor.capture()
        );

        // 올바른 파라미터로 호출되었는지 검증
        assertThat(userIdCaptor.getValue()).isEqualTo(userId);

        // lastLoginAt이 현재 시간인지 확인 (±5초 오차 허용)
        Instant expectedLastLoginAt = Instant.now();
        assertThat(lastLoginAtCaptor.getValue())
                .isBetween(
                        expectedLastLoginAt.minusSeconds(5),
                        expectedLastLoginAt.plusSeconds(5)
                );
    }

    @Test
    @DisplayName("로그인 성공 - 존재하지 않는 사용자 (업데이트 실패)")
    void onLoginSuccess_UserNotFound() {
        // given
        Long nonExistentUserId = 999L;
        given(userRepository.resetFailedLoginAttempts(anyLong(), any(Instant.class)))
                .willReturn(0); // 업데이트된 행 수 0

        // when
        loginAttemptService.onLoginSuccess(nonExistentUserId);

        // then
        // 예외가 발생하지 않고 조용히 처리됨
        verify(userRepository).resetFailedLoginAttempts(anyLong(), any(Instant.class));
    }

    @Test
    @DisplayName("로그인 실패 시 Constants.MAX_LOGIN_ATTEMPTS 값 사용 확인")
    void onLoginFailure_UsesCorrectMaxAttempts() {
        // given
        Long userId = 1L;
        given(userRepository.incrementFailedLoginAttempts(anyLong(), anyInt(), any(Instant.class)))
                .willReturn(1);

        // when
        loginAttemptService.onLoginFailure(userId);

        // then
        ArgumentCaptor<Integer> maxAttemptsCaptor = ArgumentCaptor.forClass(Integer.class);
        verify(userRepository).incrementFailedLoginAttempts(
                anyLong(),
                maxAttemptsCaptor.capture(),
                any(Instant.class)
        );

        // Constants.MAX_LOGIN_ATTEMPTS (5회) 사용 확인
        assertThat(maxAttemptsCaptor.getValue()).isEqualTo(5);
    }

    @Test
    @DisplayName("로그인 실패 시 Constants.ACCOUNT_LOCK_DURATION_MINUTES 값 사용 확인")
    void onLoginFailure_UsesCorrectLockDuration() {
        // given
        Long userId = 1L;
        given(userRepository.incrementFailedLoginAttempts(anyLong(), anyInt(), any(Instant.class)))
                .willReturn(1);

        // when
        loginAttemptService.onLoginFailure(userId);

        // then
        ArgumentCaptor<Instant> lockUntilCaptor = ArgumentCaptor.forClass(Instant.class);
        verify(userRepository).incrementFailedLoginAttempts(
                anyLong(),
                anyInt(),
                lockUntilCaptor.capture()
        );

        // 30분 후 잠금 해제 확인 (Constants.ACCOUNT_LOCK_DURATION_MINUTES = 30)
        Instant expectedLockUntil = Instant.now().plusSeconds(30 * 60L);
        assertThat(lockUntilCaptor.getValue())
                .isBetween(
                        expectedLockUntil.minusSeconds(5),
                        expectedLockUntil.plusSeconds(5)
                );
    }
}
