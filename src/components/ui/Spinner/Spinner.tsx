import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  /** Size of the spinner. Defaults to 'sm'. */
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
};

const Spinner = ({ className, size = 'sm' }: SpinnerProps) => (
  <div
    className={cn(
      'border-white border-t-transparent rounded-full animate-spin',
      sizes[size],
      className
    )}
    role="status"
    aria-label="Loading"
  />
);

export { Spinner };
