import { createElement, forwardRef, HTMLAttributes } from 'react';
import { cn } from './utils';

/**
 * Creates a ref-forwarding HTML element whose base Tailwind classes merge with the caller's className.
 */
export const createStyledElement = <E extends HTMLElement, P extends HTMLAttributes<E> = HTMLAttributes<E>>(
  tag: keyof JSX.IntrinsicElements,
  baseClassName: string,
  displayName: string
) => {
  const StyledElement = forwardRef<E, P>(({ className, ...props }, ref) =>
    createElement(tag, { ref, className: cn(baseClassName, className), ...props })
  );
  StyledElement.displayName = displayName;
  return StyledElement;
};
