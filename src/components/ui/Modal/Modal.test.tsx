import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  Modal, 
  ModalHeader, 
  ModalContent, 
  ModalFooter, 
  ModalTitle 
} from './Modal';

describe('Modal Components', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('Modal', () => {
    it('renders when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} data-testid="modal">
          <div>Modal content</div>
        </Modal>
      );
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={mockOnClose} data-testid="modal">
          <div>Modal content</div>
        </Modal>
      );
      
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('renders with different sizes', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={mockOnClose} size="sm" data-testid="modal">
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal')).toHaveClass('max-w-md');

      rerender(
        <Modal isOpen={true} onClose={mockOnClose} size="lg" data-testid="modal">
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal')).toHaveClass('max-w-2xl');

      rerender(
        <Modal isOpen={true} onClose={mockOnClose} size="xl" data-testid="modal">
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal')).toHaveClass('max-w-4xl');
    });

    it('defaults to md size', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} data-testid="modal">
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal')).toHaveClass('max-w-lg');
    });

    it('calls onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Modal isOpen={true} onClose={mockOnClose} data-testid="modal">
          Content
        </Modal>
      );
      
      const backdrop = screen.getByTestId('modal').parentElement?.querySelector('[aria-hidden="true"]');
      await user.click(backdrop!);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(
        <Modal isOpen={true} onClose={mockOnClose} data-testid="modal">
          Content
        </Modal>
      );
      
      await user.keyboard('{Escape}');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('has proper accessibility attributes', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} data-testid="modal">
          Content
        </Modal>
      );
      
      const modal = screen.getByTestId('modal');
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });

    it('applies custom className', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} className="custom-class" data-testid="modal">
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal')).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(
        <Modal isOpen={true} onClose={mockOnClose} ref={ref} data-testid="modal">
          Content
        </Modal>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('ModalHeader', () => {
    it('renders with children', () => {
      render(
        <ModalHeader data-testid="header">
          <span>Header content</span>
        </ModalHeader>
      );
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('renders close button when onClose is provided', () => {
      render(
        <ModalHeader onClose={mockOnClose} data-testid="header">
          Header
        </ModalHeader>
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ModalHeader onClose={mockOnClose} data-testid="header">
          Header
        </ModalHeader>
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('applies custom className', () => {
      render(
        <ModalHeader className="custom-class" data-testid="header">
          Header
        </ModalHeader>
      );
      expect(screen.getByTestId('header')).toHaveClass('custom-class');
    });
  });

  describe('ModalContent', () => {
    it('renders children', () => {
      render(
        <ModalContent data-testid="content">
          <p>Modal content here</p>
        </ModalContent>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByText('Modal content here')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <ModalContent className="custom-class" data-testid="content">
          Content
        </ModalContent>
      );
      expect(screen.getByTestId('content')).toHaveClass('custom-class');
    });
  });

  describe('ModalFooter', () => {
    it('renders children', () => {
      render(
        <ModalFooter data-testid="footer">
          <button>Cancel</button>
          <button>Save</button>
        </ModalFooter>
      );
      
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <ModalFooter className="custom-class" data-testid="footer">
          Footer
        </ModalFooter>
      );
      expect(screen.getByTestId('footer')).toHaveClass('custom-class');
    });
  });

  describe('ModalTitle', () => {
    it('renders as h2 element', () => {
      render(
        <ModalTitle data-testid="title">
          Modal Title
        </ModalTitle>
      );
      
      const title = screen.getByTestId('title');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H2');
      expect(title).toHaveTextContent('Modal Title');
    });

    it('applies custom className', () => {
      render(
        <ModalTitle className="custom-class" data-testid="title">
          Title
        </ModalTitle>
      );
      expect(screen.getByTestId('title')).toHaveClass('custom-class');
    });
  });

  describe('Complete Modal Structure', () => {
    it('renders a complete modal with all components', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} data-testid="modal">
          <ModalHeader onClose={mockOnClose}>
            <ModalTitle>Test Modal</ModalTitle>
          </ModalHeader>
          <ModalContent>
            <p>This is the modal content.</p>
          </ModalContent>
          <ModalFooter>
            <button onClick={mockOnClose}>Cancel</button>
            <button>Save</button>
          </ModalFooter>
        </Modal>
      );

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('This is the modal content.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });
  });
});
