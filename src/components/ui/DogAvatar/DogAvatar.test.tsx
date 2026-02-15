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
    expect(screen.getByTestId('avatar')).toHaveTextContent('M');
  });

  it('renders with photo when photoUrl is provided', () => {
    const photoUrl = 'https://example.com/dog-photo.jpg';
    render(<DogAvatar name="Buddy" photoUrl={photoUrl} data-testid="avatar" />);
    const img = screen.getByTestId('avatar').querySelector('img');
    
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', photoUrl);
    expect(img).toHaveAttribute('alt', "Buddy's photo");
  });

  it('renders without crashing for all sizes', () => {
    const { rerender } = render(<DogAvatar name="Buddy" size="sm" data-testid="avatar" />);
    expect(screen.getByTestId('avatar')).toBeInTheDocument();

    rerender(<DogAvatar name="Buddy" size="md" data-testid="avatar" />);
    expect(screen.getByTestId('avatar')).toBeInTheDocument();

    rerender(<DogAvatar name="Buddy" size="lg" data-testid="avatar" />);
    expect(screen.getByTestId('avatar')).toBeInTheDocument();

    rerender(<DogAvatar name="Buddy" size="xl" data-testid="avatar" />);
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<DogAvatar name="Buddy" className="custom-class" data-testid="avatar" />);
    expect(screen.getByTestId('avatar')).toHaveClass('custom-class');
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
    expect(screen.getByTestId('avatar')).toHaveTextContent('BO');
  });

  it('limits initials to 2 characters', () => {
    render(<DogAvatar name="Buddy Joe Smith Wilson" data-testid="avatar" />);
    expect(screen.getByTestId('avatar')).toHaveTextContent('BJ');
  });

  it('converts initials to uppercase', () => {
    render(<DogAvatar name="buddy smith" data-testid="avatar" />);
    expect(screen.getByTestId('avatar')).toHaveTextContent('BS');
  });
});
