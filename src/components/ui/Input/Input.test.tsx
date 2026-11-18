import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, Textarea } from './Input';
import { itAcceptsClassNameAndRef } from '@/test/utils';

type FieldComponent = typeof Input | typeof Textarea;

describe('Input Components', () => {
  describe.each<{ name: string; Field: FieldComponent; testId: string; typed: string }>([
    { name: 'Input', Field: Input, testId: 'input', typed: 'test value' },
    { name: 'Textarea', Field: Textarea, testId: 'textarea', typed: 'Line 1\nLine 2\nLine 3' },
  ])('$name', ({ Field, testId, typed }) => {
    const field = () => screen.getByTestId(testId) as HTMLInputElement | HTMLTextAreaElement;

    it('renders without crashing', () => {
      render(<Field data-testid={testId} />);
      expect(field()).toBeInTheDocument();
    });

    it('handles value changes', async () => {
      render(<Field data-testid={testId} />);

      await userEvent.setup().type(field(), typed);

      expect(field().value).toBe(typed);
    });

    it('shows placeholder text', () => {
      render(<Field placeholder="Enter your text" data-testid={testId} />);
      expect(field()).toHaveAttribute('placeholder', 'Enter your text');
    });

    it('can be disabled', () => {
      render(<Field disabled data-testid={testId} />);
      expect(field()).toBeDisabled();
    });

    it('can be required', () => {
      render(<Field required data-testid={testId} />);
      expect(field()).toBeRequired();
    });

    it('supports aria-label for accessibility', () => {
      render(<Field aria-label="Field label" data-testid={testId} />);
      expect(screen.getByLabelText('Field label')).toBeInTheDocument();
    });

    itAcceptsClassNameAndRef((props) => <Field data-testid={testId} {...props} />, testId);
  });

  describe('Input', () => {
    it.each(['text', 'email', 'password'])('renders with input type %s', (type) => {
      render(<Input type={type} data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', type);
    });

    it('handles focus events', async () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');

      await userEvent.setup().click(input);

      expect(input).toHaveFocus();
    });
  });
});
