import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

// Mock the hooks and context
const mockUser = {
  displayName: 'John Doe',
  email: 'john@example.com',
  photoURL: 'https://example.com/photo.jpg',
};

const mockDogs = [
  { id: 'dog-1', name: 'Buddy', photoUrl: 'https://example.com/buddy.jpg' },
  { id: 'dog-2', name: 'Max', photoUrl: undefined },
];

let mockSelectedDog = mockDogs[0];
const mockSetSelectedDog = vi.fn((dog) => {
  mockSelectedDog = dog;
});

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock('@/hooks/useDogProfile', () => ({
  useDogs: () => ({
    dogs: mockDogs,
    selectedDog: mockSelectedDog,
    setSelectedDog: mockSetSelectedDog,
  }),
}));

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

const renderHeader = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );

describe('Header', () => {
  it('renders header with banner role', () => {
    renderHeader();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders app icon that links to home page', () => {
    renderHeader();

    const homeLink = screen.getByRole('link', { name: /go to home page/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/dashboard');
  });

  it('renders dog avatar when selected dog exists', () => {
    renderHeader();

    const dogAvatar = screen.getByTestId('dog-avatar');
    expect(dogAvatar).toBeInTheDocument();
    expect(dogAvatar).toHaveAttribute('data-name', 'Buddy');
    expect(dogAvatar).toHaveAttribute('data-photo', 'https://example.com/buddy.jpg');
    expect(dogAvatar).toHaveAttribute('data-size', 'sm');
  });

  it('renders dog selector with options', () => {
    renderHeader();

    const select = screen.getByTestId('dog-select');
    expect(select).toHaveValue('dog-1');

    expect(screen.getByRole('option', { name: 'Select a dog' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Buddy' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Max' })).toBeInTheDocument();
  });

  it('handles dog selection change', async () => {
    const user = userEvent.setup();
    renderHeader();

    const select = screen.getByTestId('dog-select');
    await user.selectOptions(select, 'dog-2');

    expect(mockSetSelectedDog).toHaveBeenCalledWith(mockDogs[1]);
  });

  it('renders user information', () => {
    renderHeader();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders user avatar with photo', () => {
    renderHeader();

    const userAvatar = screen.getByAltText('User avatar');
    expect(userAvatar).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('does not render hamburger menu button', () => {
    renderHeader();
    expect(screen.queryByRole('button', { name: /open menu/i })).not.toBeInTheDocument();
  });
});
