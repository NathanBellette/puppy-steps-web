import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select, SelectOption } from './Select';

describe('Select Components', () => {
  describe('Select', () => {
    it('renders with default props', () => {
      render(
        <Select data-testid="select">
          <SelectOption value="option1">Option 1</SelectOption>
          <SelectOption value="option2">Option 2</SelectOption>
        </Select>
      );
      
      const select = screen.getByTestId('select');
      expect(select).toBeInTheDocument();
      expect(select).toHaveClass('flex', 'h-10', 'w-full', 'appearance-none', 'rounded-md');
    });

    it('renders with placeholder', () => {
      render(
        <Select placeholder="Choose an option" data-testid="select">
          <SelectOption value="option1">Option 1</SelectOption>
        </Select>
      );
      
      const select = screen.getByTestId('select');
      expect(select).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Choose an option' })).toBeInTheDocument();
    });

    it('renders chevron down icon', () => {
      render(
        <Select data-testid="select">
          <SelectOption value="option1">Option 1</SelectOption>
        </Select>
      );
      
      const chevronIcon = screen.getByTestId('select').parentElement?.querySelector('svg');
      expect(chevronIcon).toBeInTheDocument();
    });

    it('handles value changes', async () => {
      const user = userEvent.setup();
      render(
        <Select data-testid="select">
          <SelectOption value="option1">Option 1</SelectOption>
          <SelectOption value="option2">Option 2</SelectOption>
        </Select>
      );
      
      const select = screen.getByTestId('select') as HTMLSelectElement;
      await user.selectOptions(select, 'option2');
      expect(select.value).toBe('option2');
    });

    it('can be disabled', () => {
      render(
        <Select disabled data-testid="select">
          <SelectOption value="option1">Option 1</SelectOption>
        </Select>
      );
      
      const select = screen.getByTestId('select');
      expect(select).toBeDisabled();
      expect(select).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('can be required', () => {
      render(
        <Select required data-testid="select">
          <SelectOption value="option1">Option 1</SelectOption>
        </Select>
      );
      
      const select = screen.getByTestId('select');
      expect(select).toBeRequired();
    });

    it('applies custom className', () => {
      render(
        <Select className="custom-class" data-testid="select">
          <SelectOption value="option1">Option 1</SelectOption>
        </Select>
      );
      
      const select = screen.getByTestId('select');
      expect(select).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(
        <Select ref={ref} data-testid="select">
          <SelectOption value="option1">Option 1</SelectOption>
        </Select>
      );
      expect(ref).toHaveBeenCalled();
    });

    it('has proper accessibility attributes', () => {
      render(
        <Select aria-label="Choose option" data-testid="select">
          <SelectOption value="option1">Option 1</SelectOption>
        </Select>
      );
      
      const select = screen.getByLabelText('Choose option');
      expect(select).toBeInTheDocument();
    });

    it('renders all options', () => {
      render(
        <Select data-testid="select">
          <SelectOption value="option1">Option 1</SelectOption>
          <SelectOption value="option2">Option 2</SelectOption>
          <SelectOption value="option3">Option 3</SelectOption>
        </Select>
      );
      
      expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Option 3' })).toBeInTheDocument();
    });
  });

  describe('SelectOption', () => {
    it('renders with value and children', () => {
      render(
        <Select data-testid="select">
          <SelectOption value="test-value" data-testid="option">
            Test Option
          </SelectOption>
        </Select>
      );
      
      const option = screen.getByTestId('option');
      expect(option).toBeInTheDocument();
      expect(option).toHaveAttribute('value', 'test-value');
      expect(option).toHaveTextContent('Test Option');
    });

    it('can be disabled', () => {
      render(
        <Select data-testid="select">
          <SelectOption value="disabled-option" disabled data-testid="option">
            Disabled Option
          </SelectOption>
        </Select>
      );
      
      const option = screen.getByTestId('option');
      expect(option).toBeDisabled();
    });

    it('applies custom className', () => {
      render(
        <Select data-testid="select">
          <SelectOption value="option" className="custom-class" data-testid="option">
            Option
          </SelectOption>
        </Select>
      );
      
      const option = screen.getByTestId('option');
      expect(option).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(
        <Select data-testid="select">
          <SelectOption ref={ref} value="option" data-testid="option">
            Option
          </SelectOption>
        </Select>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Complete Select Structure', () => {
    it('renders a complete select with placeholder and options', () => {
      render(
        <Select placeholder="Choose a category" data-testid="select">
          <SelectOption value="people">People</SelectOption>
          <SelectOption value="dogs">Dogs</SelectOption>
          <SelectOption value="environments">Environments</SelectOption>
          <SelectOption value="noises">Noises</SelectOption>
        </Select>
      );

      expect(screen.getByTestId('select')).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Choose a category' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'People' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Dogs' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Environments' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Noises' })).toBeInTheDocument();
    });
  });
});
