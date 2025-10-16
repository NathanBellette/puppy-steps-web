import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { 
  getUserGoals, 
  getUserGoalsByCategory,
  createGoal, 
  updateGoal, 
  deleteGoal,
  getGoal 
} from '@/lib/firestore';
import { Goal, GoalFormData, SessionType, createInitialGoalsForDog } from '@/types';

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

  // New mutation to increment goal count
  const incrementGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) throw new Error('Goal not found');
      
      const newCount = goal.currentCount + 1;
      const shouldComplete = newCount >= goal.targetCount;
      
      return updateGoal(goalId, {
        currentCount: newCount,
        isCompleted: shouldComplete,
        completedDate: shouldComplete ? new Date() : goal.completedDate,
        updatedAt: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.uid, dogId] });
    },
  });

  // Create all predefined goals for a dog
  const initializeGoalsMutation = useMutation({
    mutationFn: async (dogId: string) => {
      if (!user) throw new Error('User not authenticated');
      const initialGoals = createInitialGoalsForDog(dogId, user.uid);
      
      // Create all goals in batch
      const promises = initialGoals.map(goal => createGoal(goal));
      return Promise.all(promises);
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

export const useGoalStats = (dogId?: string) => {
  const { goals, isLoading } = useGoals(dogId);

  const stats = {
    totalGoals: goals.length,
    completedGoals: goals.filter(g => g.isCompleted).length,
    categoryProgress: {} as Record<SessionType, { total: number; completed: number; percentage: number }>,
    todaysGoals: goals.filter(g => !g.isCompleted).slice(0, 5), // First 5 incomplete goals
  };

  // Calculate category progress by type
  goals.forEach(goal => {
    if (!stats.categoryProgress[goal.type]) {
      stats.categoryProgress[goal.type] = { total: 0, completed: 0, percentage: 0 };
    }
    stats.categoryProgress[goal.type].total++;
    if (goal.isCompleted) {
      stats.categoryProgress[goal.type].completed++;
    }
  });

  // Calculate percentages
  Object.keys(stats.categoryProgress).forEach(type => {
    const catStats = stats.categoryProgress[type as SessionType];
    catStats.percentage = catStats.total > 0 ? (catStats.completed / catStats.total) * 100 : 0;
  });

  return {
    stats,
    isLoading,
  };
};
