export type SessionType = 'person' | 'dog' | 'environment' | 'noise';

export type ReactionLevel = '😰' | '😟' | '😐' | '😊' | '😄';

export interface Session {
  id: string;
  userId: string;
  dogId: string;
  date: Date;
  type: SessionType;
  reaction: ReactionLevel;
  notes?: string;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionFormData {
  dogId: string;
  date: Date;
  type: SessionType;
  reaction: ReactionLevel;
  notes?: string;
  photo?: File;
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
