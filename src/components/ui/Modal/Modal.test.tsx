import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

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

    it('renders title and close button when title prop is provided', async () => {
      const user = userEvent.setup();
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" data-testid="modal">
          <p>Modal body content</p>
        </Modal>
      );

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal body content')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();

      await user.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not render title header when title is not provided', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} data-testid="modal">
          <p>Only body content</p>
        </Modal>
      );

      expect(screen.getByText('Only body content')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
    });
  });
});
