import { AlcoholGrid } from '../features/alcohol/components';

export const Home = () => {
  return (
    <div className="content-container">
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Hero Section */}
        <section style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 className="text-6xl md:text-7xl font-normal tracking-wide hero-text !text-[#E8DCC0]" style={{ marginBottom: '1rem' }}>
              잔취
            </h1>
            <p className="text-lg md:text-xl !text-[#ea914e] font-light tracking-wide">
              한 잔의 여운을 기록하다
            </p>
          </div>
          <p className="text-base !text-[#C4B89A] font-light" style={{ maxWidth: '600px', margin: '0 auto' }}>
            깊은 밤, 조용히 나누는 이야기처럼
          </p>
        </section>

        {/* Main Content Grid */}
        <AlcoholGrid />
      </main>
    </div>
  );
};
