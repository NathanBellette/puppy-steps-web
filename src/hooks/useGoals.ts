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
import { Goal, GoalFormData, GoalCategory } from '@/types';

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
        status: 'not_started',
        isCompleted: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.uid, dogId] });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GoalFormData> }) => {
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
        status: isCompleted ? 'completed' : 'in_progress',
        completedAt: isCompleted ? new Date() : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.uid, dogId] });
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
    deleteGoal: deleteGoalMutation.mutateAsync,
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isToggling: toggleGoalMutation.isPending,
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
    categoryProgress: {} as Record<GoalCategory, { total: number; completed: number; percentage: number }>,
    todaysGoals: goals.filter(g => !g.isCompleted).slice(0, 5), // First 5 incomplete goals
  };

  // Calculate category progress
  goals.forEach(goal => {
    if (!stats.categoryProgress[goal.category]) {
      stats.categoryProgress[goal.category] = { total: 0, completed: 0, percentage: 0 };
    }
    stats.categoryProgress[goal.category].total++;
    if (goal.isCompleted) {
      stats.categoryProgress[goal.category].completed++;
    }
  });

  // Calculate percentages
  Object.keys(stats.categoryProgress).forEach(category => {
    const catStats = stats.categoryProgress[category as GoalCategory];
    catStats.percentage = catStats.total > 0 ? (catStats.completed / catStats.total) * 100 : 0;
  });

  return {
    stats,
    isLoading,
  };
};
