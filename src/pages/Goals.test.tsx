import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Goals } from './Goals';
import { Dog, Goal } from '@/types';
import { TargetProgress } from '@/services/targetProgress';

// --- Mocks ---

const mockUseDogs = vi.fn();
vi.mock('@/hooks/useDogProfile', () => ({
  useDogs: () => mockUseDogs(),
}));

const mockInitializeGoals = vi.fn();
const mockUseGoals = vi.fn();
vi.mock('@/hooks/useGoals', () => ({
  useGoals: () => mockUseGoals(),
}));

const mockUseTargetProgress = vi.fn();
vi.mock('@/hooks/useTargetProgress', () => ({
  useTargetProgress: () => mockUseTargetProgress(),
}));

vi.mock('@/services/targetProgress', () => ({
  getCoachingTip: () => 'Keep going!',
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

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
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
    ...overrides,
  };
}

function makeProgress(goalId: string, overrides: Partial<TargetProgress> = {}): TargetProgress {
  return {
    goalId,
    category: 'Men',
    type: 'people',
    calmCount: 2,
    calmTarget: 5,
    varietyCount: 1,
    varietyTarget: 3,
    isComplete: false,
    lastLogged: new Date(),
    varietyKeys: new Set(['park']),
    ...overrides,
  };
}

function renderGoals() {
  return render(
    <MemoryRouter>
      <Goals />
    </MemoryRouter>
  );
}

function setupDefaultMocks(overrides?: {
  selectedDog?: Dog | null;
  goals?: Goal[];
  progress?: Record<string, TargetProgress>;
  isLoading?: boolean;
  isInitializing?: boolean;
}) {
  const selectedDog = overrides?.selectedDog !== undefined ? overrides.selectedDog : baseDog;
  const goals = overrides?.goals ?? [
    makeGoal({ id: 'g1', category: 'Men', type: 'people' }),
    makeGoal({ id: 'g2', category: 'Women', type: 'people' }),
    makeGoal({ id: 'g3', category: 'Small Dogs', type: 'dogs' }),
  ];
  const progress = overrides?.progress ?? {
    g1: makeProgress('g1'),
    g2: makeProgress('g2', { category: 'Women' }),
    g3: makeProgress('g3', { category: 'Small Dogs', type: 'dogs' }),
  };

  mockUseDogs.mockReturnValue({ selectedDog });
  mockUseGoals.mockReturnValue({
    goals,
    isLoading: overrides?.isLoading ?? false,
    initializeGoals: mockInitializeGoals,
    isInitializing: overrides?.isInitializing ?? false,
  });
  mockUseTargetProgress.mockReturnValue({
    progress,
    categoryProgress: {
      people: { total: 2, completed: 0, percentage: 0 },
      dogs: { total: 1, completed: 0, percentage: 0 },
      environments: { total: 0, completed: 0, percentage: 0 },
      noises: { total: 0, completed: 0, percentage: 0 },
    },
    totalTargets: 3,
    completedTargets: 0,
    overallPercentage: 0,
    isLoading: false,
  });
}

// --- Tests ---

describe('Goals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no dog is selected', () => {
    setupDefaultMocks({ selectedDog: null });
    renderGoals();

    expect(screen.getByText('No Dog Selected')).toBeInTheDocument();
  });

  it('renders the page heading with dog name', () => {
    setupDefaultMocks();
    renderGoals();

    expect(screen.getByText('Plan')).toBeInTheDocument();
    expect(screen.getByText(/Buddy's socialisation targets/)).toBeInTheDocument();
  });

  it('shows "No Targets Yet" CTA when goals are empty', () => {
    setupDefaultMocks({ goals: [] });
    renderGoals();

    expect(screen.getByText('No Targets Yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create all targets/i })).toBeInTheDocument();
  });

  it('calls initializeGoals when Create All Targets is clicked', async () => {
    const user = userEvent.setup();
    mockInitializeGoals.mockResolvedValue(undefined);
    setupDefaultMocks({ goals: [] });
    renderGoals();

    await user.click(screen.getByRole('button', { name: /create all targets/i }));

    expect(mockInitializeGoals).toHaveBeenCalledWith('dog-1');
  });

  it('shows "Creating Targets..." when initializing', () => {
    setupDefaultMocks({ goals: [], isInitializing: true });
    renderGoals();

    expect(screen.getByText('Creating Targets...')).toBeInTheDocument();
  });

  it('renders segmented control with type options when goals exist', () => {
    setupDefaultMocks();
    renderGoals();

    expect(screen.getByText('People')).toBeInTheDocument();
    expect(screen.getByText('Dogs')).toBeInTheDocument();
    expect(screen.getByText('Environments')).toBeInTheDocument();
    expect(screen.getByText(/Noises/)).toBeInTheDocument();
  });

  it('shows progress summary for the selected type', () => {
    setupDefaultMocks();
    renderGoals();

    // Default selected type is 'people'
    expect(screen.getByText('People Progress')).toBeInTheDocument();
    expect(screen.getByText(/of.*targets complete/)).toBeInTheDocument();
  });

  it('filters goals list by selected type', () => {
    setupDefaultMocks();
    renderGoals();

    // Default is 'people' which has 2 goals (Men and Women)
    expect(screen.getByText('People Targets')).toBeInTheDocument();
    // The coaching tip should appear for the goals
    expect(screen.getAllByText('Keep going!').length).toBeGreaterThanOrEqual(1);
  });

  it('switches type when a different segment is clicked', async () => {
    const user = userEvent.setup();
    setupDefaultMocks();
    renderGoals();

    // Click on Dogs segment
    await user.click(screen.getByText('Dogs'));

    expect(screen.getByText('Dogs Progress')).toBeInTheDocument();
    expect(screen.getByText('Dogs Targets')).toBeInTheDocument();
  });

  it('shows loading skeletons when loading', () => {
    setupDefaultMocks({ isLoading: true });
    const { container } = renderGoals();

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state for a type with no goals', async () => {
    const user = userEvent.setup();
    setupDefaultMocks({
      goals: [makeGoal({ id: 'g1', category: 'Men', type: 'people' })],
      progress: { g1: makeProgress('g1') },
    });
    renderGoals();

    // Click on Environments (which has 0 goals in our mock)
    await user.click(screen.getByText('Environments'));

    expect(screen.getByText('No Targets in This Category')).toBeInTheDocument();
  });
});
