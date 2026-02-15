import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, Textarea } from './Input';

describe('Input Components', () => {
  describe('Input', () => {
    it('renders without crashing', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toBeInTheDocument();
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
      expect(screen.getByTestId('input')).toHaveAttribute('placeholder', 'Enter your name');
    });

    it('can be disabled', async () => {
      const handleChange = vi.fn();
      render(<Input disabled onChange={handleChange} data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toBeDisabled();
    });

    it('can be required', () => {
      render(<Input required data-testid="input" />);
      expect(screen.getByTestId('input')).toBeRequired();
    });

    it('applies custom className', () => {
      render(<Input className="custom-class" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('custom-class');
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

    it('supports aria-label for accessibility', () => {
      render(<Input aria-label="Username" data-testid="input" />);
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });
  });

  describe('Textarea', () => {
    it('renders without crashing', () => {
      render(<Textarea data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toBeInTheDocument();
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
      expect(screen.getByTestId('textarea')).toHaveAttribute('placeholder', 'Enter your message');
    });

    it('can be disabled', () => {
      render(<Textarea disabled data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toBeDisabled();
    });

    it('can be required', () => {
      render(<Textarea required data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toBeRequired();
    });

    it('applies custom className', () => {
      render(<Textarea className="custom-class" data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveClass('custom-class');
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

    it('supports aria-label for accessibility', () => {
      render(<Textarea aria-label="Message" data-testid="textarea" />);
      expect(screen.getByLabelText('Message')).toBeInTheDocument();
    });
  });
});
