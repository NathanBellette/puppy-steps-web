export type GoalCategory = 'people' | 'dogs' | 'environments' | 'noises';

export type GoalStatus = 'not_started' | 'in_progress' | 'completed';

export interface Goal {
  id: string;
  userId: string;
  dogId: string;
  title: string;
  description: string;
  category: GoalCategory;
  status: GoalStatus;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalFormData {
  dogId: string;
  title: string;
  description: string;
  category: GoalCategory;
}

export interface GoalProgress {
  total: number;
  completed: number;
  percentage: number;
}

export interface GoalCategoryProgress {
  category: GoalCategory;
  goals: Goal[];
  progress: GoalProgress;
}

export interface GoalStats {
  totalGoals: number;
  completedGoals: number;
  categoryProgress: GoalCategoryProgress[];
  todaysGoals: Goal[];
}
