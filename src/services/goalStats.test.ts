import { describe, it, expect } from 'vitest';
import { computeGoalStats, computeGoalProgress } from './goalStats';
import { Goal } from '@/types';

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'g-1',
    userId: 'u-1',
    dogId: 'd-1',
    category: 'Children',
    type: 'people',
    isCompleted: false,
    targetCount: 3,
    currentCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('computeGoalProgress', () => {
  it('returns zeros for empty array', () => {
    const result = computeGoalProgress([]);
    expect(result).toEqual({ total: 0, completed: 0, percentage: 0 });
  });

  it('computes progress correctly', () => {
    const goals = [
      makeGoal({ id: '1', isCompleted: true }),
      makeGoal({ id: '2', isCompleted: false }),
      makeGoal({ id: '3', isCompleted: true }),
      makeGoal({ id: '4', isCompleted: false }),
    ];
    const result = computeGoalProgress(goals);
    expect(result.total).toBe(4);
    expect(result.completed).toBe(2);
    expect(result.percentage).toBe(50);
  });

  it('returns 100% when all completed', () => {
    const goals = [
      makeGoal({ id: '1', isCompleted: true }),
      makeGoal({ id: '2', isCompleted: true }),
    ];
    expect(computeGoalProgress(goals).percentage).toBe(100);
  });
});

describe('computeGoalStats', () => {
  it('returns correct stats for empty array', () => {
    const stats = computeGoalStats([]);
    expect(stats.totalGoals).toBe(0);
    expect(stats.completedGoals).toBe(0);
    expect(stats.todaysGoals).toEqual([]);
    expect(stats.categoryProgress.people.total).toBe(0);
    expect(stats.categoryProgress.dogs.total).toBe(0);
    expect(stats.categoryProgress.environments.total).toBe(0);
    expect(stats.categoryProgress.noises.total).toBe(0);
  });

  it('groups goals by type correctly', () => {
    const goals = [
      makeGoal({ id: '1', type: 'people', isCompleted: true }),
      makeGoal({ id: '2', type: 'people', isCompleted: false }),
      makeGoal({ id: '3', type: 'dogs', isCompleted: true }),
      makeGoal({ id: '4', type: 'environments', isCompleted: false }),
      makeGoal({ id: '5', type: 'noises', isCompleted: true }),
      makeGoal({ id: '6', type: 'noises', isCompleted: true }),
    ];

    const stats = computeGoalStats(goals);
    expect(stats.totalGoals).toBe(6);
    expect(stats.completedGoals).toBe(4);

    expect(stats.categoryProgress.people).toEqual({ total: 2, completed: 1, percentage: 50 });
    expect(stats.categoryProgress.dogs).toEqual({ total: 1, completed: 1, percentage: 100 });
    expect(stats.categoryProgress.environments).toEqual({ total: 1, completed: 0, percentage: 0 });
    expect(stats.categoryProgress.noises).toEqual({ total: 2, completed: 2, percentage: 100 });
  });

  it('returns up to 5 incomplete goals as todaysGoals', () => {
    const goals = Array.from({ length: 10 }, (_, i) =>
      makeGoal({ id: `g-${i}`, isCompleted: false })
    );

    const stats = computeGoalStats(goals);
    expect(stats.todaysGoals.length).toBe(5);
  });

  it('excludes completed goals from todaysGoals', () => {
    const goals = [
      makeGoal({ id: '1', isCompleted: true }),
      makeGoal({ id: '2', isCompleted: false }),
    ];

    const stats = computeGoalStats(goals);
    expect(stats.todaysGoals.length).toBe(1);
    expect(stats.todaysGoals[0].id).toBe('2');
  });
});
