export type SessionType = 'people' | 'dogs' | 'environments' | 'noises' | 'People' | 'Dogs' | 'Environments' | 'Noises';

export type ReactionLevel = '😰' | '😟' | '😐' | '😊' | '😍';

export interface Session {
  id: string;
  userId: string;
  dogId: string;
  date: Date;
  type: SessionType;
  category: string; // Specific subcategory within the type
  reaction: ReactionLevel;
  notes?: string;
  photoUrl?: string;
  photoURL?: string; // iOS uses photoURL
  createdAt: Date;
  updatedAt?: Date; // iOS doesn't have this field
}

export interface SessionFormData {
  dogId: string;
  date: Date;
  type: SessionType;
  category: string;
  reaction: ReactionLevel;
  notes?: string;
  photo?: File;
}

// Predefined session categories matching iOS app
export const SESSION_CATEGORIES: Record<SessionType, string[]> = {
  people: [
    'Men',
    'Women',
    'Children',
    'Elderly People',
    'People with Hats',
    'People with Glasses'
  ],
  dogs: [
    'Small Dogs',
    'Big Dogs',
    'Puppies',
    'Senior Dogs',
    'Different Breeds'
  ],
  environments: [
    'Park',
    'Sidewalk',
    'Café',
    'Vet Office',
    'Pet Store',
    'Car Rides',
    'Public Transport',
    'Elevator'
  ],
  noises: [
    'Vacuum Cleaner',
    'Car Horns',
    'Thunder',
    'Fireworks',
    'Doorbell',
    'Phone Ringing',
    'Umbrella',
    'Bicycles',
    'Skateboards'
  ],
  // iOS capitalized versions
  People: [
    'Men',
    'Women',
    'Children',
    'Elderly People',
    'People with Hats',
    'People with Glasses'
  ],
  Dogs: [
    'Small Dogs',
    'Big Dogs',
    'Puppies',
    'Senior Dogs',
    'Different Breeds'
  ],
  Environments: [
    'Park',
    'Sidewalk',
    'Café',
    'Vet Office',
    'Pet Store',
    'Car Rides',
    'Public Transport',
    'Elevator'
  ],
  Noises: [
    'Vacuum Cleaner',
    'Car Horns',
    'Thunder',
    'Fireworks',
    'Doorbell',
    'Phone Ringing',
    'Umbrella',
    'Bicycles',
    'Skateboards'
  ]
};

// Helper to get emoji for session type
export const SESSION_TYPE_EMOJI: Record<SessionType, string> = {
  people: '👥',
  dogs: '🐕',
  environments: '🏠',
  noises: '🔊',
  // iOS capitalized versions
  People: '👥',
  Dogs: '🐕',
  Environments: '🏠',
  Noises: '🔊'
};

// Helper to get display name for reaction
export const REACTION_LABELS: Record<ReactionLevel, string> = {
  '😍': 'Very Positive',
  '😊': 'Positive',
  '😐': 'Neutral',
  '😟': 'Negative',
  '😰': 'Very Negative'
};

export interface SessionFilters {
  type?: SessionType;
  dateFrom?: Date;
  dateTo?: Date;
  dogId?: string;
}

export interface SessionStats {
  totalSessions: number;
  sessionsByType: Record<SessionType, number>;
  averageReaction: number;
  recentSessions: Session[];
}
