import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label: ReactNode;
  htmlFor?: string;
  /** Validation message shown below the control */
  error?: string;
  /** Helper text shown below the control */
  hint?: string;
  /** Spacing between the label and the control. Defaults to 'mb-1'. */
  labelClassName?: string;
  children: ReactNode;
}

export const FormField = ({ label, htmlFor, error, hint, labelClassName = 'mb-1', children }: FormFieldProps) => (
  <div>
    <label
      htmlFor={htmlFor}
      className={cn('block text-sm font-medium text-slate-700 dark:text-slate-300', labelClassName)}
    >
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{hint}</p>}
    {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
  </div>
);
