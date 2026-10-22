import { createStyledElement } from '@/lib/createStyledElement';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

/** Base styles shared by the text field components. */
const fieldClassName =
  'flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-primary-500';

const Input = createStyledElement<HTMLInputElement, InputProps>(
  'input',
  `${fieldClassName} h-10 file:border-0 file:bg-transparent file:text-sm file:font-medium`,
  'Input'
);

const Textarea = createStyledElement<HTMLTextAreaElement, TextareaProps>(
  'textarea',
  `${fieldClassName} min-h-[80px]`,
  'Textarea'
);

export { Input, Textarea };
