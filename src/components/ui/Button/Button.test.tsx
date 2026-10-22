import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, ButtonProps } from './Button';
import { expectButtons, itAcceptsClassNameAndRef } from '@/test/utils';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expectButtons(/click me/i);
  });

  it.each<Pick<ButtonProps, 'variant' | 'size'>>([
    { variant: 'destructive' },
    { variant: 'outline' },
    { variant: 'secondary' },
    { variant: 'ghost' },
    { variant: 'link' },
    { size: 'sm' },
    { size: 'lg' },
    { size: 'icon' },
  ])('renders %o without crashing', (props) => {
    render(<Button {...props}>Styled</Button>);
    expectButtons('Styled');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.setup().click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', async () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    await userEvent.setup().click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  itAcceptsClassNameAndRef((props) => <Button data-testid="button" {...props}>Custom</Button>, 'button');

  it('supports aria-label for accessibility', () => {
    render(<Button aria-label="Custom label">Button</Button>);
    expectButtons(/custom label/i);
  });

  it('supports keyboard navigation', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Keyboard test</Button>);
    const button = screen.getByRole('button');

    button.focus();
    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);

    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});
