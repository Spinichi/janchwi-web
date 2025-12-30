import { useEffect } from 'react';

interface AlertProps {
  message: string;
  onClose: () => void;
}

export const Alert = ({ message, onClose }: AlertProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Alert Box */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'rgba(20, 20, 25, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1rem',
            border: '1px solid rgba(180, 160, 134, 0.3)',
            padding: '2rem',
            minWidth: '320px',
            maxWidth: '400px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          {/* Message */}
          <p style={{
            color: '#E8DCC0',
            fontSize: '0.9375rem',
            lineHeight: '1.6',
            textAlign: 'center',
            marginBottom: '1.5rem',
            fontFamily: "'Noto Serif KR', serif",
            whiteSpace: 'pre-wrap'
          }}>
            {message}
          </p>

          {/* Confirm Button */}
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(180, 160, 134, 0.5)',
              background: 'rgba(180, 160, 134, 0.3)',
              backdropFilter: 'blur(10px)',
              color: '#E8DCC0',
              fontSize: '0.9375rem',
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
            확인
          </button>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};
