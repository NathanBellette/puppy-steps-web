import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionItem } from './SessionItem';
import { Session } from '@/types';

// Mock the utils functions
vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  formatDateTime: (date: Date) => date.toLocaleDateString(),
  getReactionEmoji: (reaction: string) => reaction,
  getReactionLabel: (reaction: string) => {
    const labels: Record<string, string> = {
      '😰': 'Very Scared',
      '😟': 'Scared',
      '😐': 'Neutral',
      '😊': 'Happy',
      '😄': 'Very Happy',
    };
    return labels[reaction] || reaction;
  },
  capitalizeFirst: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
}));

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
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });

  it('renders session with correct information', () => {
    render(<SessionItem session={mockSession} />);
    
    expect(screen.getByText('Person')).toBeInTheDocument();
    expect(screen.getByText('😊')).toBeInTheDocument();
    expect(screen.getByText('Happy')).toBeInTheDocument();
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
    expect(screen.getByText('Happy')).toBeInTheDocument();

    rerender(<SessionItem session={{ ...mockSession, reaction: '😰' }} />);
    expect(screen.getByText('😰')).toBeInTheDocument();
    expect(screen.getByText('Very Scared')).toBeInTheDocument();

    rerender(<SessionItem session={{ ...mockSession, reaction: '😄' }} />);
    expect(screen.getByText('😄')).toBeInTheDocument();
    expect(screen.getByText('Very Happy')).toBeInTheDocument();
  });

  it('renders formatted date', () => {
    render(<SessionItem session={mockSession} />);
    
    expect(screen.getByText('1/15/2024')).toBeInTheDocument();
  });

  it('renders photo when photoUrl is provided', () => {
    const sessionWithPhoto = { ...mockSession, photoUrl: 'https://example.com/photo.jpg' };
    render(<SessionItem session={sessionWithPhoto} />);
    
    const img = screen.getByAltText('Session photo');
    expect(img).toBeInTheDocument();
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
    
    const editButton = screen.getByRole('button', { name: /edit session/i });
    expect(editButton).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<SessionItem session={mockSession} onEdit={mockOnEdit} />);
    
    const editButton = screen.getByRole('button', { name: /edit session/i });
    await user.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith('session-1');
  });

  it('shows delete button when onDelete is provided', () => {
    render(<SessionItem session={mockSession} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete session/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<SessionItem session={mockSession} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete session/i });
    await user.click(deleteButton);
    
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

  it('applies custom className', () => {
    render(<SessionItem session={mockSession} className="custom-class" />);
    
    // Find the root div element that should have the custom class
    const sessionItem = screen.getByText('Person').closest('div')?.parentElement?.parentElement?.parentElement;
    expect(sessionItem).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<SessionItem session={mockSession} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    const editButton = screen.getByRole('button', { name: /edit session/i });
    const deleteButton = screen.getByRole('button', { name: /delete session/i });
    
    expect(editButton).toHaveAttribute('aria-label');
    expect(deleteButton).toHaveAttribute('aria-label');
  });

  it('renders session type icon correctly', () => {
    render(<SessionItem session={mockSession} />);
    
    // Check that the icon is rendered (it should be an SVG element)
    const iconContainer = screen.getByText('Person').closest('div')?.querySelector('svg');
    expect(iconContainer).toBeInTheDocument();
  });

  it('handles empty notes gracefully', () => {
    const sessionWithEmptyNotes = { ...mockSession, notes: '' };
    render(<SessionItem session={sessionWithEmptyNotes} />);
    
    expect(screen.queryByText('Met a friendly stranger')).not.toBeInTheDocument();
  });
});
