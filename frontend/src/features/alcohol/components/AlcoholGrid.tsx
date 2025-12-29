import { useState } from 'react';
import { AlcoholCard } from './AlcoholCard';
import type { Alcohol, AlcoholCategory } from '../types';

const MOCK_DATA: Alcohol[] = [
  {
    id: 1,
    name: '샤토 마고 2015',
    type: '레드 와인',
    rating: 4.8,
    reviews: 342,
    image: '/premium-red-wine-bottle-dark-elegant.jpg',
    description: '깊고 복잡한 풍미와 섬세한 타닌이 어우러진 보르도 프리미엄 와인',
    tags: ['프랑스', '풀바디', '프리미엄'],
  },
  {
    id: 2,
    name: '맥캘란 18년',
    type: '싱글 몰트 스카치',
    rating: 4.9,
    reviews: 528,
    image: '/premium-whisky-bottle-amber-elegant.jpg',
    description: '세리 오크통에서 숙성된 풍부한 과일 향과 부드러운 피니시',
    tags: ['스코틀랜드', '18년산', '세리캐스크'],
  },
  {
    id: 3,
    name: '돔 페리뇽 2012',
    type: '샴페인',
    rating: 4.7,
    reviews: 421,
    image: '/champagne-bottle-luxury-dark-background.jpg',
    description: '섬세한 버블과 우아한 미네랄이 조화를 이루는 프레스티지 샴페인',
    tags: ['프랑스', '빈티지', '럭셔리'],
  },
  {
    id: 4,
    name: '클라세 아줄 레포사도',
    type: '데킬라',
    rating: 4.6,
    reviews: 287,
    image: '/premium-tequila-bottle-blue-elegant.jpg',
    description: '오크통에서 숙성되어 부드럽고 균형 잡힌 맛의 프리미엄 테킬라',
    tags: ['멕시코', '레포사도', '100% 아가베'],
  },
  {
    id: 5,
    name: '패피 반 윙클 23년',
    type: '버번',
    rating: 5.0,
    reviews: 156,
    image: '/bourbon-whiskey-bottle-premium-dark.jpg',
    description: '희귀하고 전설적인 버번, 깊은 캐러멜과 바닐라 향',
    tags: ['미국', '23년산', '한정판'],
  },
  {
    id: 6,
    name: '헤네시 파라디',
    type: '코냑',
    rating: 4.8,
    reviews: 198,
    image: '/cognac-bottle-luxury-amber-glass.jpg',
    description: '100년 이상 숙성된 오드비를 블렌딩한 최고급 코냑',
    tags: ['프랑스', '프리미엄', 'XO 이상'],
  },
];

const CATEGORIES: { value: AlcoholCategory; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'wine', label: '와인' },
  { value: 'spirits', label: '증류주' },
  { value: 'whisky', label: '위스키' },
  { value: 'cocktails', label: '칵테일' },
];

export const AlcoholGrid = () => {
  const [filter, setFilter] = useState<AlcoholCategory>('all');

  return (
    <div style={{ marginBottom: '3rem' }}>
      {/* Section Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#E8DCC0' }}>
          프리미엄 셀렉션
        </h2>
      </div>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
        {CATEGORIES.map((category) => (
          <button
            key={category.value}
            onClick={() => setFilter(category.value)}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.3s',
              cursor: 'pointer',
              border: filter === category.value ? 'none' : '1px solid rgba(234, 145, 78, 0.3)',
              background: filter === category.value ? '#ea914e' : 'transparent',
              color: filter === category.value ? '#1c1917' : '#E8DCC0',
            }}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        {MOCK_DATA.map((alcohol) => (
          <AlcoholCard key={alcohol.id} alcohol={alcohol} />
        ))}
      </div>
    </div>
  );
};
