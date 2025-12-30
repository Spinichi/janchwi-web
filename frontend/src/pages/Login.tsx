import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../shared/hooks/useAlert';

export const Login = () => {
  const navigate = useNavigate();
  const { showAlert, AlertComponent } = useAlert();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API 연동
    console.log('Login attempt:', { email, password });
  };

  const handleOAuthLogin = () => {
    showAlert('소셜 로그인 기능은 추후 구현 예정입니다.');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Image */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(/Login.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(1px) brightness(0.5)',
        zIndex: -2
      }} />

      {/* Dark Overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at top, rgba(234, 145, 78, 0.12) 0%, transparent 50%), linear-gradient(180deg, rgba(15, 15, 20, 0.5) 0%, rgba(10, 10, 15, 0.7) 100%)',
        zIndex: -1
      }} />

      {/* Login Container */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          cursor: 'pointer'
        }}
        onClick={() => navigate('/')}>
          <img
            src="/janchwi-logo.png"
            alt="잔취"
            style={{
              width: '120px',
              height: '120px',
              margin: '0 auto',
              objectFit: 'contain'
            }}
          />
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '500',
            color: '#D4C5A9',
            marginTop: '1rem',
            fontFamily: "'Noto Serif KR', serif"
          }}>
            잔취
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#A39178',
            marginTop: '0.5rem',
            fontFamily: "'Noto Serif KR', serif"
          }}>
            오늘 밤의 이야기를 나눠보세요
          </p>
        </div>

        {/* Login Form */}
        <div style={{
          background: 'rgba(20, 20, 25, 0.6)',
          backdropFilter: 'blur(12px)',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          border: '1px solid rgba(180, 160, 134, 0.2)'
        }}>
          <form onSubmit={handleLogin}>
            {/* Email Input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#D4C5A9',
                marginBottom: '0.5rem',
                fontFamily: "'Noto Serif KR', serif"
              }}>
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(180, 160, 134, 0.3)',
                  background: 'rgba(15, 15, 20, 0.6)',
                  color: '#E8DCC0',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.3s',
                  fontFamily: "'Noto Serif KR', serif"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(180, 160, 134, 0.6)';
                  e.target.style.background = 'rgba(15, 15, 20, 0.8)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(180, 160, 134, 0.3)';
                  e.target.style.background = 'rgba(15, 15, 20, 0.6)';
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#D4C5A9',
                marginBottom: '0.5rem',
                fontFamily: "'Noto Serif KR', serif"
              }}>
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(180, 160, 134, 0.3)',
                  background: 'rgba(15, 15, 20, 0.6)',
                  color: '#E8DCC0',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.3s',
                  fontFamily: "'Noto Serif KR', serif"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(180, 160, 134, 0.6)';
                  e.target.style.background = 'rgba(15, 15, 20, 0.8)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(180, 160, 134, 0.3)';
                  e.target.style.background = 'rgba(15, 15, 20, 0.6)';
                }}
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(180, 160, 134, 0.5)',
                background: 'rgba(180, 160, 134, 0.3)',
                backdropFilter: 'blur(10px)',
                color: '#E8DCC0',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                fontFamily: "'Noto Serif KR', serif"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(180, 160, 134, 0.5)';
                e.currentTarget.style.borderColor = 'rgba(180, 160, 134, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(180, 160, 134, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(180, 160, 134, 0.5)';
              }}
            >
              로그인
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '2rem 0',
            gap: '1rem'
          }}>
            <div style={{
              flex: 1,
              height: '1px',
              background: 'rgba(180, 160, 134, 0.2)'
            }} />
            <span style={{
              fontSize: '0.875rem',
              color: '#A39178',
              fontFamily: "'Noto Serif KR', serif"
            }}>
              간편 로그인
            </span>
            <div style={{
              flex: 1,
              height: '1px',
              background: 'rgba(180, 160, 134, 0.2)'
            }} />
          </div>

          {/* OAuth Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Kakao */}
            <button
              onClick={handleOAuthLogin}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: '#FEE500',
                color: '#000000',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontFamily: "'Noto Serif KR', serif"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FDD835';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FEE500';
              }}
            >
              <img src="/kakao.png" alt="Kakao" style={{ width: '20px', height: '20px' }} />
              카카오로 시작하기
            </button>

            {/* Naver */}
            <button
              onClick={handleOAuthLogin}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: '#03C75A',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontFamily: "'Noto Serif KR', serif"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#02B350';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#03C75A';
              }}
            >
              <img src="/naver.png" alt="Naver" style={{ width: '20px', height: '20px' }} />
              네이버로 시작하기
            </button>

            {/* Google */}
            <button
              onClick={handleOAuthLogin}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(180, 160, 134, 0.3)',
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#1f1f1f',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontFamily: "'Noto Serif KR', serif"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
              }}
            >
              <img src="/google.png" alt="Google" style={{ width: '20px', height: '20px' }} />
              Google로 시작하기
            </button>
          </div>

          {/* Sign Up Link */}
          <div style={{
            textAlign: 'center',
            marginTop: '2rem'
          }}>
            <span style={{
              fontSize: '0.875rem',
              color: '#A39178',
              fontFamily: "'Noto Serif KR', serif"
            }}>
              계정이 없으신가요?{' '}
            </span>
            <button
              onClick={() => navigate('/signup')}
              style={{
                background: 'none',
                border: 'none',
                color: '#D4C5A9',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontFamily: "'Noto Serif KR', serif"
              }}
            >
              회원가입
            </button>
          </div>
        </div>
      </div>

      {/* Alert Component */}
      {AlertComponent}
    </div>
  );
};
