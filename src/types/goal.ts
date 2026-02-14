import { SessionType } from './session';

// Goal structure — targets for socialisation
export interface Goal {
  id: string;
  userId: string;
  dogId: string;
  category: string;        // Specific category like "Children", "Small Dogs", etc.
  type: SessionType;       // Parent type: 'people', 'dogs', 'environments', 'noises'
  calmTargetCount: number; // Target number of calm exposures (reaction >= neutral)
  varietyTargetCount: number; // Target number of unique context combos
  // Legacy fields kept for backward compat — no longer written by UI
  isCompleted: boolean;
  completedDate?: Date;
  targetCount: number;
  currentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalFormData {
  dogId: string;
  category: string;
  type: SessionType;
  calmTargetCount?: number;
  varietyTargetCount?: number;
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

// Default target counts for calm exposures and variety
export const DEFAULT_CALM_TARGET = 5;
export const DEFAULT_VARIETY_TARGET = 3;

// Predefined goals (29 targets)
export const PREDEFINED_GOALS: Array<{
  category: string;
  type: SessionType;
  calmTargetCount: number;
  varietyTargetCount: number;
}> = [
  // People (6 targets)
  { category: 'Men', type: 'people', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Women', type: 'people', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Children', type: 'people', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Elderly People', type: 'people', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'People with Hats', type: 'people', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'People with Glasses', type: 'people', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  
  // Dogs (5 targets)
  { category: 'Small Dogs', type: 'dogs', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Big Dogs', type: 'dogs', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Puppies', type: 'dogs', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Senior Dogs', type: 'dogs', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Different Breeds', type: 'dogs', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  
  // Environments (8 targets)
  { category: 'Park', type: 'environments', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Sidewalk', type: 'environments', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Café', type: 'environments', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Vet Office', type: 'environments', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Pet Store', type: 'environments', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Car Rides', type: 'environments', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Public Transport', type: 'environments', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Elevator', type: 'environments', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  
  // Noises (9 targets)
  { category: 'Vacuum Cleaner', type: 'noises', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Car Horns', type: 'noises', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Thunder', type: 'noises', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Fireworks', type: 'noises', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Doorbell', type: 'noises', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Phone Ringing', type: 'noises', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Umbrella', type: 'noises', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Bicycles', type: 'noises', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
  { category: 'Skateboards', type: 'noises', calmTargetCount: DEFAULT_CALM_TARGET, varietyTargetCount: DEFAULT_VARIETY_TARGET },
];

// Helper function to create initial goals for a dog
export const createInitialGoalsForDog = (dogId: string, userId: string): Omit<Goal, 'id'>[] => {
  return PREDEFINED_GOALS.map(goal => ({
    userId,
    dogId,
    category: goal.category,
    type: goal.type,
    calmTargetCount: goal.calmTargetCount,
    varietyTargetCount: goal.varietyTargetCount,
    // Legacy fields for backward compat
    isCompleted: false,
    completedDate: undefined,
    targetCount: goal.calmTargetCount,
    currentCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
};
