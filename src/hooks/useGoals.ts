import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { 
  getUserGoals, 
  getUserGoalsByCategory,
  createGoal, 
  updateGoal, 
  deleteGoal,
  getGoal,
  createGoalsBatch,
  incrementGoalCount,
} from '@/lib/firestore';
import { Goal, GoalFormData, createInitialGoalsForDog } from '@/types';
import { computeGoalStats } from '@/services/goalStats';

export const useGoals = (dogId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: goals = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['goals', user?.uid, dogId],
    queryFn: () => getUserGoals(user!.uid, dogId),
    enabled: !!user,
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: GoalFormData) => {
      return createGoal({
        ...goalData,
        userId: user!.uid,
        targetCount: goalData.targetCount || 1,
        currentCount: 0,
        isCompleted: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.uid, dogId] });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Goal> }) => {
      return updateGoal(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.uid, dogId] });
    },
  });

  const toggleGoalMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      return updateGoal(id, {
        isCompleted,
        completedDate: isCompleted ? new Date() : undefined,
        updatedAt: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.uid, dogId] });
    },
  });

  // Atomic increment using Firestore's increment() to avoid stale state
  const incrementGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      return incrementGoalCount(goalId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.uid, dogId] });
    },
  });

  // Create all predefined goals for a dog using batch write
  const initializeGoalsMutation = useMutation({
    mutationFn: async (dogId: string) => {
      if (!user) throw new Error('User not authenticated');
      const initialGoals = createInitialGoalsForDog(dogId, user.uid);
      return createGoalsBatch(initialGoals);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.uid] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.uid, dogId] });
    },
  });

  return {
    goals,
    isLoading,
    error,
    refetch,
    createGoal: createGoalMutation.mutateAsync,
    updateGoal: updateGoalMutation.mutateAsync,
    toggleGoal: toggleGoalMutation.mutateAsync,
    incrementGoal: incrementGoalMutation.mutateAsync,
    initializeGoals: initializeGoalsMutation.mutateAsync,
    deleteGoal: deleteGoalMutation.mutateAsync,
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isToggling: toggleGoalMutation.isPending,
    isIncrementing: incrementGoalMutation.isPending,
    isInitializing: initializeGoalsMutation.isPending,
    isDeleting: deleteGoalMutation.isPending,
  };
};

export const useGoalsByCategory = (dogId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['goalsByCategory', user?.uid, dogId],
    queryFn: () => getUserGoalsByCategory(user!.uid, dogId),
    enabled: !!user,
  });
};

export const useGoal = (goalId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['goal', goalId],
    queryFn: () => getGoal(goalId),
    enabled: !!user && !!goalId,
  });
};

/**
 * Derives goal stats from the goals list using a pure computation function.
 * Shares the React Query cache with useGoals.
 */
export const useGoalStats = (dogId?: string) => {
  const { goals, isLoading } = useGoals(dogId);
  const stats = useMemo(() => computeGoalStats(goals), [goals]);
  return { stats, isLoading };
};
