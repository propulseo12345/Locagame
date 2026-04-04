import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  variant?: 'dark' | 'light';
}

const roundedMap = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export function Skeleton({ className, rounded = 'md', variant = 'dark' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        roundedMap[rounded],
        variant === 'dark' ? 'bg-white/5' : 'bg-gray-200',
        className,
      )}
    >
      <div
        className={cn(
          'absolute inset-0 animate-shimmer',
          variant === 'dark'
            ? 'bg-gradient-to-r from-transparent via-white/[0.08] to-transparent'
            : 'bg-gradient-to-r from-transparent via-white/60 to-transparent',
        )}
      />
    </div>
  );
}
