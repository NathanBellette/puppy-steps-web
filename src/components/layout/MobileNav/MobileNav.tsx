import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Target, 
  Calendar, 
  Activity,
  MoreHorizontal,
  BookOpen,
  Settings,
  LogOut,
  X
} from 'lucide-react';

const tabs = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Sessions', href: '/sessions', icon: Activity },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
];

const moreItems = [
  { name: 'Resources', href: '/resources', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
];

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
        <div className="bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl border-t border-gray-200 dark:border-gray-700">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Sheet header */}
          <div className="flex items-center justify-between px-6 pb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              More
            </h3>
            <button
              onClick={() => setIsMoreOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items */}
          <nav className="px-4 pb-4 space-y-1">
            {moreItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleMoreItemClick(item.href)}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <item.icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                {item.name}
              </button>
            ))}

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

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
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 lg:hidden">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {tabs.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setIsMoreOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center py-2 px-1 text-xs font-medium rounded-md transition-colors',
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                )
              }
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
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
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
