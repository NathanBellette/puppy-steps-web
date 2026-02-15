import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import { Dog, Goal, Session } from '@/types';
import { TargetProgress } from '@/services/targetProgress';

// --- Mocks ---

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockUseDogs = vi.fn();
vi.mock('@/hooks/useDogProfile', () => ({
  useDogs: () => mockUseDogs(),
}));

const mockUseGoals = vi.fn();
vi.mock('@/hooks/useGoals', () => ({
  useGoals: () => mockUseGoals(),
}));

const mockUseTargetProgress = vi.fn();
vi.mock('@/hooks/useTargetProgress', () => ({
  useTargetProgress: () => mockUseTargetProgress(),
}));

const mockUseSessionStats = vi.fn();
const mockUseSessions = vi.fn();
vi.mock('@/hooks/useSessions', () => ({
  useSessions: () => mockUseSessions(),
  useSessionStats: () => mockUseSessionStats(),
}));

vi.mock('@/services/targetProgress', () => ({
  getCoachingTip: () => 'Keep going!',
}));

vi.mock('@/components/AddDogModal', () => ({
  AddDogModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="add-dog-modal">Add Dog Modal</div> : null,
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

const baseGoal: Goal = {
  id: 'goal-1',
  userId: 'user-1',
  dogId: 'dog-1',
  category: 'Men',
  type: 'people',
  calmTargetCount: 5,
  varietyTargetCount: 3,
  targetCount: 5,
  currentCount: 0,
  isCompleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseSession: Session = {
  id: 'session-1',
  userId: 'user-1',
  dogId: 'dog-1',
  date: new Date(),
  type: 'people',
  category: 'Men',
  reaction: '😊',
  createdAt: new Date(),
};

const baseProgress: TargetProgress = {
  goalId: 'goal-1',
  category: 'Men',
  type: 'people',
  calmCount: 2,
  calmTarget: 5,
  varietyCount: 1,
  varietyTarget: 3,
  isComplete: false,
  lastLogged: new Date(),
  varietyKeys: new Set(['park']),
};

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

function setupDefaultMocks(overrides?: {
  selectedDog?: Dog | null;
  goals?: Goal[];
  sessions?: Session[];
  progress?: Record<string, TargetProgress>;
}) {
  const selectedDog = overrides?.selectedDog !== undefined ? overrides.selectedDog : baseDog;
  const goals = overrides?.goals ?? [baseGoal];
  const sessions = overrides?.sessions ?? [baseSession];
  const progress = overrides?.progress ?? { 'goal-1': baseProgress };

  mockUseDogs.mockReturnValue({ selectedDog, dogs: selectedDog ? [selectedDog] : [] });
  mockUseGoals.mockReturnValue({ goals, isLoading: false });
  mockUseSessions.mockReturnValue({ sessions, isLoading: false });
  mockUseSessionStats.mockReturnValue({
    stats: { totalSessions: sessions.length, sessionsByType: { people: 1, dogs: 0, environments: 0, noises: 0 }, averageReaction: 4.0, recentSessions: sessions },
    isLoading: false,
  });
  mockUseTargetProgress.mockReturnValue({
    progress,
    categoryProgress: {
      people: { total: 6, completed: 0, percentage: 0 },
      dogs: { total: 5, completed: 0, percentage: 0 },
      environments: { total: 8, completed: 0, percentage: 0 },
      noises: { total: 9, completed: 0, percentage: 0 },
    },
    totalTargets: 28,
    completedTargets: 0,
    overallPercentage: 0,
    isLoading: false,
  });
}

// --- Tests ---

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no dog is selected', () => {
    setupDefaultMocks({ selectedDog: null });
    renderDashboard();

    expect(screen.getByText('No Dog Selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add dog profile/i })).toBeInTheDocument();
  });

  it('opens AddDogModal when "Add Dog Profile" is clicked in empty state', async () => {
    const user = userEvent.setup();
    setupDefaultMocks({ selectedDog: null });
    renderDashboard();

    await user.click(screen.getByRole('button', { name: /add dog profile/i }));

    expect(screen.getByTestId('add-dog-modal')).toBeInTheDocument();
  });

  it('renders dog name and breed when a dog is selected', () => {
    setupDefaultMocks();
    renderDashboard();

    expect(screen.getByText("Buddy's Dashboard")).toBeInTheDocument();
    expect(screen.getByText(/Labrador/)).toBeInTheDocument();
    expect(screen.getByText(/6 months old/)).toBeInTheDocument();
  });

  it('renders the Log Exposure CTA button', () => {
    setupDefaultMocks();
    renderDashboard();

    // There may be multiple "Log Exposure" buttons (main CTA + GoalItem)
    const buttons = screen.getAllByRole('button', { name: /log exposure/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('opens the Log Session modal when Log Exposure is clicked', async () => {
    const user = userEvent.setup();
    setupDefaultMocks();
    renderDashboard();

    // The main CTA "Log Exposure" is the first matching button (GoalItem also has one)
    const logButtons = screen.getAllByRole('button', { name: /log exposure/i });
    await user.click(logButtons[0]);

    expect(screen.getByTestId('log-session-modal')).toBeInTheDocument();
  });

  it("renders Today's Plan with incomplete goals", () => {
    setupDefaultMocks();
    renderDashboard();

    expect(screen.getByText("Today's Plan")).toBeInTheDocument();
    // The goal item with coaching tip
    expect(screen.getByText('Keep going!')).toBeInTheDocument();
  });

  it('renders "Great progress!" when all targets are on track', () => {
    const completeProgress: TargetProgress = {
      ...baseProgress,
      calmCount: 5,
      varietyCount: 3,
      isComplete: true,
    };
    setupDefaultMocks({ progress: { 'goal-1': completeProgress } });
    renderDashboard();

    expect(screen.getByText('Great progress!')).toBeInTheDocument();
  });

  it('renders stats cards with correct data', () => {
    setupDefaultMocks();
    renderDashboard();

    // Completed targets
    expect(screen.getByText('0/28')).toBeInTheDocument();
    // Average reaction
    expect(screen.getByText('4.0/5')).toBeInTheDocument();
    // Targets label
    expect(screen.getByText('Targets')).toBeInTheDocument();
  });

  it('renders recent sessions section', () => {
    setupDefaultMocks();
    renderDashboard();

    expect(screen.getByText('Recent Sessions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view all sessions/i })).toBeInTheDocument();
  });

  it('navigates to sessions page when View All Sessions is clicked', async () => {
    const user = userEvent.setup();
    setupDefaultMocks();
    renderDashboard();

    await user.click(screen.getByRole('button', { name: /view all sessions/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/sessions');
  });

  it('renders "No sessions yet" when there are no sessions', () => {
    setupDefaultMocks({ sessions: [] });
    renderDashboard();

    expect(screen.getByText('No sessions yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log first exposure/i })).toBeInTheDocument();
  });

  it('renders category progress section', () => {
    setupDefaultMocks();
    renderDashboard();

    expect(screen.getByText('Progress by Category')).toBeInTheDocument();
  });
});
