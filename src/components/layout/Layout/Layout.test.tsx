import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from './Layout';
import { expectTexts } from '@/test/utils';

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

const renderLayout = () =>
  render(
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );

describe('Layout', () => {
  it('renders all layout components', () => {
    renderLayout();

    ['sidebar', 'header', 'mobile-nav', 'outlet'].forEach((testId) => {
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });
  });

  it('renders main content area', () => {
    renderLayout();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it.each([
    { scenario: 'renders mobile navigation', text: 'Mobile Navigation' },
    { scenario: 'renders page content through outlet', text: 'Page Content' },
  ])('$scenario', ({ text }) => {
    renderLayout();
    expectTexts(text);
  });
});
