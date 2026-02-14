import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, Textarea } from './Input';

describe('Input Components', () => {
  describe('Input', () => {
    it('renders with default props', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md');
    });

    it('renders with different input types', () => {
      const { rerender } = render(<Input type="text" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'text');

      rerender(<Input type="email" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');

      rerender(<Input type="password" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
    });

    it('handles value changes', async () => {
      const user = userEvent.setup();
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      
      await user.type(input, 'test value');
      expect(input.value).toBe('test value');
    });

    it('shows placeholder text', () => {
      render(<Input placeholder="Enter your name" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('placeholder', 'Enter your name');
    });

    it('can be disabled', () => {
      render(<Input disabled data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('can be required', () => {
      render(<Input required data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toBeRequired();
    });

    it('applies custom className', () => {
      render(<Input className="custom-class" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<Input ref={ref} data-testid="input" />);
      expect(ref).toHaveBeenCalled();
    });

    it('handles focus events', async () => {
      const user = userEvent.setup();
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      
      await user.click(input);
      expect(input).toHaveFocus();
    });

    it('has proper accessibility attributes', () => {
      render(<Input aria-label="Username" data-testid="input" />);
      const input = screen.getByLabelText('Username');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Textarea', () => {
    it('renders with default props', () => {
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveClass('flex', 'min-h-[80px]', 'w-full', 'rounded-md');
    });

    it('handles value changes', async () => {
      const user = userEvent.setup();
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
      
      await user.type(textarea, 'This is a long text');
      expect(textarea.value).toBe('This is a long text');
    });

    it('shows placeholder text', () => {
      render(<Textarea placeholder="Enter your message" data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('placeholder', 'Enter your message');
    });

    it('can be disabled', () => {
      render(<Textarea disabled data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toBeDisabled();
    });

    it('can be required', () => {
      render(<Textarea required data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toBeRequired();
    });

    it('applies custom className', () => {
      render(<Textarea className="custom-class" data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<Textarea ref={ref} data-testid="textarea" />);
      expect(ref).toHaveBeenCalled();
    });

    it('handles multiline text', async () => {
      const user = userEvent.setup();
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
      
      await user.type(textarea, 'Line 1\nLine 2\nLine 3');
      expect(textarea.value).toBe('Line 1\nLine 2\nLine 3');
    });

    it('has proper accessibility attributes', () => {
      render(<Textarea aria-label="Message" data-testid="textarea" />);
      const textarea = screen.getByLabelText('Message');
      expect(textarea).toBeInTheDocument();
    });
  });
});
