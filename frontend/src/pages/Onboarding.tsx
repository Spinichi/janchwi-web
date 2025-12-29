import { useRouter } from '../router';

export const Onboarding = () => {
  const { navigate } = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
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
        backgroundImage: 'url(/Onboarding.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.6)',
        zIndex: -2
      }} />

      {/* Dark Overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(10, 10, 15, 0.4)',
        zIndex: -1
      }} />

      {/* Hero Section */}
      <section style={{ position: 'relative', padding: '5rem 0', zIndex: 1 }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '3rem',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h1 style={{
                fontSize: '3rem',
                fontWeight: '500',
                color: '#D4C5A9',
                lineHeight: '1.3',
                fontFamily: "'Noto Serif KR', serif"
              }}>
                술의 여운을
                <br />
                <span style={{ color: '#B8A086', fontWeight: '400' }}>기록하고 공유하세요</span>
              </h1>

              <p style={{
                color: '#A39178',
                fontSize: '1.125rem',
                lineHeight: '1.8',
                fontWeight: '300'
              }}>
                한 잔의 술에 담긴 이야기를 기록하고,
                <br />
                같은 취향을 가진 사람들과 소통하세요.
                <br />
                와인부터 위스키, 칵테일까지 모든 술의 여운을
                <br />
                잔취에서 나눠보세요.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => navigate('/home')}
                style={{
                  background: 'rgba(180, 160, 134, 0.3)',
                  color: '#E8DCC0',
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(180, 160, 134, 0.5)',
                  fontWeight: '500',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  backdropFilter: 'blur(10px)',
                  fontFamily: "'Noto Serif KR', serif"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(180, 160, 134, 0.5)';
                  e.currentTarget.style.borderColor = 'rgba(180, 160, 134, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(180, 160, 134, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(180, 160, 134, 0.5)';
                }}>
                바로 입장하기
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '400px',
              height: '400px',
              background: 'rgba(20, 20, 25, 0.4)',
              borderRadius: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(180, 160, 134, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <img
                src="/janchwi-logo.png"
                alt="잔취"
                style={{
                  width: '80%',
                  height: '80%',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '5rem 0',
        background: 'rgba(20, 20, 25, 0.3)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p style={{
              color: '#B8A086',
              fontSize: '0.875rem',
              fontWeight: '400',
              marginBottom: '0.5rem',
              letterSpacing: '0.1em',
              fontFamily: "'Noto Serif KR', serif"
            }}>
              PLATFORM FEATURES
            </p>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '500',
              color: '#D4C5A9',
              fontFamily: "'Noto Serif KR', serif"
            }}>
              핵심 기능 소개
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {/* Feature Card 1 */}
            <FeatureCard
              emoji="🍷"
              title="술 리뷰 작성"
              description="마신 술의 향, 맛, 여운을 기록하고 평점을 남겨보세요"
            />

            {/* Feature Card 2 */}
            <FeatureCard
              emoji="💬"
              title="커뮤니티"
              description="같은 취향을 가진 사람들과 술에 대한 이야기를 나눠보세요"
            />

            {/* Feature Card 3 */}
            <FeatureCard
              emoji="📊"
              title="취향 분석"
              description="나의 술 취향을 분석하고 새로운 술을 추천받으세요"
            />

            {/* Feature Card 4 */}
            <FeatureCard
              emoji="⭐"
              title="맞춤 추천"
              description="내 취향에 맞는 술과 바를 AI가 추천해드려요"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  emoji: string;
  title: string;
  description: string;
}

const FeatureCard = ({ emoji, title, description }: FeatureCardProps) => {
  return (
    <div
      style={{
        background: 'rgba(20, 20, 25, 0.5)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1.5rem',
        padding: '2rem',
        textAlign: 'center',
        border: '1px solid rgba(180, 160, 134, 0.2)',
        transition: 'all 0.3s',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(180, 160, 134, 0.15)';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'rgba(180, 160, 134, 0.4)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(180, 160, 134, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(20, 20, 25, 0.5)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(180, 160, 134, 0.2)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        width: '4rem',
        height: '5rem',
        background: 'rgba(180, 160, 134, 0.1)',
        borderRadius: '1rem',
        margin: '0 auto 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span style={{ fontSize: '2rem' }}>{emoji}</span>
      </div>
      <h3 style={{
        fontSize: '1.125rem',
        fontWeight: '500',
        color: '#D4C5A9',
        marginBottom: '1rem',
        transition: 'color 0.3s',
        fontFamily: "'Noto Serif KR', serif"
      }}>
        {title}
      </h3>
      <p style={{
        color: '#A39178',
        fontSize: '0.875rem',
        lineHeight: '1.6',
        transition: 'color 0.3s',
        fontWeight: '300',
        fontFamily: "'Noto Serif KR', serif"
      }}>
        {description}
      </p>
    </div>
  );
};
