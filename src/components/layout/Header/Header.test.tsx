import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';
import { useAuth } from '@/hooks/useAuth';
import { useDogs } from '@/hooks/useDogProfile';
import { makeDog } from '@/test/fixtures';
import { expectAttributes, expectLink, expectNoButton, expectTexts, renderWithRouter, stubHook } from '@/test/utils';

// Mock the hooks and context
vi.mock('@/hooks/useAuth');
vi.mock('@/hooks/useDogProfile');

const mockDogs = [
  makeDog({ photoUrl: 'https://example.com/buddy.jpg' }),
  makeDog({ id: 'dog-2', name: 'Max', photoUrl: undefined }),
];

const mockSetSelectedDog = vi.fn();

// Mock the UI components
vi.mock('@/components/ui/DogAvatar', () => ({
  DogAvatar: ({ name, photoUrl, size }: { name: string; photoUrl?: string; size: string }) => (
    <div data-testid="dog-avatar" data-name={name} data-photo={photoUrl} data-size={size}>
      {name}
    </div>
  ),
}));

vi.mock('@/components/ui/Select', () => ({
  Select: ({ children, value, onChange, className }: any) => (
    <select data-testid="dog-select" value={value} onChange={onChange} className={className}>
      {children}
    </select>
  ),
  SelectOption: ({ children, value }: any) => (
    <option value={value}>{children}</option>
  ),
}));

const renderHeader = () => renderWithRouter(<Header />);

describe('Header', () => {
  beforeEach(() => {
    stubHook(useAuth, {
      user: { uid: 'user-1', displayName: 'John Doe', email: 'john@example.com', photoURL: 'https://example.com/photo.jpg' },
    });
    stubHook(useDogs, { dogs: mockDogs, selectedDog: mockDogs[0], setSelectedDog: mockSetSelectedDog });
  });

  it('renders header with banner role', () => {
    renderHeader();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders app icon that links to home page', () => {
    renderHeader();
    expectLink(/go to home page/i, '/dashboard');
  });

  it('renders dog avatar when selected dog exists', () => {
    renderHeader();

    expectAttributes(screen.getByTestId('dog-avatar'), {
      'data-name': 'Buddy',
      'data-photo': 'https://example.com/buddy.jpg',
      'data-size': 'sm',
    });
  });

  it('renders dog selector with options', () => {
    renderHeader();

    expect(screen.getByTestId('dog-select')).toHaveValue('dog-1');
    ['Select a dog', 'Buddy', 'Max'].forEach((name) => {
      expect(screen.getByRole('option', { name })).toBeInTheDocument();
    });
  });

  it('handles dog selection change', async () => {
    renderHeader();

    await userEvent.setup().selectOptions(screen.getByTestId('dog-select'), 'dog-2');

    expect(mockSetSelectedDog).toHaveBeenCalledWith(mockDogs[1]);
  });

  it('renders user information', () => {
    renderHeader();
    expectTexts('John Doe', 'john@example.com');
  });

  it('renders user avatar with photo', () => {
    renderHeader();
    expect(screen.getByAltText('User avatar')).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('does not render hamburger menu button', () => {
    renderHeader();
    expectNoButton(/open menu/i);
  });
});
