import { Dog, Goal, GoalProgress, Session, SessionType } from '@/types';
import { TargetProgress } from '@/services/targetProgress';

// Shared test data builders. Each returns a fresh object; pass overrides for the fields a test cares about.

export const testUser = { uid: 'user-1', email: 'test@test.com', displayName: 'Test' };

export const makeDog = (overrides: Partial<Dog> = {}): Dog => ({
  id: 'dog-1',
  userId: 'user-1',
  name: 'Buddy',
  age: 6,
  breed: 'Labrador',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const makeGoal = (overrides: Partial<Goal> = {}): Goal => ({
  id: 'goal-1',
  userId: 'user-1',
  dogId: 'dog-1',
  category: 'Men',
  type: 'people',
  calmTargetCount: 5,
  varietyTargetCount: 3,
  targetCount: 5,
  currentCount: 0,
  isCompleted: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const makeSession = (overrides: Partial<Session> = {}): Session => ({
  id: 'session-1',
  userId: 'user-1',
  dogId: 'dog-1',
  date: new Date('2024-06-01T10:00:00'),
  type: 'people',
  category: 'Men',
  reaction: '😊',
  createdAt: new Date('2024-06-01'),
  ...overrides,
});

export const makeProgress = (overrides: Partial<TargetProgress> = {}): TargetProgress => ({
  goalId: 'goal-1',
  category: 'Men',
  type: 'people',
  calmCount: 2,
  calmTarget: 5,
  varietyCount: 1,
  varietyTarget: 3,
  isComplete: false,
  lastLogged: new Date('2024-01-10'),
  varietyKeys: new Set(['context:Park:low']),
  ...overrides,
});

/** useDogs state with the given dog (or none) selected. */
/** A small JPEG upload for photo flows. */
export const makePhoto = () => new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });

/** Six item types spread unevenly across the session types: 2 people, 1 dog, 1 environment, 2 noises. */
export const sixTypesSpread: SessionType[] = ['people', 'people', 'dogs', 'environments', 'noises', 'noises'];

export const makeDogsState = (selectedDog: Dog | null = makeDog()) => ({
  selectedDog,
  dogs: selectedDog ? [selectedDog] : [],
});

/** useTargetProgress result with no completed targets and the given number of targets per type. */
export const makeTargetProgressResult = (
  progress: Record<string, TargetProgress>,
  targetsPerType: Record<SessionType, number>
) => ({
  progress,
  categoryProgress: Object.fromEntries(
    Object.entries(targetsPerType).map(([type, total]) => [type, { total, completed: 0, percentage: 0 }])
  ) as Record<SessionType, GoalProgress>,
  totalTargets: Object.values(targetsPerType).reduce((sum, count) => sum + count, 0),
  completedTargets: 0,
  overallPercentage: 0,
  isLoading: false,
});
