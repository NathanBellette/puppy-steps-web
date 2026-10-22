import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { Select, SelectOption, SelectOptionProps, SelectProps } from './Select';
import { itAcceptsClassNameAndRef } from '@/test/utils';

const renderSelect = (
  props: Partial<SelectProps> = {},
  children: ReactNode = <SelectOption value="option1">Option 1</SelectOption>
) =>
  render(
    <Select data-testid="select" {...props}>
      {children}
    </Select>
  );

const renderOption = ({ children = 'Option', ...props }: Partial<SelectOptionProps> = {}) =>
  renderSelect({}, <SelectOption value="option" data-testid="option" {...props}>{children}</SelectOption>);

const expectOptions = (...names: string[]) =>
  names.forEach((name) => expect(screen.getByRole('option', { name })).toBeInTheDocument());

describe('Select Components', () => {
  describe('Select', () => {
    const select = () => screen.getByTestId('select');

    it('renders without crashing', () => {
      renderSelect();
      expect(select()).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      renderSelect({ placeholder: 'Choose an option' });
      expectOptions('Choose an option');
    });

    it('renders chevron down icon', () => {
      renderSelect();
      expect(select().parentElement?.querySelector('svg')).toBeInTheDocument();
    });

    it('handles value changes', async () => {
      renderSelect({}, ['option1', 'option2'].map((value) => (
        <SelectOption key={value} value={value}>{value}</SelectOption>
      )));

      await userEvent.setup().selectOptions(select(), 'option2');

      expect((select() as HTMLSelectElement).value).toBe('option2');
    });

    it('can be disabled', () => {
      renderSelect({ disabled: true });
      expect(select()).toBeDisabled();
    });

    it('can be required', () => {
      renderSelect({ required: true });
      expect(select()).toBeRequired();
    });

    itAcceptsClassNameAndRef(
      (props) => <Select data-testid="select" {...props}><SelectOption value="option1">Option 1</SelectOption></Select>,
      'select'
    );

    it('supports aria-label for accessibility', () => {
      renderSelect({ 'aria-label': 'Choose option' });
      expect(screen.getByLabelText('Choose option')).toBeInTheDocument();
    });

    it('renders all options', () => {
      renderSelect({}, ['Option 1', 'Option 2', 'Option 3'].map((name) => (
        <SelectOption key={name} value={name}>{name}</SelectOption>
      )));

      expectOptions('Option 1', 'Option 2', 'Option 3');
    });
  });

  describe('SelectOption', () => {
    const option = () => screen.getByTestId('option');

    it('renders with value and children', () => {
      renderOption({ value: 'test-value', children: 'Test Option' });

      expect(option()).toHaveAttribute('value', 'test-value');
      expect(option()).toHaveTextContent('Test Option');
    });

    it('can be disabled', () => {
      renderOption({ disabled: true });
      expect(option()).toBeDisabled();
    });

    itAcceptsClassNameAndRef(
      (props) => <Select><SelectOption value="option" data-testid="option" {...props}>Option</SelectOption></Select>,
      'option'
    );
  });

  describe('Complete Select Structure', () => {
    it('renders a complete select with placeholder and options', () => {
      const categories = ['People', 'Dogs', 'Environments', 'Noises'];
      renderSelect({ placeholder: 'Choose a category' }, categories.map((name) => (
        <SelectOption key={name} value={name.toLowerCase()}>{name}</SelectOption>
      )));

      expectOptions('Choose a category', ...categories);
    });
  });
});
