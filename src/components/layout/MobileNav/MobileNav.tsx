import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { MoreHorizontal, LogOut, X } from 'lucide-react';
import { navLinkClassName, primaryNavItems, secondaryNavItems } from '../navigation';

const tabClassName = navLinkClassName(
  'flex flex-col items-center justify-center py-2 px-1 text-xs font-medium rounded-md transition-colors',
  'text-primary-600 dark:text-primary-400',
  'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
);

export const MobileNav = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleMoreItemClick = (href: string) => {
    setIsMoreOpen(false);
    navigate(href);
  };

  const handleSignOut = async () => {
    setIsMoreOpen(false);
    await signOut();
  };

  return (
    <>
      {/* Backdrop */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      {/* "More" bottom sheet */}
      <div
        className={cn(
          'fixed left-0 right-0 z-50 lg:hidden transition-transform duration-300 ease-in-out',
          isMoreOpen
            ? 'translate-y-0 bottom-0'
            : 'translate-y-full bottom-0'
        )}
      >
        <div className="bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl border-t border-slate-200 dark:border-slate-700">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
          </div>

          {/* Sheet header */}
          <div className="flex items-center justify-between px-6 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              More
            </h3>
            <button
              onClick={() => setIsMoreOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items */}
          <nav className="px-4 pb-4 space-y-1">
            {secondaryNavItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleMoreItemClick(item.href)}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <item.icon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                {item.name}
              </button>
            ))}

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-700 my-2" />

            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </nav>

          {/* Safe area spacer for iOS home indicator */}
          <div className="h-safe-bottom" />
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 lg:hidden">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {primaryNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setIsMoreOpen(false)}
              className={tabClassName}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}

          {/* More button */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={cn(
              'flex flex-col items-center justify-center py-2 px-1 text-xs font-medium rounded-md transition-colors',
              isMoreOpen
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            )}
          >
            <MoreHorizontal className="h-5 w-5 mb-1" />
            <span className="truncate">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
