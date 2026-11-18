import { Goal, GoalStats, GoalProgress } from '@/types';
import { SessionType, summariseBySessionType } from '@/types/session';

/**
 * Pure function: compute goal progress, counting the goals `isComplete` accepts
 * (by default, those marked completed).
 */
export function computeGoalProgress(
  goals: Goal[],
  isComplete: (goal: Goal) => boolean = (goal) => goal.isCompleted
): GoalProgress {
  const total = goals.length;
  const completed = goals.filter(isComplete).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, percentage };
}

/**
 * Pure function: compute goal progress for each session type.
 */
export function computeCategoryProgress(
  goals: Goal[],
  isComplete?: (goal: Goal) => boolean
): Record<SessionType, GoalProgress> {
  return summariseBySessionType(goals, (goalsOfType) => computeGoalProgress(goalsOfType, isComplete));
}

/**
 * Pure function: compute aggregate goal stats from a list of goals.
 * No Firebase dependency — fully testable.
 */
export function computeGoalStats(goals: Goal[]): GoalStats {
  const { total: totalGoals, completed: completedGoals } = computeGoalProgress(goals);
  const todaysGoals = goals.filter(g => !g.isCompleted).slice(0, 5);

  return {
    totalGoals,
    completedGoals,
    categoryProgress: computeCategoryProgress(goals),
    todaysGoals,
  };
}
