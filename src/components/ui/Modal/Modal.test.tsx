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

    it('accepts different sizes without crashing', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={mockOnClose} size="sm" data-testid="modal">
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal')).toBeInTheDocument();

      rerender(
        <Modal isOpen={true} onClose={mockOnClose} size="lg" data-testid="modal">
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal')).toBeInTheDocument();

      rerender(
        <Modal isOpen={true} onClose={mockOnClose} size="xl" data-testid="modal">
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal')).toBeInTheDocument();
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
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('renders close button when onClose is provided', () => {
      render(
        <ModalHeader onClose={mockOnClose} data-testid="header">
          Header
        </ModalHeader>
      );
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ModalHeader onClose={mockOnClose} data-testid="header">
          Header
        </ModalHeader>
      );
      
      await user.click(screen.getByRole('button', { name: /close/i }));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('ModalContent', () => {
    it('renders children', () => {
      render(
        <ModalContent data-testid="content">
          <p>Modal content here</p>
        </ModalContent>
      );
      expect(screen.getByText('Modal content here')).toBeInTheDocument();
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
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });
  });

  describe('ModalTitle', () => {
    it('renders as h2 element', () => {
      render(<ModalTitle>Modal Title</ModalTitle>);
      const title = screen.getByText('Modal Title');
      expect(title.tagName).toBe('H2');
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
