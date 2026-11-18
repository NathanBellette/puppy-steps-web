import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  /** Optional control shown on the right, e.g. a primary action button */
  action?: ReactNode;
}

export const PageHeader = ({ title, description, action }: PageHeaderProps) => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
      <p className="text-slate-500 dark:text-slate-400">{description}</p>
    </div>
    {action}
  </div>
);
