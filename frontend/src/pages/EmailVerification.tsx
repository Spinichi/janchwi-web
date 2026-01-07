import { useState, useRef, useEffect, FormEvent, KeyboardEvent, ClipboardEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { verifyEmail, sendVerificationCode } from '../shared/api/authApi';
import { getErrorMessage } from '../shared/utils/errorHandler';
import { useAlert } from '../shared/hooks/useAlert';
import { useAuthStore } from '../stores/authStore';
import type { User } from '../shared/types/auth.types';

export const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert, AlertComponent } = useAlert();
  const authStore = useAuthStore();

  // location.state에서 이메일 가져오기
  const email = location.state?.email as string | undefined;

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false); // 코드 발송 여부
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 이메일 인증 mutation (인증 성공 시 자동 로그인)
  const verifyMutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: ({ response, accessToken }) => {
      // 임시 User 객체 생성 (userId와 email만 있음)
      const tempUser: User = {
        id: response.userId,
        email: email!,
        nickname: '',
        birthDate: '',
        gender: 'other' as const,
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      authStore.login(tempUser, accessToken);

      showAlert('이메일 인증이 완료되었습니다.\n메인 페이지로 이동합니다.', () => {
        navigate('/home');
      });
    },
    onError: async (error) => {
      const message = await getErrorMessage(error);
      showAlert(message);
    },
  });

  // 인증 코드 발송 mutation (첫 발송)
  const sendCodeMutation = useMutation({
    mutationFn: sendVerificationCode,
    onSuccess: () => {
      showAlert('인증 코드가 발송되었습니다.\n이메일을 확인해주세요.');
      setIsCodeSent(true);
      setCountdown(60);
      setCanResend(false);
    },
    onError: async (error) => {
      const message = await getErrorMessage(error);
      showAlert(message);
    },
  });

  // 인증 코드 재발송 mutation
  const resendMutation = useMutation({
    mutationFn: sendVerificationCode,
    onSuccess: () => {
      showAlert('인증 코드가 재발송되었습니다.');
      setCountdown(60);
      setCanResend(false);
    },
    onError: async (error) => {
      const message = await getErrorMessage(error);
      showAlert(message);
    },
  });

  // 카운트다운 타이머 (코드 발송 후에만 작동)
  useEffect(() => {
    if (isCodeSent && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isCodeSent && countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, isCodeSent]);

  // 이메일이 없으면 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  // 입력 처리
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // 숫자만 허용

    const newCode = [...code];
    newCode[index] = value.slice(-1); // 마지막 한 글자만
    setCode(newCode);

    // 다음 입력으로 자동 포커스
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // 6자리 모두 입력되면 자동 제출
    if (newCode.every((digit) => digit !== '') && index === 5) {
      handleSubmit(new Event('submit') as any, newCode.join(''));
    }
  };

  // Backspace 처리
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 붙여넣기 처리
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();

      // 자동 제출
      handleSubmit(new Event('submit') as any, pastedData);
    }
  };

  // 제출 처리
  const handleSubmit = (e: FormEvent, fullCode?: string) => {
    e.preventDefault();
    const verificationCode = fullCode || code.join('');

    if (verificationCode.length !== 6) {
      showAlert('6자리 인증 코드를 입력해주세요.');
      return;
    }

    if (!email) {
      showAlert('이메일 정보가 없습니다.');
      return;
    }

    verifyMutation.mutate({ email, code: verificationCode });
  };

  // 재발송 처리
  const handleResend = () => {
    if (!email) return;
    resendMutation.mutate({ email });
  };

  // 인증 코드 발송 처리
  const handleSendCode = () => {
    if (!email) return;
    sendCodeMutation.mutate({ email });
  };

  if (!email) return null;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Image */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/Login.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(1px) brightness(0.5)',
          zIndex: -2,
        }}
      />

      {/* Dark Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(ellipse at top, rgba(234, 145, 78, 0.12) 0%, transparent 50%), linear-gradient(180deg, rgba(15, 15, 20, 0.5) 0%, rgba(10, 10, 15, 0.7) 100%)',
          zIndex: -1,
        }}
      />

      {/* Verification Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          margin: '0 auto',
          padding: '2rem',
        }}
      >
        {/* Logo */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '3rem',
          }}
        >
          <img
            src="/janchwi-logo.png"
            alt="잔취"
            style={{
              width: '120px',
              height: '120px',
              margin: '0 auto',
              objectFit: 'contain',
            }}
          />
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: '500',
              color: '#D4C5A9',
              marginTop: '1rem',
              fontFamily: "'Noto Serif KR', serif",
            }}
          >
            이메일 인증
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#A39178',
              marginTop: '0.5rem',
              fontFamily: "'Noto Serif KR', serif",
            }}
          >
            {email}으로 발송된 6자리 코드를 입력해주세요
          </p>
        </div>

        {/* Verification Form */}
        <div
          style={{
            background: 'rgba(20, 20, 25, 0.6)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            border: '1px solid rgba(180, 160, 134, 0.2)',
          }}
        >
          {!isCodeSent ? (
            // 인증 코드 받기 버튼 (코드 발송 전)
            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontSize: '0.938rem',
                  color: '#A39178',
                  marginBottom: '2rem',
                  lineHeight: '1.6',
                  fontFamily: "'Noto Serif KR', serif",
                }}
              >
                이메일 인증을 위해 먼저 인증 코드를 받아주세요.
              </p>
              <button
                onClick={handleSendCode}
                disabled={sendCodeMutation.isPending}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(180, 160, 134, 0.5)',
                  background: sendCodeMutation.isPending
                    ? 'rgba(180, 160, 134, 0.2)'
                    : 'rgba(180, 160, 134, 0.3)',
                  backdropFilter: 'blur(10px)',
                  color: '#E8DCC0',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: sendCodeMutation.isPending ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  fontFamily: "'Noto Serif KR', serif",
                  opacity: sendCodeMutation.isPending ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!sendCodeMutation.isPending) {
                    e.currentTarget.style.background = 'rgba(180, 160, 134, 0.5)';
                    e.currentTarget.style.borderColor = 'rgba(180, 160, 134, 0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!sendCodeMutation.isPending) {
                    e.currentTarget.style.background = 'rgba(180, 160, 134, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(180, 160, 134, 0.5)';
                  }
                }}
              >
                {sendCodeMutation.isPending ? '발송 중...' : '인증 코드 받기'}
              </button>
            </div>
          ) : (
            // 인증 코드 입력 폼 (코드 발송 후)
            <>
            <form onSubmit={handleSubmit}>
            {/* Code Inputs */}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
                marginBottom: '2rem',
              }}
            >
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  style={{
                    width: '3rem',
                    height: '3.5rem',
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    borderRadius: '0.75rem',
                    border: '2px solid rgba(180, 160, 134, 0.3)',
                    background: 'rgba(15, 15, 20, 0.6)',
                    color: '#E8DCC0',
                    outline: 'none',
                    transition: 'all 0.3s',
                    fontFamily: "'Noto Serif KR', serif",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(180, 160, 134, 0.8)';
                    e.target.style.background = 'rgba(15, 15, 20, 0.8)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(180, 160, 134, 0.3)';
                    e.target.style.background = 'rgba(15, 15, 20, 0.6)';
                  }}
                />
              ))}
            </div>

            {/* Info Text */}
            <p
              style={{
                fontSize: '0.813rem',
                color: '#A39178',
                textAlign: 'center',
                marginBottom: '1.5rem',
                fontFamily: "'Noto Serif KR', serif",
              }}
            >
              인증 코드는 15분간 유효하며, 최대 5회 시도 가능합니다.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={verifyMutation.isPending}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(180, 160, 134, 0.5)',
                background: verifyMutation.isPending
                  ? 'rgba(180, 160, 134, 0.2)'
                  : 'rgba(180, 160, 134, 0.3)',
                backdropFilter: 'blur(10px)',
                color: '#E8DCC0',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: verifyMutation.isPending ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                fontFamily: "'Noto Serif KR', serif",
                opacity: verifyMutation.isPending ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!verifyMutation.isPending) {
                  e.currentTarget.style.background = 'rgba(180, 160, 134, 0.5)';
                  e.currentTarget.style.borderColor = 'rgba(180, 160, 134, 0.8)';
                }
              }}
              onMouseLeave={(e) => {
                if (!verifyMutation.isPending) {
                  e.currentTarget.style.background = 'rgba(180, 160, 134, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(180, 160, 134, 0.5)';
                }
              }}
            >
              {verifyMutation.isPending ? '인증 중...' : '인증하기'}
            </button>
          </form>

          {/* Resend Section */}
          <div
            style={{
              marginTop: '1.5rem',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '0.875rem',
                color: '#A39178',
                marginBottom: '0.5rem',
                fontFamily: "'Noto Serif KR', serif",
              }}
            >
              {canResend ? '인증 코드를 받지 못하셨나요?' : `${countdown}초 후 재발송 가능`}
            </p>
            <button
              onClick={handleResend}
              disabled={!canResend || resendMutation.isPending}
              style={{
                background: 'none',
                border: 'none',
                color: canResend ? '#D4C5A9' : '#666',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: canResend && !resendMutation.isPending ? 'pointer' : 'not-allowed',
                textDecoration: 'underline',
                fontFamily: "'Noto Serif KR', serif",
                opacity: canResend && !resendMutation.isPending ? 1 : 0.5,
              }}
            >
              {resendMutation.isPending ? '발송 중...' : '인증 코드 재발송'}
            </button>
          </div>
          </>
          )}
        </div>
      </div>

      {/* Alert Component */}
      {AlertComponent}
    </div>
  );
};
