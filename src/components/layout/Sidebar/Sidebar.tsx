import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { HomeLink } from '@/components/AppLogo';
import { navLinkClassName, primaryNavItems, secondaryNavItems } from '../navigation';

const navigation = [...primaryNavItems, ...secondaryNavItems];

const linkClassName = navLinkClassName(
  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
  'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300',
  'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
);

export const Sidebar = () => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-64">
      <div className="flex h-full w-full flex-col bg-white dark:bg-slate-900 shadow-lg border-r border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-700">
          <HomeLink>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                PuppySteps
              </h1>
            </div>
          </HomeLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={linkClassName}
            >
              <item.icon
                className="mr-3 h-5 w-5 flex-shrink-0"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4">
          <button
            onClick={handleSignOut}
            className="group flex w-full items-center px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};
