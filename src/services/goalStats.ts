import { Goal, GoalStats, GoalProgress } from '@/types';
import { SessionType } from '@/types/session';

const SESSION_TYPES: SessionType[] = ['people', 'dogs', 'environments', 'noises'];

/**
 * Pure function: compute goal progress for a given category.
 */
export function computeGoalProgress(goals: Goal[]): GoalProgress {
  const total = goals.length;
  const completed = goals.filter(g => g.isCompleted).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, percentage };
}

/**
 * Pure function: compute aggregate goal stats from a list of goals.
 * No Firebase dependency — fully testable.
 */
export function computeGoalStats(goals: Goal[]): GoalStats {
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.isCompleted).length;

  const categoryProgress: Record<SessionType, GoalProgress> = {} as Record<SessionType, GoalProgress>;
  for (const type of SESSION_TYPES) {
    const typeGoals = goals.filter(g => g.type === type);
    categoryProgress[type] = computeGoalProgress(typeGoals);
  }

  const todaysGoals = goals.filter(g => !g.isCompleted).slice(0, 5);

  return {
    totalGoals,
    completedGoals,
    categoryProgress,
    todaysGoals,
  };
}
