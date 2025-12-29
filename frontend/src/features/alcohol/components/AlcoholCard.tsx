import { useState } from 'react';
import { Star } from 'lucide-react';
import { Badge } from '../../../shared/ui';
import type { Alcohol } from '../types';

interface AlcoholCardProps {
  alcohol: Alcohol;
}

export const AlcoholCard = ({ alcohol }: AlcoholCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: 'pointer',
        borderRadius: '1rem',
        overflow: 'hidden',
        transition: 'all 0.3s',
        background: 'rgba(20, 20, 25, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(234, 145, 78, 0.1)',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isHovered ? '0 0 20px rgba(234, 145, 78, 0.3)' : 'none',
      }}
    >
      {/* Image */}
      <div style={{
        position: 'relative',
        height: '20rem',
        overflow: 'hidden',
        background: 'rgba(10, 10, 12, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img
          src={alcohol.image}
          alt={alcohol.name}
          style={{
            height: '100%',
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain',
            transition: 'transform 0.5s',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          }}
        />
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem' }}>
        {/* Title */}
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          marginBottom: '0.5rem',
          color: '#E8DCC0',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {alcohol.name}
        </h3>

        {/* Type */}
        <p style={{ fontSize: '0.875rem', color: '#C4B89A', marginBottom: '1rem' }}>
          {alcohol.type}
        </p>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Star className="h-4 w-4 fill-[#ea914e] text-[#ea914e]" />
            <span style={{ fontWeight: '500', fontSize: '0.875rem', color: '#E8DCC0' }}>
              {alcohol.rating}
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#C4B89A' }}>
            {alcohol.reviews}개 리뷰
          </span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '0.875rem',
          color: '#C4B89A',
          marginBottom: '1rem',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {alcohol.description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {alcohol.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
