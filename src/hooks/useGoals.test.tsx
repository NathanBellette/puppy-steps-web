import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useGoals, useGoalStats } from './useGoals';
import { Goal } from '@/types';

// --- Mocks ---

const mockUser = { uid: 'user-1', email: 'test@test.com', displayName: 'Test' };

vi.mock('./useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}));

const mockGoals: Goal[] = [
  {
    id: 'goal-1',
    userId: 'user-1',
    dogId: 'dog-1',
    category: 'Men',
    type: 'people',
    calmTargetCount: 5,
    varietyTargetCount: 3,
    targetCount: 5,
    currentCount: 3,
    isCompleted: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'goal-2',
    userId: 'user-1',
    dogId: 'dog-1',
    category: 'Small Dogs',
    type: 'dogs',
    calmTargetCount: 5,
    varietyTargetCount: 3,
    targetCount: 5,
    currentCount: 5,
    isCompleted: true,
    completedDate: new Date('2024-02-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-01'),
  },
];

const mockGetUserGoals = vi.fn().mockResolvedValue(mockGoals);
const mockCreateGoal = vi.fn().mockResolvedValue('goal-3');
const mockUpdateGoal = vi.fn().mockResolvedValue(undefined);
const mockDeleteGoal = vi.fn().mockResolvedValue(undefined);
const mockCreateGoalsBatch = vi.fn().mockResolvedValue(undefined);

vi.mock('@/lib/firestore', () => ({
  getUserGoals: (...args: unknown[]) => mockGetUserGoals(...args),
  createGoal: (...args: unknown[]) => mockCreateGoal(...args),
  updateGoal: (...args: unknown[]) => mockUpdateGoal(...args),
  deleteGoal: (...args: unknown[]) => mockDeleteGoal(...args),
  createGoalsBatch: (...args: unknown[]) => mockCreateGoalsBatch(...args),
}));

// --- Helpers ---

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// --- Tests ---

describe('useGoals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserGoals.mockResolvedValue(mockGoals);
  });

  it('fetches goals for the authenticated user', async () => {
    const { result } = renderHook(() => useGoals('dog-1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetUserGoals).toHaveBeenCalledWith('user-1', 'dog-1');
    expect(result.current.goals).toEqual(mockGoals);
  });

  it('returns empty array when no goals exist', async () => {
    mockGetUserGoals.mockResolvedValue([]);

    const { result } = renderHook(() => useGoals('dog-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.goals).toEqual([]);
  });

  it('createGoal calls firestore with correct data', async () => {
    const { result } = renderHook(() => useGoals('dog-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.createGoal({
        dogId: 'dog-1',
        category: 'Women',
        type: 'people',
        calmTargetCount: 5,
        varietyTargetCount: 3,
      });
    });

    expect(mockCreateGoal).toHaveBeenCalledWith(
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

  it('toggleGoal marks goal as completed', async () => {
    const { result } = renderHook(() => useGoals('dog-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleGoal({ id: 'goal-1', isCompleted: true });
    });

    expect(mockUpdateGoal).toHaveBeenCalledWith(
      'goal-1',
      expect.objectContaining({
        isCompleted: true,
        completedDate: expect.any(Date),
      })
    );
  });

  it('toggleGoal marks goal as uncompleted', async () => {
    const { result } = renderHook(() => useGoals('dog-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleGoal({ id: 'goal-2', isCompleted: false });
    });

    expect(mockUpdateGoal).toHaveBeenCalledWith(
      'goal-2',
      expect.objectContaining({
        isCompleted: false,
        completedDate: undefined,
      })
    );
  });

  it('initializeGoals creates batch of predefined goals', async () => {
    const { result } = renderHook(() => useGoals('dog-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.initializeGoals('dog-1');
    });

    expect(mockCreateGoalsBatch).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ category: 'Men', type: 'people', dogId: 'dog-1', userId: 'user-1' }),
        expect.objectContaining({ category: 'Small Dogs', type: 'dogs' }),
      ])
    );
    // 28 predefined goals (6 people + 5 dogs + 8 environments + 9 noises)
    expect(mockCreateGoalsBatch.mock.calls[0][0]).toHaveLength(28);
  });

  it('deleteGoal calls firestore with correct id', async () => {
    const { result } = renderHook(() => useGoals('dog-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteGoal('goal-1');
    });

    expect(mockDeleteGoal.mock.calls[0][0]).toBe('goal-1');
  });
});

describe('useGoalStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserGoals.mockResolvedValue(mockGoals);
  });

  it('derives stats from goal data', async () => {
    const { result } = renderHook(() => useGoalStats('dog-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats).toBeDefined();
    expect(result.current.stats.totalGoals).toBe(2);
    expect(result.current.stats.completedGoals).toBe(1);
  });

  it('returns zero stats when no goals', async () => {
    mockGetUserGoals.mockResolvedValue([]);

    const { result } = renderHook(() => useGoalStats('dog-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats.totalGoals).toBe(0);
    expect(result.current.stats.completedGoals).toBe(0);
  });
});
