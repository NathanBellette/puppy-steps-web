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

  it('renders main content area', () => {
    render(<LayoutWrapper />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders mobile navigation', () => {
    render(<LayoutWrapper />);
    expect(screen.getByText('Mobile Navigation')).toBeInTheDocument();
  });

  it('renders page content through outlet', () => {
    render(<LayoutWrapper />);
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });
});
