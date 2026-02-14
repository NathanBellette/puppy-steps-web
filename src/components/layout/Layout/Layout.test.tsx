import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from './Layout';

// Mock the child components
vi.mock('../Sidebar/Sidebar', () => ({
  Sidebar: () => (
    <div data-testid="sidebar">Sidebar</div>
  ),
}));

vi.mock('../Header/Header', () => ({
  Header: () => (
    <header data-testid="header">Header</header>
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
    
    const layout = screen.getByTestId('sidebar').parentElement;
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
