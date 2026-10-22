import { createStyledElement } from '@/lib/createStyledElement';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = createStyledElement<HTMLDivElement>(
  'div',
  'rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50',
  'Card'
);

const CardHeader = createStyledElement<HTMLDivElement>('div', 'flex flex-col space-y-1.5 p-6', 'CardHeader');

const CardTitle = createStyledElement<HTMLHeadingElement>(
  'h3',
  'text-2xl font-semibold leading-none tracking-tight',
  'CardTitle'
);

const CardDescription = createStyledElement<HTMLParagraphElement>(
  'p',
  'text-sm text-slate-500 dark:text-slate-400',
  'CardDescription'
);

const CardContent = createStyledElement<HTMLDivElement>('div', 'p-6 pt-0', 'CardContent');

const CardFooter = createStyledElement<HTMLDivElement>('div', 'flex items-center p-6 pt-0', 'CardFooter');

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
