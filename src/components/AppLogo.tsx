import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const logoSizes = {
  sm: { box: 'h-8 w-8', letter: 'text-sm' },
  lg: { box: 'h-12 w-12', letter: 'text-xl' },
};

interface AppLogoProps {
  size?: keyof typeof logoSizes;
  className?: string;
}

/** The app's "P" mark. */
export const AppLogo = ({ size = 'sm', className }: AppLogoProps) => (
  <div className={cn('rounded-lg bg-primary-500 flex items-center justify-center', logoSizes[size].box, className)}>
    <span className={cn('text-white font-bold', logoSizes[size].letter)}>P</span>
  </div>
);

interface HomeLinkProps {
  className?: string;
  children?: ReactNode;
}

/** The app logo, followed by any children, linking to the dashboard. */
export const HomeLink = ({ className, children }: HomeLinkProps) => (
  <Link to="/dashboard" className={cn('flex items-center', className)} aria-label="Go to home page" tabIndex={0}>
    <AppLogo className="flex-shrink-0" />
    {children}
  </Link>
);
