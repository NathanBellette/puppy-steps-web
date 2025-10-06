import { cn } from '@/lib/utils';
import { Dog } from 'lucide-react';

export interface DogAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  photoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const DogAvatar = ({ 
  className, 
  name, 
  photoUrl, 
  size = 'md',
  ...props 
}: DogAvatarProps) => {
  const sizes = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-xl',
  };

  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300',
        sizes[size],
        className
      )}
      {...props}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={`${name}'s photo`}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center">
          {initials || <Dog className="h-1/2 w-1/2" />}
        </div>
      )}
    </div>
  );
};

export { DogAvatar };
