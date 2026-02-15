import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionItem } from './SessionItem';
import { Session } from '@/types';
import { formatDateTime } from '@/lib/utils';

describe('SessionItem', () => {
  const mockSession: Session = {
    id: 'session-1',
    userId: 'user-1',
    dogId: 'dog-1',
    date: new Date('2024-01-15T10:30:00'),
    type: 'people',
    reaction: '😊',
    notes: 'Met a friendly stranger',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    category: ''
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });

  it('renders session with correct information', () => {
    render(<SessionItem session={mockSession} />);
    
    expect(screen.getByText('People')).toBeInTheDocument();
    expect(screen.getByText('😊')).toBeInTheDocument();
    expect(screen.getByText('Positive')).toBeInTheDocument();
    expect(screen.getByText('Met a friendly stranger')).toBeInTheDocument();
  });

  it('renders different session types correctly', () => {
    const { rerender } = render(<SessionItem session={mockSession} />);
    expect(screen.getByText('People')).toBeInTheDocument();

    rerender(<SessionItem session={{ ...mockSession, type: 'dogs' }} />);
    expect(screen.getByText('Dogs')).toBeInTheDocument();

    rerender(<SessionItem session={{ ...mockSession, type: 'environments' }} />);
    expect(screen.getByText('Environments')).toBeInTheDocument();

    rerender(<SessionItem session={{ ...mockSession, type: 'noises' }} />);
    expect(screen.getByText('Noises')).toBeInTheDocument();
  });

  it('renders different reaction levels correctly', () => {
    const { rerender } = render(<SessionItem session={mockSession} />);
    expect(screen.getByText('😊')).toBeInTheDocument();
    expect(screen.getByText('Positive')).toBeInTheDocument();

    rerender(<SessionItem session={{ ...mockSession, reaction: '😰' }} />);
    expect(screen.getByText('😰')).toBeInTheDocument();
    expect(screen.getByText('Very Negative')).toBeInTheDocument();

    rerender(<SessionItem session={{ ...mockSession, reaction: '😍' }} />);
    expect(screen.getByText('😍')).toBeInTheDocument();
    expect(screen.getByText('Very Positive')).toBeInTheDocument();
  });

  it('renders formatted date using the real formatDateTime function', () => {
    render(<SessionItem session={mockSession} />);
    const expectedDate = formatDateTime(mockSession.date);
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  it('renders photo when photoUrl is provided', () => {
    const sessionWithPhoto = { ...mockSession, photoUrl: 'https://example.com/photo.jpg' };
    render(<SessionItem session={sessionWithPhoto} />);
    
    const img = screen.getByAltText('Session photo');
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('does not render photo when photoUrl is not provided', () => {
    render(<SessionItem session={mockSession} />);
    expect(screen.queryByAltText('Session photo')).not.toBeInTheDocument();
  });

  it('does not render notes when notes are not provided', () => {
    const sessionWithoutNotes = { ...mockSession, notes: undefined };
    render(<SessionItem session={sessionWithoutNotes} />);
    expect(screen.queryByText('Met a friendly stranger')).not.toBeInTheDocument();
  });

  it('shows edit button when onEdit is provided', () => {
    render(<SessionItem session={mockSession} onEdit={mockOnEdit} />);
    expect(screen.getByRole('button', { name: /edit session/i })).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<SessionItem session={mockSession} onEdit={mockOnEdit} />);
    
    await user.click(screen.getByRole('button', { name: /edit session/i }));
    expect(mockOnEdit).toHaveBeenCalledWith('session-1');
  });

  it('shows delete button when onDelete is provided', () => {
    render(<SessionItem session={mockSession} onDelete={mockOnDelete} />);
    expect(screen.getByRole('button', { name: /delete session/i })).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<SessionItem session={mockSession} onDelete={mockOnDelete} />);
    
    await user.click(screen.getByRole('button', { name: /delete session/i }));
    expect(mockOnDelete).toHaveBeenCalledWith('session-1');
  });

  it('does not show edit button when onEdit is not provided', () => {
    render(<SessionItem session={mockSession} />);
    expect(screen.queryByRole('button', { name: /edit session/i })).not.toBeInTheDocument();
  });

  it('does not show delete button when onDelete is not provided', () => {
    render(<SessionItem session={mockSession} />);
    expect(screen.queryByRole('button', { name: /delete session/i })).not.toBeInTheDocument();
  });

  it('renders session type icon', () => {
    render(<SessionItem session={mockSession} />);
    const iconContainer = screen.getByText('People').closest('div')?.querySelector('svg');
    expect(iconContainer).toBeInTheDocument();
  });

  it('handles empty notes gracefully', () => {
    const sessionWithEmptyNotes = { ...mockSession, notes: '' };
    render(<SessionItem session={sessionWithEmptyNotes} />);
    expect(screen.queryByText('Met a friendly stranger')).not.toBeInTheDocument();
  });

  it('shows category when provided', () => {
    const sessionWithCategory = { ...mockSession, category: 'Men' };
    render(<SessionItem session={sessionWithCategory} />);
    expect(screen.getByText('• Men')).toBeInTheDocument();
  });

  it('falls back to neutral emoji for unknown reaction', () => {
    const sessionUnknown = { ...mockSession, reaction: 'unknown' as Session['reaction'] };
    render(<SessionItem session={sessionUnknown} />);
    expect(screen.getByText('😐')).toBeInTheDocument();
    expect(screen.getByText('Neutral')).toBeInTheDocument();
  });
});
