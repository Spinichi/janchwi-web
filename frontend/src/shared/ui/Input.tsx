import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-2 text-sm !text-[#E8DCC0]',
          'placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea914e]',
          'disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
