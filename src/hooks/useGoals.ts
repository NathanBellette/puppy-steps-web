import {
  getUserGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  createGoalsBatch,
} from '@/lib/firestore';
import { Goal, GoalFormData, createInitialGoalsForDog } from '@/types';
import { computeGoalStats } from '@/services/goalStats';
import { useDerivedStats, useRefreshingMutation, useUserDocuments } from './useUserDocuments';

export const useGoals = (dogId?: string) => {
  const {
    user,
    queryKey,
    data: goals,
    isLoading,
    error,
    refetch
  } = useUserDocuments('goals', [dogId], (userId) => getUserGoals(userId, dogId));

  const createGoalMutation = useRefreshingMutation(async (goalData: GoalFormData) => {
    return createGoal({
      ...goalData,
      userId: user!.uid,
      calmTargetCount: goalData.calmTargetCount ?? 5,
      varietyTargetCount: goalData.varietyTargetCount ?? 3,
      targetCount: goalData.targetCount || 5,
      currentCount: 0,
      isCompleted: false,
    });
  }, queryKey);

  const updateGoalMutation = useRefreshingMutation(async ({ id, data }: { id: string; data: Partial<Goal> }) => {
    return updateGoal(id, data);
  }, queryKey);

  const toggleGoalMutation = useRefreshingMutation(async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
    return updateGoal(id, {
      isCompleted,
      completedDate: isCompleted ? new Date() : undefined,
    });
  }, queryKey);

  // Create all predefined goals for a dog using batch write; refreshes every goal list for the user
  const initializeGoalsMutation = useRefreshingMutation(async (dogId: string) => {
    if (!user) throw new Error('User not authenticated');
    const initialGoals = createInitialGoalsForDog(dogId, user.uid);
    return createGoalsBatch(initialGoals);
  }, ['goals', user?.uid]);

  const deleteGoalMutation = useRefreshingMutation(deleteGoal, queryKey);

  return {
    goals,
    isLoading,
    error,
    refetch,
    createGoal: createGoalMutation.mutateAsync,
    updateGoal: updateGoalMutation.mutateAsync,
    toggleGoal: toggleGoalMutation.mutateAsync,
    initializeGoals: initializeGoalsMutation.mutateAsync,
    deleteGoal: deleteGoalMutation.mutateAsync,
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isToggling: toggleGoalMutation.isPending,
    isInitializing: initializeGoalsMutation.isPending,
    isDeleting: deleteGoalMutation.isPending,
  };
};

/** Goal stats for a dog, derived from the cached goals list. */
export const useGoalStats = (dogId?: string) => {
  const { goals, isLoading } = useGoals(dogId);
  return useDerivedStats(goals, isLoading, computeGoalStats);
};
