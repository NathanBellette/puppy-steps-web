import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { MobileNav } from '../MobileNav';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar — hidden on mobile via CSS */}
      <Sidebar />
      
      {/* Main layout */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header />
        
        {/* Main content — add bottom padding on mobile for the tab bar */}
        <main className="py-6 pb-24 lg:pb-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile bottom tab bar — hidden on desktop via CSS */}
      <MobileNav />
    </div>
  );
};
