import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from './Layout';

// Mock the child components
vi.mock('../Sidebar/Sidebar', () => ({
  Sidebar: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <div data-testid="sidebar" data-open={isOpen}>
      <button onClick={onClose}>Close Sidebar</button>
    </div>
  ),
}));

vi.mock('../Header/Header', () => ({
  Header: ({ onMenuClick }: { onMenuClick: () => void }) => (
    <header data-testid="header">
      <button onClick={onMenuClick}>Open Menu</button>
    </header>
  ),
}));

vi.mock('../MobileNav/MobileNav', () => ({
  MobileNav: () => <nav data-testid="mobile-nav">Mobile Navigation</nav>,
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Page Content</div>,
  };
});

const LayoutWrapper = () => (
  <BrowserRouter>
    <Layout />
  </BrowserRouter>
);

describe('Layout', () => {
  it('renders all layout components', () => {
    render(<LayoutWrapper />);
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('starts with sidebar closed', () => {
    render(<LayoutWrapper />);
    
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-open', 'false');
  });

  it('opens sidebar when menu button is clicked', async () => {
    const user = userEvent.setup();
    render(<LayoutWrapper />);
    
    const menuButton = screen.getByRole('button', { name: /open menu/i });
    await user.click(menuButton);
    
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-open', 'true');
  });

  it('closes sidebar when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<LayoutWrapper />);
    
    // First open the sidebar
    const menuButton = screen.getByRole('button', { name: /open menu/i });
    await user.click(menuButton);
    
    // Then close it
    const closeButton = screen.getByRole('button', { name: /close sidebar/i });
    await user.click(closeButton);
    
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-open', 'false');
  });

  it('renders main content area with proper styling', () => {
    render(<LayoutWrapper />);
    
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('py-6');
  });

  it('renders content container with proper max width', () => {
    render(<LayoutWrapper />);
    
    const container = screen.getByTestId('outlet').parentElement;
    expect(container).toHaveClass('mx-auto', 'max-w-7xl', 'px-4', 'sm:px-6', 'lg:px-8');
  });

  it('has proper layout structure', () => {
    render(<LayoutWrapper />);
    
    const layout = screen.getByTestId('sidebar').closest('div')?.parentElement;
    expect(layout).toHaveClass('min-h-screen', 'bg-gray-50', 'dark:bg-gray-900');
  });

  it('renders mobile navigation', () => {
    render(<LayoutWrapper />);
    
    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
    expect(screen.getByText('Mobile Navigation')).toBeInTheDocument();
  });

  it('renders page content through outlet', () => {
    render(<LayoutWrapper />);
    
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });
});
