import { forwardRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { createStyledElement } from '@/lib/createStyledElement';
import { X } from 'lucide-react';

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className, isOpen, onClose, size = 'md', children, ...props }, ref) => {
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        
        {/* Modal */}
        <div
          ref={ref}
          className={cn(
            'relative z-50 w-full bg-white rounded-lg shadow-lg dark:bg-slate-900',
            sizes[size],
            'mx-4 max-h-[90vh] overflow-y-auto',
            className
          )}
          role="dialog"
          aria-modal="true"
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);
Modal.displayName = 'Modal';

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, children, onClose, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700',
        className
      )}
      {...props}
    >
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:pointer-events-none dark:ring-offset-slate-950"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  )
);
ModalHeader.displayName = 'ModalHeader';

const ModalContent = createStyledElement<HTMLDivElement>('div', 'p-6', 'ModalContent');

const ModalFooter = createStyledElement<HTMLDivElement>(
  'div',
  'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t border-slate-200 dark:border-slate-700',
  'ModalFooter'
);

const ModalTitle = createStyledElement<HTMLHeadingElement>(
  'h2',
  'text-lg font-semibold text-slate-900 dark:text-slate-100',
  'ModalTitle'
);

export { Modal, ModalHeader, ModalContent, ModalFooter, ModalTitle };
