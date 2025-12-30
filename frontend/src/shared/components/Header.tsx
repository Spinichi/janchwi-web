import { Search, MessageCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 left-0 w-full z-50" style={{
      background: 'rgba(15, 15, 20, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(234, 145, 78, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '100%',
        margin: '0 auto',
        padding: '0.875rem 3rem',
        height: '64px'
      }}>
        {/* Left: Logo */}
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}
        >
          <img
            src="/janchwi-logo-NB.png"
            alt="잔취"
            style={{ height: '64px', width: 'auto' }}
          />
        </div>

        {/* Center: Search */}
        <div style={{ position: 'relative', width: '480px' }}>
          <Search style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            height: '16px',
            width: '16px',
            color: '#9ca3af',
            pointerEvents: 'none'
          }} />
          <input
            type="text"
            placeholder="와인, 위스키, 칵테일 검색..."
            style={{
              width: '100%',
              height: '44px',
              paddingLeft: '2.75rem',
              paddingRight: '1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#E8DCC0',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'all 0.3s',
              lineHeight: '1'
            }}
            onFocus={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.12)';
            }}
            onBlur={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.08)';
            }}
          />
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            color: '#E8DCC0',
            height: '36px',
            width: '36px'
          }}>
            <MessageCircle style={{ height: '20px', width: '20px' }} />
          </button>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            color: '#E8DCC0',
            height: '36px',
            width: '36px'
          }}>
            <User style={{ height: '20px', width: '20px' }} />
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 1.5rem',
              height: '36px',
              borderRadius: '0.5rem',
              border: '1px solid rgba(180, 160, 134, 0.5)',
              background: 'rgba(180, 160, 134, 0.3)',
              backdropFilter: 'blur(10px)',
              color: '#E8DCC0',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              lineHeight: '1',
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
        </div>
      </div>
    </header>
  );
};
