import { useCallback, useMemo } from 'react';
import { useGoals } from './useGoals';
import { useSessions } from './useSessions';
import { computeTargetProgress, TargetProgress } from '@/services/targetProgress';
import { computeCategoryProgress, computeGoalProgress } from '@/services/goalStats';
import { SessionType } from '@/types/session';
import { Goal, GoalProgress } from '@/types/goal';

export interface TargetProgressResult {
  /** Per-goal computed progress, keyed by goal ID */
  progress: Record<string, TargetProgress>;
  /** Category-level aggregated progress */
  categoryProgress: Record<SessionType, GoalProgress>;
  /** Overall totals */
  totalTargets: number;
  completedTargets: number;
  overallPercentage: number;
  /** Loading state */
  isLoading: boolean;
}

/**
 * Hook that derives calm + variety progress for all goals
 * from session data. Single source of truth.
 */
export const useTargetProgress = (dogId?: string): TargetProgressResult => {
  const { goals, isLoading: goalsLoading } = useGoals(dogId);
  const { sessions, isLoading: sessionsLoading } = useSessions(dogId);

  const progress = useMemo(
    () => computeTargetProgress(goals, sessions),
    [goals, sessions]
  );

  const isTargetComplete = useCallback((goal: Goal) => !!progress[goal.id]?.isComplete, [progress]);

  const categoryProgress = useMemo(
    () => computeCategoryProgress(goals, isTargetComplete),
    [goals, isTargetComplete]
  );

  const overall = computeGoalProgress(goals, isTargetComplete);

  return {
    progress,
    categoryProgress,
    totalTargets: overall.total,
    completedTargets: overall.completed,
    overallPercentage: overall.percentage,
    isLoading: goalsLoading || sessionsLoading,
  };
};
