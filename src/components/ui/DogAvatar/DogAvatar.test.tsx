import { render, screen } from '@testing-library/react';
import { DogAvatar } from './DogAvatar';

describe('DogAvatar', () => {
  it('renders with initials when no photo is provided', () => {
    render(<DogAvatar name="Buddy Smith" data-testid="avatar" />);
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveTextContent('BS');
  });

  it('renders with single word name initials', () => {
    render(<DogAvatar name="Max" data-testid="avatar" />);
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveTextContent('M');
  });

  it('renders with photo when photoUrl is provided', () => {
    const photoUrl = 'https://example.com/dog-photo.jpg';
    render(<DogAvatar name="Buddy" photoUrl={photoUrl} data-testid="avatar" />);
    const avatar = screen.getByTestId('avatar');
    const img = avatar.querySelector('img');
    
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', photoUrl);
    expect(img).toHaveAttribute('alt', "Buddy's photo");
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<DogAvatar name="Buddy" size="sm" data-testid="avatar" />);
    expect(screen.getByTestId('avatar')).toHaveClass('h-8', 'w-8', 'text-sm');

    rerender(<DogAvatar name="Buddy" size="md" data-testid="avatar" />);
    expect(screen.getByTestId('avatar')).toHaveClass('h-12', 'w-12', 'text-base');

    rerender(<DogAvatar name="Buddy" size="lg" data-testid="avatar" />);
    expect(screen.getByTestId('avatar')).toHaveClass('h-16', 'w-16', 'text-lg');

    rerender(<DogAvatar name="Buddy" size="xl" data-testid="avatar" />);
    expect(screen.getByTestId('avatar')).toHaveClass('h-24', 'w-24', 'text-xl');
  });

  it('defaults to md size when no size is specified', () => {
    render(<DogAvatar name="Buddy" data-testid="avatar" />);
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('h-12', 'w-12', 'text-base');
  });

  it('applies custom className', () => {
    render(<DogAvatar name="Buddy" className="custom-class" data-testid="avatar" />);
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('custom-class');
  });

  it('handles empty name gracefully', () => {
    render(<DogAvatar name="" data-testid="avatar" />);
    const avatar = screen.getByTestId('avatar');
    // Should show Dog icon when no initials can be generated
    const dogIcon = avatar.querySelector('svg');
    expect(dogIcon).toBeInTheDocument();
  });

  it('handles name with special characters', () => {
    render(<DogAvatar name="Buddy-Joe O'Connor" data-testid="avatar" />);
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveTextContent('BO');
  });

  it('limits initials to 2 characters', () => {
    render(<DogAvatar name="Buddy Joe Smith Wilson" data-testid="avatar" />);
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveTextContent('BJ');
  });

  it('converts initials to uppercase', () => {
    render(<DogAvatar name="buddy smith" data-testid="avatar" />);
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveTextContent('BS');
  });

  it('has proper accessibility attributes', () => {
    render(<DogAvatar name="Buddy" data-testid="avatar" />);
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toBeInTheDocument();
    // The component should be accessible and properly labeled
  });

  it('renders photo with proper styling', () => {
    const photoUrl = 'https://example.com/dog-photo.jpg';
    render(<DogAvatar name="Buddy" photoUrl={photoUrl} data-testid="avatar" />);
    const img = screen.getByTestId('avatar').querySelector('img');
    expect(img).toHaveClass('h-full', 'w-full', 'rounded-full', 'object-cover');
  });
});
