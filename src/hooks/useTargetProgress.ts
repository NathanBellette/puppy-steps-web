import { useMemo } from 'react';
import { useGoals } from './useGoals';
import { useSessions } from './useSessions';
import { computeTargetProgress, TargetProgress } from '@/services/targetProgress';
import { SessionType } from '@/types/session';
import { GoalProgress } from '@/types/goal';

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

  const categoryProgress = useMemo(() => {
    const types: SessionType[] = ['people', 'dogs', 'environments', 'noises'];
    const result = {} as Record<SessionType, GoalProgress>;

    for (const type of types) {
      const typeGoals = goals.filter(g => g.type === type);
      const total = typeGoals.length;
      const completed = typeGoals.filter(g => progress[g.id]?.isComplete).length;
      result[type] = {
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    }

    return result;
  }, [goals, progress]);

  const totalTargets = goals.length;
  const completedTargets = Object.values(progress).filter(p => p.isComplete).length;
  const overallPercentage = totalTargets > 0
    ? Math.round((completedTargets / totalTargets) * 100)
    : 0;

  return {
    progress,
    categoryProgress,
    totalTargets,
    completedTargets,
    overallPercentage,
    isLoading: goalsLoading || sessionsLoading,
  };
};
