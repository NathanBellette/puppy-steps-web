import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  /** Defaults to 'md' */
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
};

export const Spinner = ({ className, size = 'md' }: SpinnerProps) => (
  <div
    className={cn(
      'border-current border-t-transparent rounded-full animate-spin',
      sizeClasses[size],
      className,
    )}
    role="status"
    aria-label="Loading"
  />
);
