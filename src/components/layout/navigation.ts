import { LayoutDashboard, Target, Calendar, Activity, BookOpen, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Main destinations; the mobile tab bar shows these directly. */
export const primaryNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Plan', href: '/goals', icon: Target },
  { name: 'Sessions', href: '/sessions', icon: Activity },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
];

/** Secondary destinations; the mobile "More" sheet holds these. */
export const secondaryNavItems = [
  { name: 'Resources', href: '/resources', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
];

/** Builds a NavLink className callback that adds the active or inactive classes to the base. */
export const navLinkClassName =
  (baseClassName: string, activeClassName: string, inactiveClassName: string) =>
  ({ isActive }: { isActive: boolean }) =>
    cn(baseClassName, isActive ? activeClassName : inactiveClassName);
