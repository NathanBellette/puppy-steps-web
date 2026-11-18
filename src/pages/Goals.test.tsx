import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Goals } from './Goals';
import { useDogs } from '@/hooks/useDogProfile';
import { useGoals } from '@/hooks/useGoals';
import { useTargetProgress } from '@/hooks/useTargetProgress';
import { Dog, Goal } from '@/types';
import { TargetProgress } from '@/services/targetProgress';
import { makeDogsState, makeGoal, makeProgress, makeTargetProgressResult } from '@/test/fixtures';
import { clickButton, expectButtons, expectLoadingSkeletons, expectTexts, renderWithRouter, stubHook } from '@/test/utils';

// --- Mocks ---

vi.mock('@/hooks/useDogProfile');
vi.mock('@/hooks/useGoals');
vi.mock('@/hooks/useTargetProgress');
vi.mock('@/services/targetProgress');

const mockInitializeGoals = vi.fn();

// --- Helpers ---

function renderGoals(overrides?: {
  selectedDog?: Dog | null;
  goals?: Goal[];
  progress?: Record<string, TargetProgress>;
  isLoading?: boolean;
  isInitializing?: boolean;
}) {
  stubHook(useDogs, makeDogsState(overrides?.selectedDog));
  stubHook(useGoals, {
    goals: overrides?.goals ?? [
      makeGoal({ id: 'g1', category: 'Men', type: 'people' }),
      makeGoal({ id: 'g2', category: 'Women', type: 'people' }),
      makeGoal({ id: 'g3', category: 'Small Dogs', type: 'dogs' }),
    ],
    isLoading: overrides?.isLoading ?? false,
    initializeGoals: mockInitializeGoals,
    isInitializing: overrides?.isInitializing ?? false,
  });
  stubHook(
    useTargetProgress,
    makeTargetProgressResult(
      overrides?.progress ?? {
        g1: makeProgress({ goalId: 'g1' }),
        g2: makeProgress({ goalId: 'g2', category: 'Women' }),
        g3: makeProgress({ goalId: 'g3', category: 'Small Dogs', type: 'dogs' }),
      },
      { people: 2, dogs: 1, environments: 0, noises: 0 }
    )
  );

  return renderWithRouter(<Goals />);
}

// --- Tests ---

describe('Goals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    { scenario: 'renders the page heading with dog name', texts: ['Plan', /Buddy's socialisation targets/] },
    { scenario: 'renders segmented control with type options when goals exist', texts: ['People', 'Dogs', 'Environments', /Noises/] },
    // Default selected type is 'people'
    { scenario: 'shows progress summary for the selected type', texts: ['People Progress', /of.*targets complete/] },
  ])('$scenario', ({ texts }) => {
    renderGoals();

    expectTexts(...texts);
  });

  it('renders empty state when no dog is selected', () => {
    renderGoals({ selectedDog: null });

    expectTexts('No Dog Selected');
  });

  it('shows "No Targets Yet" CTA when goals are empty', () => {
    renderGoals({ goals: [] });

    expectTexts('No Targets Yet');
    expectButtons(/create all targets/i);
  });

  it('calls initializeGoals when Create All Targets is clicked', async () => {
    mockInitializeGoals.mockResolvedValue(undefined);
    renderGoals({ goals: [] });

    await clickButton(/create all targets/i);

    expect(mockInitializeGoals).toHaveBeenCalledWith('dog-1');
  });

  it('shows "Creating Targets..." when initializing', () => {
    renderGoals({ goals: [], isInitializing: true });

    expectTexts('Creating Targets...');
  });

  it('filters goals list by selected type', () => {
    renderGoals();

    // Default is 'people' which has 2 goals (Men and Women), each with a coaching tip
    expectTexts('People Targets');
    expect(screen.getAllByText('Keep going!').length).toBeGreaterThanOrEqual(1);
  });

  it('switches type when a different segment is clicked', async () => {
    renderGoals();

    await userEvent.setup().click(screen.getByText('Dogs'));

    expectTexts('Dogs Progress', 'Dogs Targets');
  });

  it('shows loading skeletons when loading', () => {
    expectLoadingSkeletons(renderGoals({ isLoading: true }).container);
  });

  it('shows empty state for a type with no goals', async () => {
    renderGoals({
      goals: [makeGoal({ id: 'g1', category: 'Men', type: 'people' })],
      progress: { g1: makeProgress({ goalId: 'g1' }) },
    });

    // Environments has no goals in this mock
    await userEvent.setup().click(screen.getByText('Environments'));

    expectTexts('No Targets in This Category');
  });
});
