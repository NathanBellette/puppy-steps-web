export type SessionType = 'people' | 'dogs' | 'environments' | 'noises';

export const SESSION_TYPES: SessionType[] = ['people', 'dogs', 'environments', 'noises'];

/** Summarises the items of each session type into one record. */
export const summariseBySessionType = <T extends { type: SessionType }, V>(
  items: T[],
  summarise: (itemsOfType: T[]) => V
): Record<SessionType, V> =>
  Object.fromEntries(
    SESSION_TYPES.map((type) => [type, summarise(items.filter((item) => item.type === type))])
  ) as Record<SessionType, V>;

export type ReactionLevel = '😰' | '😟' | '😐' | '😊' | '😍';

export type PlaceType = 'Home' | 'Street' | 'Park' | 'Store' | 'Cafe' | 'Car' | 'Vet' | 'PublicTransport' | 'Other';
export type Intensity = 'low' | 'medium' | 'high';

export const PLACE_TYPES: PlaceType[] = [
  'Home', 'Street', 'Park', 'Store', 'Cafe', 'Car', 'Vet', 'PublicTransport', 'Other'
];

export const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  Home: 'Home',
  Street: 'Street',
  Park: 'Park',
  Store: 'Store',
  Cafe: 'Cafe',
  Car: 'Car',
  Vet: 'Vet',
  PublicTransport: 'Public Transport',
  Other: 'Other',
};

export const INTENSITY_LEVELS: Intensity[] = ['low', 'medium', 'high'];

export const INTENSITY_LABELS: Record<Intensity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

/** Details shared by a logged session and the form that logs one. */
export interface SessionDetails {
  dogId: string;
  date: Date;
  type: SessionType;
  category: string; // Specific subcategory within the type
  reaction: ReactionLevel;
  placeType?: PlaceType;
  intensity?: Intensity;
  isNewToDog?: boolean;
  notes?: string;
}

export interface Session extends SessionDetails {
  id: string;
  userId: string;
  photoUrl?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface SessionFormData extends SessionDetails {
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
};

// Helper to get emoji for session type
export const SESSION_TYPE_EMOJI: Record<SessionType, string> = {
  people: '👥',
  dogs: '🐕',
  environments: '🏠',
  noises: '🔊',
};

// Helper to get display name for reaction
export const REACTION_LABELS: Record<ReactionLevel, string> = {
  '😰': 'Very Negative',
  '😟': 'Negative',
  '😐': 'Neutral',
  '😊': 'Positive',
  '😍': 'Very Positive',
};

// Normalize session type from iOS (capitalized) to canonical lowercase
export function normalizeSessionType(type: string): SessionType {
  const lower = type.toLowerCase();
  if (lower === 'people' || lower === 'dogs' || lower === 'environments' || lower === 'noises') {
    return lower as SessionType;
  }
  // Legacy fallback for old iOS data
  if (lower === 'person') return 'people';
  if (lower === 'dog') return 'dogs';
  if (lower === 'environment') return 'environments';
  if (lower === 'noise') return 'noises';
  return 'people'; // default fallback
}

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
