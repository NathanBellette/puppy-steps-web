import { SessionType } from './session';

// Goal structure matching iOS app
export interface Goal {
  id: string;
  userId: string;
  dogId: string;
  category: string;        // Specific category like "Children", "Small Dogs", etc.
  type: SessionType;       // Parent type: 'people', 'dogs', 'environments', 'noises'
  isCompleted: boolean;
  completedDate?: Date;
  targetCount: number;     // Target number of sessions to complete goal
  currentCount: number;    // Current number of sessions logged
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalFormData {
  dogId: string;
  category: string;
  type: SessionType;
  targetCount?: number;
}

export interface GoalProgress {
  total: number;
  completed: number;
  percentage: number;
}

export interface GoalCategoryProgress {
  category: SessionType;
  goals: Goal[];
  progress: GoalProgress;
}

export interface GoalStats {
  totalGoals: number;
  completedGoals: number;
  categoryProgress: Record<SessionType, GoalProgress>;
  todaysGoals: Goal[];
}

// Predefined goals matching iOS app (29 goals)
export const PREDEFINED_GOALS: Array<{
  category: string;
  type: SessionType;
  targetCount: number;
}> = [
  // People (6 goals)
  { category: 'Men', type: 'people', targetCount: 1 },
  { category: 'Women', type: 'people', targetCount: 1 },
  { category: 'Children', type: 'people', targetCount: 1 },
  { category: 'Elderly People', type: 'people', targetCount: 1 },
  { category: 'People with Hats', type: 'people', targetCount: 1 },
  { category: 'People with Glasses', type: 'people', targetCount: 1 },
  
  // Dogs (5 goals)
  { category: 'Small Dogs', type: 'dogs', targetCount: 1 },
  { category: 'Big Dogs', type: 'dogs', targetCount: 1 },
  { category: 'Puppies', type: 'dogs', targetCount: 1 },
  { category: 'Senior Dogs', type: 'dogs', targetCount: 1 },
  { category: 'Different Breeds', type: 'dogs', targetCount: 1 },
  
  // Environments (8 goals)
  { category: 'Park', type: 'environments', targetCount: 1 },
  { category: 'Sidewalk', type: 'environments', targetCount: 1 },
  { category: 'Café', type: 'environments', targetCount: 1 },
  { category: 'Vet Office', type: 'environments', targetCount: 1 },
  { category: 'Pet Store', type: 'environments', targetCount: 1 },
  { category: 'Car Rides', type: 'environments', targetCount: 1 },
  { category: 'Public Transport', type: 'environments', targetCount: 1 },
  { category: 'Elevator', type: 'environments', targetCount: 1 },
  
  // Noises (10 goals)
  { category: 'Vacuum Cleaner', type: 'noises', targetCount: 1 },
  { category: 'Car Horns', type: 'noises', targetCount: 1 },
  { category: 'Thunder', type: 'noises', targetCount: 1 },
  { category: 'Fireworks', type: 'noises', targetCount: 1 },
  { category: 'Doorbell', type: 'noises', targetCount: 1 },
  { category: 'Phone Ringing', type: 'noises', targetCount: 1 },
  { category: 'Umbrella', type: 'noises', targetCount: 1 },
  { category: 'Bicycles', type: 'noises', targetCount: 1 },
  { category: 'Skateboards', type: 'noises', targetCount: 1 }
];

// Helper function to create initial goals for a dog
export const createInitialGoalsForDog = (dogId: string, userId: string): Omit<Goal, 'id'>[] => {
  return PREDEFINED_GOALS.map(goal => ({
    userId,
    dogId,
    category: goal.category,
    type: goal.type,
    isCompleted: false,
    completedDate: undefined,
    targetCount: goal.targetCount,
    currentCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
};
