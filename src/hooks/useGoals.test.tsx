import { act } from '@testing-library/react';
import { useGoals, useGoalStats } from './useGoals';
import { getUserGoals, createGoal, updateGoal, deleteGoal, createGoalsBatch } from '@/lib/firestore';
import { makeGoal } from '@/test/fixtures';
import { renderLoadedHook } from '@/test/utils';

vi.mock('./useAuth');
vi.mock('@/lib/firestore');

const mockGoals = [
  makeGoal({ currentCount: 3 }),
  makeGoal({
    id: 'goal-2',
    category: 'Small Dogs',
    type: 'dogs',
    currentCount: 5,
    isCompleted: true,
    completedDate: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  }),
];

const renderGoals = async () => (await renderLoadedHook(() => useGoals('dog-1'))).result;

describe('useGoals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserGoals).mockResolvedValue(mockGoals);
  });

  it.each([
    { scenario: 'fetches goals for the authenticated user', goals: mockGoals },
    { scenario: 'returns empty array when no goals exist', goals: [] },
  ])('$scenario', async ({ goals }) => {
    vi.mocked(getUserGoals).mockResolvedValue(goals);

    const { result, initiallyLoading } = await renderLoadedHook(() => useGoals('dog-1'));

    expect(initiallyLoading).toBe(true);
    expect(getUserGoals).toHaveBeenCalledWith('user-1', 'dog-1');
    expect(result.current.goals).toEqual(goals);
  });

  it('createGoal calls firestore with correct data', async () => {
    const result = await renderGoals();

    await act(async () => {
      await result.current.createGoal({
        dogId: 'dog-1',
        category: 'Women',
        type: 'people',
        calmTargetCount: 5,
        varietyTargetCount: 3,
      });
    });

    expect(createGoal).toHaveBeenCalledWith(
      expect.objectContaining({
        dogId: 'dog-1',
        category: 'Women',
        type: 'people',
        userId: 'user-1',
        calmTargetCount: 5,
        varietyTargetCount: 3,
        currentCount: 0,
        isCompleted: false,
      })
    );
  });

  it.each([
    { id: 'goal-1', isCompleted: true, completedDate: expect.any(Date), state: 'completed' },
    { id: 'goal-2', isCompleted: false, completedDate: undefined, state: 'uncompleted' },
  ])('toggleGoal marks goal as $state', async ({ id, isCompleted, completedDate }) => {
    const result = await renderGoals();

    await act(async () => {
      await result.current.toggleGoal({ id, isCompleted });
    });

    expect(updateGoal).toHaveBeenCalledWith(id, expect.objectContaining({ isCompleted, completedDate }));
  });

  it('initializeGoals creates batch of predefined goals', async () => {
    const result = await renderGoals();

    await act(async () => {
      await result.current.initializeGoals('dog-1');
    });

    expect(createGoalsBatch).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ category: 'Men', type: 'people', dogId: 'dog-1', userId: 'user-1' }),
        expect.objectContaining({ category: 'Small Dogs', type: 'dogs' }),
      ])
    );
    // 28 predefined goals (6 people + 5 dogs + 8 environments + 9 noises)
    expect(vi.mocked(createGoalsBatch).mock.calls[0][0]).toHaveLength(28);
  });

  it('deleteGoal calls firestore with correct id', async () => {
    const result = await renderGoals();

    await act(async () => {
      await result.current.deleteGoal('goal-1');
    });

    expect(vi.mocked(deleteGoal).mock.calls[0][0]).toBe('goal-1');
  });
});

describe('useGoalStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    { goals: mockGoals, totalGoals: 2, completedGoals: 1, scenario: 'derives stats from goal data' },
    { goals: [], totalGoals: 0, completedGoals: 0, scenario: 'returns zero stats when no goals' },
  ])('$scenario', async ({ goals, totalGoals, completedGoals }) => {
    vi.mocked(getUserGoals).mockResolvedValue(goals);

    const { result } = await renderLoadedHook(() => useGoalStats('dog-1'));

    expect(result.current.stats).toMatchObject({ totalGoals, completedGoals });
  });
});
