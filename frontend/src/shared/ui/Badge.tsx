import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline';
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
          {
            'bg-[oklch(var(--accent))]/20 text-[oklch(var(--accent))]': variant === 'default',
            'bg-gray-800 text-gray-300': variant === 'secondary',
            'border border-[oklch(var(--border))] text-gray-400': variant === 'outline',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
