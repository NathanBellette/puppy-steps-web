import { render, screen } from '@testing-library/react';
import { DogAvatar, DogAvatarProps } from './DogAvatar';

describe('DogAvatar', () => {
  const renderAvatar = (props: Partial<DogAvatarProps> = {}) => {
    render(<DogAvatar name="Buddy" data-testid="avatar" {...props} />);
    return screen.getByTestId('avatar');
  };

  it.each([
    { scenario: 'renders with initials when no photo is provided', name: 'Buddy Smith', initials: 'BS' },
    { scenario: 'renders with single word name initials', name: 'Max', initials: 'M' },
    { scenario: 'handles name with special characters', name: "Buddy-Joe O'Connor", initials: 'BO' },
    { scenario: 'limits initials to 2 characters', name: 'Buddy Joe Smith Wilson', initials: 'BJ' },
    { scenario: 'converts initials to uppercase', name: 'buddy smith', initials: 'BS' },
  ])('$scenario', ({ name, initials }) => {
    expect(renderAvatar({ name })).toHaveTextContent(initials);
  });

  it('renders with photo when photoUrl is provided', () => {
    const photoUrl = 'https://example.com/dog-photo.jpg';
    const img = renderAvatar({ photoUrl }).querySelector('img');

    expect(img).toHaveAttribute('src', photoUrl);
    expect(img).toHaveAttribute('alt', "Buddy's photo");
  });

  it.each(['sm', 'md', 'lg', 'xl'] as const)('renders without crashing at size %s', (size) => {
    expect(renderAvatar({ size })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    expect(renderAvatar({ className: 'custom-class' })).toHaveClass('custom-class');
  });

  it('handles empty name gracefully', () => {
    // Should show Dog icon when no initials can be generated
    expect(renderAvatar({ name: '' }).querySelector('svg')).toBeInTheDocument();
  });
});
