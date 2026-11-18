import { describe, it, expect } from 'vitest';
import { computeGoalStats, computeGoalProgress } from './goalStats';
import { makeGoal, sixTypesSpread } from '@/test/fixtures';

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
    expect(computeGoalProgress(goals)).toEqual({ total: 4, completed: 2, percentage: 50 });
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
    const emptyProgress = { total: 0, completed: 0, percentage: 0 };

    expect(stats).toEqual({
      totalGoals: 0,
      completedGoals: 0,
      todaysGoals: [],
      categoryProgress: {
        people: emptyProgress,
        dogs: emptyProgress,
        environments: emptyProgress,
        noises: emptyProgress,
      },
    });
  });

  it('groups goals by type correctly', () => {
    const completed = [true, false, true, false, true, true];
    const goals = sixTypesSpread.map((type, i) => makeGoal({ id: `${i + 1}`, type, isCompleted: completed[i] }));

    const stats = computeGoalStats(goals);
    expect(stats.totalGoals).toBe(6);
    expect(stats.completedGoals).toBe(4);
    expect(stats.categoryProgress).toEqual({
      people: { total: 2, completed: 1, percentage: 50 },
      dogs: { total: 1, completed: 1, percentage: 100 },
      environments: { total: 1, completed: 0, percentage: 0 },
      noises: { total: 2, completed: 2, percentage: 100 },
    });
  });

  it('returns up to 5 incomplete goals as todaysGoals', () => {
    const goals = Array.from({ length: 10 }, (_, i) =>
      makeGoal({ id: `g-${i}`, isCompleted: false })
    );

    expect(computeGoalStats(goals).todaysGoals.length).toBe(5);
  });

  it('excludes completed goals from todaysGoals', () => {
    const goals = [
      makeGoal({ id: '1', isCompleted: true }),
      makeGoal({ id: '2', isCompleted: false }),
    ];

    const { todaysGoals } = computeGoalStats(goals);
    expect(todaysGoals.length).toBe(1);
    expect(todaysGoals[0].id).toBe('2');
  });
});
