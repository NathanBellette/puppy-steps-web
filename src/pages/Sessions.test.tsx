import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Sessions } from './Sessions';
import { Dog, Session } from '@/types';

// --- Mocks ---

const mockUseDogs = vi.fn();
vi.mock('@/hooks/useDogProfile', () => ({
  useDogs: () => mockUseDogs(),
}));

const mockDeleteSession = vi.fn();
const mockUseSessions = vi.fn();
vi.mock('@/hooks/useSessions', () => ({
  useSessions: () => mockUseSessions(),
}));

const mockShowToast = vi.fn();
vi.mock('@/context/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock('@/components/LogSessionModal', () => ({
  LogSessionModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="log-session-modal">Log Session Modal</div> : null,
}));

// --- Helpers ---

const baseDog: Dog = {
  id: 'dog-1',
  userId: 'user-1',
  name: 'Buddy',
  age: 6,
  breed: 'Labrador',
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 'session-1',
    userId: 'user-1',
    dogId: 'dog-1',
    date: new Date('2025-06-15T10:00:00Z'),
    type: 'people',
    category: 'Men',
    reaction: '😊',
    createdAt: new Date('2025-06-15T10:00:00Z'),
    ...overrides,
  };
}

function renderSessions() {
  return render(
    <MemoryRouter>
      <Sessions />
    </MemoryRouter>
  );
}

function setupDefaultMocks(overrides?: {
  selectedDog?: Dog | null;
  sessions?: Session[];
  isLoading?: boolean;
}) {
  const selectedDog = overrides?.selectedDog !== undefined ? overrides.selectedDog : baseDog;
  const sessions = overrides?.sessions ?? [
    makeSession({ id: 's1', type: 'people', category: 'Men' }),
    makeSession({ id: 's2', type: 'dogs', category: 'Small Dogs' }),
    makeSession({ id: 's3', type: 'environments', category: 'Park' }),
  ];

  mockUseDogs.mockReturnValue({ selectedDog });
  mockUseSessions.mockReturnValue({
    sessions,
    isLoading: overrides?.isLoading ?? false,
    deleteSession: mockDeleteSession,
    isDeleting: false,
  });
}

// --- Tests ---

describe('Sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no dog is selected', () => {
    setupDefaultMocks({ selectedDog: null });
    renderSessions();

    expect(screen.getByText('No Dog Selected')).toBeInTheDocument();
  });

  it('renders the session log heading with dog name', () => {
    setupDefaultMocks();
    renderSessions();

    expect(screen.getByText('Session Log')).toBeInTheDocument();
    expect(screen.getByText(/Buddy's socialisation sessions/)).toBeInTheDocument();
  });

  it('renders the Log Session button', () => {
    setupDefaultMocks();
    renderSessions();

    expect(screen.getByRole('button', { name: /log session/i })).toBeInTheDocument();
  });

  it('opens the Log Session modal when button is clicked', async () => {
    const user = userEvent.setup();
    setupDefaultMocks();
    renderSessions();

    await user.click(screen.getByRole('button', { name: /log session/i }));

    expect(screen.getByTestId('log-session-modal')).toBeInTheDocument();
  });

  it('renders type filter pills including All', () => {
    setupDefaultMocks();
    renderSessions();

    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /people/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dogs/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /environments/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /noises/i })).toBeInTheDocument();
  });

  it('shows all sessions by default', () => {
    setupDefaultMocks();
    renderSessions();

    expect(screen.getByText('All Sessions')).toBeInTheDocument();
    expect(screen.getByText('3 sessions')).toBeInTheDocument();
  });

  it('filters sessions when a type filter is clicked', async () => {
    const user = userEvent.setup();
    setupDefaultMocks();
    renderSessions();

    await user.click(screen.getByRole('button', { name: /people/i }));

    expect(screen.getByText('People Sessions')).toBeInTheDocument();
    expect(screen.getByText(/1 session/)).toBeInTheDocument();
    expect(screen.getByText(/filtered/)).toBeInTheDocument();
  });

  it('shows loading skeletons when loading', () => {
    setupDefaultMocks({ isLoading: true });
    const { container } = renderSessions();

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when no sessions exist', () => {
    setupDefaultMocks({ sessions: [] });
    renderSessions();

    expect(screen.getByText('No sessions logged yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log your first session/i })).toBeInTheDocument();
  });

  it('shows filtered empty state when filter has no matches', async () => {
    const user = userEvent.setup();
    setupDefaultMocks({
      sessions: [makeSession({ id: 's1', type: 'people', category: 'Men' })],
    });
    renderSessions();

    await user.click(screen.getByRole('button', { name: /noises/i }));

    expect(screen.getByText('No noises sessions yet')).toBeInTheDocument();
  });

  it('shows delete confirmation modal when session delete is triggered', async () => {
    const user = userEvent.setup();
    setupDefaultMocks({
      sessions: [makeSession({ id: 's1', type: 'people', category: 'Men' })],
    });
    renderSessions();

    // SessionItem renders a trash icon button with aria-label="Delete session"
    const deleteButton = screen.getByRole('button', { name: /delete session/i });
    await user.click(deleteButton);

    // The Modal component opens with a dialog role
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    // Delete and Cancel buttons are visible
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls deleteSession and shows toast on confirm delete', async () => {
    const user = userEvent.setup();
    mockDeleteSession.mockResolvedValue(undefined);
    setupDefaultMocks({
      sessions: [makeSession({ id: 's1', type: 'people', category: 'Men' })],
    });
    renderSessions();

    // Trigger the delete via SessionItem's trash icon
    const deleteButton = screen.getByRole('button', { name: /delete session/i });
    await user.click(deleteButton);

    // Confirm in the modal
    const confirmButton = screen.getByRole('button', { name: /^delete$/i });
    await user.click(confirmButton);

    expect(mockDeleteSession).toHaveBeenCalledWith('s1');
    expect(mockShowToast).toHaveBeenCalledWith('Session deleted', 'success');
  });
});
