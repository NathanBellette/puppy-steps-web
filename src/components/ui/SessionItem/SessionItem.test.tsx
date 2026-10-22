import { render, screen } from '@testing-library/react';
import { SessionItem, SessionItemProps } from './SessionItem';
import { Session } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { makeSession } from '@/test/fixtures';
import { clickButton, expectButtons, expectNoButton, expectTexts } from '@/test/utils';

describe('SessionItem', () => {
  const mockSession = makeSession({
    date: new Date('2024-01-15T10:30:00'),
    notes: 'Met a friendly stranger',
    category: '',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  });

  const renderSession = (session: Partial<Session> = {}, props: Partial<SessionItemProps> = {}) =>
    render(<SessionItem session={{ ...mockSession, ...session }} {...props} />);

  it('renders session with correct information', () => {
    renderSession();

    expectTexts('People', '😊', 'Positive', 'Met a friendly stranger');
  });

  it.each([
    { type: 'people', label: 'People' },
    { type: 'dogs', label: 'Dogs' },
    { type: 'environments', label: 'Environments' },
    { type: 'noises', label: 'Noises' },
  ] as const)('renders $type session type as $label', ({ type, label }) => {
    renderSession({ type });

    expectTexts(label);
  });

  it.each([
    { reaction: '😊', emoji: '😊', label: 'Positive' },
    { reaction: '😰', emoji: '😰', label: 'Very Negative' },
    { reaction: '😍', emoji: '😍', label: 'Very Positive' },
    // Unknown reactions fall back to neutral
    { reaction: 'unknown', emoji: '😐', label: 'Neutral' },
  ])('renders reaction $reaction as $emoji $label', ({ reaction, emoji, label }) => {
    renderSession({ reaction: reaction as Session['reaction'] });

    expectTexts(emoji, label);
  });

  it('renders formatted date using the real formatDateTime function', () => {
    renderSession();

    expectTexts(formatDateTime(mockSession.date));
  });

  it('renders photo when photoUrl is provided', () => {
    renderSession({ photoUrl: 'https://example.com/photo.jpg' });

    expect(screen.getByAltText('Session photo')).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('does not render photo when photoUrl is not provided', () => {
    renderSession();

    expect(screen.queryByAltText('Session photo')).not.toBeInTheDocument();
  });

  it.each([
    { scenario: 'are not provided', notes: undefined },
    { scenario: 'are empty', notes: '' },
  ])('does not render notes when notes $scenario', ({ notes }) => {
    renderSession({ notes });

    expect(screen.queryByText('Met a friendly stranger')).not.toBeInTheDocument();
  });

  it.each([
    { action: 'edit', handler: 'onEdit' },
    { action: 'delete', handler: 'onDelete' },
  ] as const)('shows the $action button and calls $handler with the session id', async ({ action, handler }) => {
    const onAction = vi.fn();
    renderSession({}, { [handler]: onAction });
    const buttonName = new RegExp(`${action} session`, 'i');

    expectButtons(buttonName);
    await clickButton(buttonName);

    expect(onAction).toHaveBeenCalledWith('session-1');
  });

  it.each(['edit', 'delete'])('does not show %s button when its handler is not provided', (action) => {
    renderSession();

    expectNoButton(new RegExp(`${action} session`, 'i'));
  });

  it('renders session type icon', () => {
    renderSession();

    const iconContainer = screen.getByText('People').closest('div')?.querySelector('svg');
    expect(iconContainer).toBeInTheDocument();
  });

  it('shows category when provided', () => {
    renderSession({ category: 'Men' });

    expectTexts('• Men');
  });
});
