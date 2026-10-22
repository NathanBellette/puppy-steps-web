import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  ModalTitle,
  ModalProps,
} from './Modal';
import { clickButton, expectAttributes, expectButtons, expectTexts, itAcceptsClassNameAndRef, itRendersChildren } from '@/test/utils';

describe('Modal Components', () => {
  const mockOnClose = vi.fn();

  const renderModal = (props: Partial<ModalProps> = {}) =>
    render(
      <Modal isOpen={true} onClose={mockOnClose} data-testid="modal" {...props}>
        <div>Modal content</div>
      </Modal>
    );

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('Modal', () => {
    it('renders when isOpen is true', () => {
      renderModal();

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expectTexts('Modal content');
    });

    it('does not render when isOpen is false', () => {
      renderModal({ isOpen: false });

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it.each(['sm', 'lg', 'xl'] as const)('accepts size %s without crashing', (size) => {
      renderModal({ size });

      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('calls onClose when backdrop is clicked', async () => {
      renderModal();

      const backdrop = screen.getByTestId('modal').parentElement?.querySelector('[aria-hidden="true"]');
      await userEvent.setup().click(backdrop!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', async () => {
      renderModal();

      await userEvent.setup().keyboard('{Escape}');

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('has proper accessibility attributes', () => {
      renderModal();

      expectAttributes(screen.getByTestId('modal'), { role: 'dialog', 'aria-modal': 'true' });
    });

    itAcceptsClassNameAndRef((props) => <Modal isOpen={true} onClose={mockOnClose} data-testid="modal" {...props} />, 'modal');
  });

  itRendersChildren({ ModalHeader, ModalContent, ModalTitle, ModalFooter }, { ModalTitle: 'H2' });

  it('ModalHeader renders a close button that calls onClose', async () => {
    render(<ModalHeader onClose={mockOnClose}>Header</ModalHeader>);

    await clickButton(/close/i);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
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
      expectTexts('Test Modal', 'This is the modal content.');
      expectButtons(/cancel/i, /save/i);
    });
  });
});
