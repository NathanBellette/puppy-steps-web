import { LucideIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsListItemProps {
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  rightContent?: React.ReactNode;
  expandable?: boolean;
  expanded?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const SettingsListItem = ({
  icon: Icon,
  iconColor = 'text-slate-600 dark:text-slate-400',
  label,
  rightContent,
  expandable = false,
  expanded = false,
  onClick,
  children,
  className,
}: SettingsListItemProps) => {
  return (
    <div className={className}>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={cn('h-5 w-5', iconColor)} />
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {label}
          </span>
        </div>
        {rightContent ? (
          rightContent
        ) : expandable ? (
          <ChevronRight
            className={cn(
              'h-5 w-5 text-slate-400 transition-transform',
              expanded && 'rotate-90'
            )}
          />
        ) : null}
      </button>
      {expandable && expanded && children && (
        <div className="ml-11 p-3 space-y-3 text-sm">
          {children}
        </div>
      )}
    </div>
  );
};
