import { ComponentType, ReactElement, ReactNode } from 'react';
import type { Mock } from 'vitest';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type TextMatch = string | RegExp;

/** Sets the return value of a hook mocked through its __mocks__ module. */
export const stubHook = <F extends (...args: never[]) => unknown>(hook: F, value: Partial<ReturnType<F>>) =>
  (hook as unknown as Mock).mockReturnValue(value);

export const renderWithRouter = (ui: ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

export const createQueryWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

/** Renders a React Query backed hook and waits for it to finish loading. */
export const renderLoadedHook = async <T extends { isLoading: boolean }>(hook: () => T) => {
  const { result } = renderHook(hook, { wrapper: createQueryWrapper() });
  const initiallyLoading = result.current.isLoading;
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  return { result, initiallyLoading };
};

export const expectTexts = (...texts: TextMatch[]) =>
  texts.forEach((text) => expect(screen.getByText(text)).toBeInTheDocument());

export const expectButtons = (...names: TextMatch[]) =>
  names.forEach((name) => expect(screen.getByRole('button', { name })).toBeInTheDocument());

export const expectNoButton = (name: TextMatch) =>
  expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();

export const expectLink = (name: TextMatch, href: string) =>
  expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);

export const clickButton = (name: TextMatch) =>
  userEvent.setup().click(screen.getByRole('button', { name }));

/** Asserts an element carries every given attribute value. */
export const expectAttributes = (element: Element | null, attributes: Record<string, string>) =>
  Object.entries(attributes).forEach(([name, value]) => expect(element).toHaveAttribute(name, value));

export const expectLoadingSkeletons = (container: HTMLElement) =>
  expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);

/** Shared behaviour for components that accept a className and forward their ref. */
export const itAcceptsClassNameAndRef = (
  renderElement: (props: { className?: string; ref?: (node: unknown) => void }) => ReactElement,
  testId: string
) => {
  it('applies custom className', () => {
    render(renderElement({ className: 'custom-class' }));
    expect(screen.getByTestId(testId)).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(renderElement({ ref }));
    expect(ref).toHaveBeenCalled();
  });
};

/** Checks each part renders its children, inside a div unless `tagNames` says otherwise. */
export const itRendersChildren = (
  parts: Record<string, ComponentType<{ children?: ReactNode }>>,
  tagNames: Record<string, string> = {}
) =>
  it.each(Object.keys(parts))('%s renders its children', (name) => {
    const Part = parts[name];
    render(<Part>{`${name} text`}</Part>);
    expect(screen.getByText(`${name} text`).tagName).toBe(tagNames[name] ?? 'DIV');
  });
