import { screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { clickButton, expectButtons, expectLink, renderWithRouter, stubHook } from '@/test/utils';

vi.mock('@/hooks/useAuth');

const mockSignOut = vi.fn();

const renderSidebar = () => renderWithRouter(<Sidebar />);

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubHook(useAuth, { signOut: mockSignOut });
  });

  it('renders the app logo that links to home page', () => {
    renderSidebar();

    expectLink(/go to home page/i, '/dashboard');
  });

  it('renders the PuppySteps heading', () => {
    renderSidebar();

    expect(screen.getByRole('heading', { name: 'PuppySteps' })).toBeInTheDocument();
  });

  it.each([
    { name: /dashboard/i, href: '/dashboard' },
    { name: /plan/i, href: '/goals' },
    { name: /sessions/i, href: '/sessions' },
    { name: /calendar/i, href: '/calendar' },
    { name: /resources/i, href: '/resources' },
    { name: /settings/i, href: '/settings' },
  ])('renders the $name navigation link to $href', ({ name, href }) => {
    renderSidebar();

    expectLink(name, href);
  });

  it('renders the sign out button', () => {
    renderSidebar();

    expectButtons(/sign out/i);
  });

  it('calls signOut when sign out button is clicked', async () => {
    renderSidebar();

    await clickButton(/sign out/i);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
