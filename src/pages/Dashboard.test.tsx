import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from './Dashboard';
import { useDogs } from '@/hooks/useDogProfile';
import { useGoals } from '@/hooks/useGoals';
import { useSessions, useSessionStats } from '@/hooks/useSessions';
import { useTargetProgress } from '@/hooks/useTargetProgress';
import { Dog, Session } from '@/types';
import { TargetProgress } from '@/services/targetProgress';
import { makeDogsState, makeGoal, makeProgress, makeSession, makeTargetProgressResult } from '@/test/fixtures';
import { clickButton, expectButtons, expectTexts, renderWithRouter, stubHook } from '@/test/utils';

// --- Mocks ---

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/hooks/useDogProfile');
vi.mock('@/hooks/useGoals');
vi.mock('@/hooks/useTargetProgress');
vi.mock('@/hooks/useSessions');
vi.mock('@/services/targetProgress');

vi.mock('@/components/AddDogModal', () => ({
  AddDogModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="add-dog-modal">Add Dog Modal</div> : null,
}));

// --- Helpers ---

function renderDashboard(overrides?: {
  selectedDog?: Dog | null;
  sessions?: Session[];
  progress?: Record<string, TargetProgress>;
}) {
  const sessions = overrides?.sessions ?? [makeSession()];

  stubHook(useDogs, makeDogsState(overrides?.selectedDog));
  stubHook(useGoals, { goals: [makeGoal()], isLoading: false });
  stubHook(useSessions, { sessions, isLoading: false });
  stubHook(useSessionStats, {
    stats: {
      totalSessions: sessions.length,
      sessionsByType: { people: 1, dogs: 0, environments: 0, noises: 0 },
      averageReaction: 4.0,
      recentSessions: sessions,
    },
    isLoading: false,
  });
  stubHook(
    useTargetProgress,
    makeTargetProgressResult(overrides?.progress ?? { 'goal-1': makeProgress() }, {
      people: 6,
      dogs: 5,
      environments: 8,
      noises: 9,
    })
  );

  return renderWithRouter(<Dashboard />);
}

// --- Tests ---

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    { scenario: 'renders dog name and breed when a dog is selected', texts: ["Buddy's Dashboard", /Labrador/, /6 months old/] },
    // The goal item shows the coaching tip
    { scenario: "renders Today's Plan with incomplete goals", texts: ["Today's Plan", 'Keep going!'] },
    // Completed targets, average reaction and the targets label
    { scenario: 'renders stats cards with correct data', texts: ['0/28', '4.0/5', 'Targets'] },
    { scenario: 'renders recent sessions section', texts: ['Recent Sessions'], buttons: [/view all sessions/i] },
    { scenario: 'renders category progress section', texts: ['Progress by Category'] },
  ])('$scenario', ({ texts, buttons = [] }) => {
    renderDashboard();

    expectTexts(...texts);
    expectButtons(...buttons);
  });

  it('renders empty state when no dog is selected', () => {
    renderDashboard({ selectedDog: null });

    expectTexts('No Dog Selected');
    expectButtons(/add dog profile/i);
  });

  it('opens AddDogModal when "Add Dog Profile" is clicked in empty state', async () => {
    renderDashboard({ selectedDog: null });

    await clickButton(/add dog profile/i);

    expect(screen.getByTestId('add-dog-modal')).toBeInTheDocument();
  });

  it('renders the Log Exposure CTA button', () => {
    renderDashboard();

    // There may be multiple "Log Exposure" buttons (main CTA + GoalItem)
    expect(screen.getAllByRole('button', { name: /log exposure/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to /log-exposure when Log Exposure is clicked', async () => {
    renderDashboard();

    // The main CTA "Log Exposure" is the first matching button (GoalItem also has one)
    await userEvent.setup().click(screen.getAllByRole('button', { name: /log exposure/i })[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/log-exposure', expect.any(Object));
  });

  it('renders "Great progress!" when all targets are on track', () => {
    renderDashboard({
      progress: { 'goal-1': makeProgress({ calmCount: 5, varietyCount: 3, isComplete: true }) },
    });

    expectTexts('Great progress!');
  });

  it('navigates to sessions page when View All Sessions is clicked', async () => {
    renderDashboard();

    await clickButton(/view all sessions/i);

    expect(mockNavigate).toHaveBeenCalledWith('/sessions');
  });

  it('renders "No sessions yet" when there are no sessions', () => {
    renderDashboard({ sessions: [] });

    expectTexts('No sessions yet');
    expectButtons(/log first exposure/i);
  });
});
