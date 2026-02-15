import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  Timestamp,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import { Dog, Session, Goal, SessionFilters } from '@/types';
import { normalizeSessionType } from '@/types/session';

// Default query limit to prevent unbounded reads
const DEFAULT_QUERY_LIMIT = 100;

// Collection names
const COLLECTIONS = {
  DOGS: 'dogs',
  SESSIONS: 'sessions',
  GOALS: 'goals',
  USERS: 'users',
} as const;

// --- Timestamp / Document Conversion ---

/**
 * Converts Firestore Timestamps to JS Dates in a document.
 * Also normalizes known fields (e.g., SessionType casing, photoURL -> photoUrl).
 */
export function convertTimestamps<T>(data: DocumentData): T {
  const converted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      converted[key] = value.toDate();
    } else {
      converted[key] = value;
    }
  }

  // Normalize photoURL -> photoUrl (iOS compatibility)
  if ('photoURL' in converted && !('photoUrl' in converted)) {
    converted['photoUrl'] = converted['photoURL'];
    delete converted['photoURL'];
  }

  // Normalize session type casing
  if ('type' in converted && typeof converted['type'] === 'string') {
    converted['type'] = normalizeSessionType(converted['type'] as string);
  }

  // Default missing session fields for backward compatibility
  if ('reaction' in converted) {
    // This looks like a Session document
    if (!('placeType' in converted) || converted['placeType'] === undefined) {
      converted['placeType'] = 'Other';
    }
    if (!('intensity' in converted) || converted['intensity'] === undefined) {
      converted['intensity'] = 'low';
    }
    if (!('isNewToDog' in converted) || converted['isNewToDog'] === undefined) {
      converted['isNewToDog'] = false;
    }
  }

  // Default missing goal fields for backward compatibility
  if ('targetCount' in converted && !('calmTargetCount' in converted)) {
    converted['calmTargetCount'] = (converted['targetCount'] as number) || 5;
    converted['varietyTargetCount'] = 3;
  }

  return converted as T;
}

// --- Generic CRUD operations ---

export const createDocument = async <T extends Record<string, any>>(
  collectionName: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const now = new Date();
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const updateDocument = async <T extends Record<string, any>>(
  collectionName: string,
  id: string,
  data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date(),
  });
};

export const deleteDocument = async (collectionName: string, id: string): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

export const getDocuments = async <T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  const q = query(collection(db, collectionName), ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc =>
    convertTimestamps<T>({ id: doc.id, ...doc.data() })
  );
};

// --- Dog-specific operations ---

export const createDog = async (dogData: Omit<Dog, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  return createDocument<Dog>(COLLECTIONS.DOGS, dogData);
};

export const updateDog = async (id: string, data: Partial<Omit<Dog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  return updateDocument<Dog>(COLLECTIONS.DOGS, id, data);
};

export const deleteDog = async (id: string): Promise<void> => {
  return deleteDocument(COLLECTIONS.DOGS, id);
};

export const getUserDogs = async (userId: string): Promise<Dog[]> => {
  return getDocuments<Dog>(COLLECTIONS.DOGS, [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(DEFAULT_QUERY_LIMIT),
  ]);
};

// --- Session-specific operations ---

export const createSession = async (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  return createDocument<Session>(COLLECTIONS.SESSIONS, sessionData);
};

export const updateSession = async (id: string, data: Partial<Omit<Session, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  return updateDocument<Session>(COLLECTIONS.SESSIONS, id, data);
};

export const deleteSession = async (id: string): Promise<void> => {
  return deleteDocument(COLLECTIONS.SESSIONS, id);
};

export const getUserSessions = async (
  userId: string,
  dogId?: string,
  filters?: SessionFilters
): Promise<Session[]> => {
  const constraints: QueryConstraint[] = [
    where('userId', '==', userId),
    orderBy('date', 'desc'),
  ];

  if (dogId) {
    constraints.push(where('dogId', '==', dogId));
  }

  if (filters?.type) {
    constraints.push(where('type', '==', filters.type));
  }

  if (filters?.dateFrom) {
    constraints.push(where('date', '>=', filters.dateFrom));
  }

  if (filters?.dateTo) {
    constraints.push(where('date', '<=', filters.dateTo));
  }

  constraints.push(limit(DEFAULT_QUERY_LIMIT));

  return getDocuments<Session>(COLLECTIONS.SESSIONS, constraints);
};

// --- Goal-specific operations ---

export const createGoal = async (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  return createDocument<Goal>(COLLECTIONS.GOALS, goalData);
};

export const updateGoal = async (id: string, data: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt'>>): Promise<void> => {
  return updateDocument<Goal>(COLLECTIONS.GOALS, id, data);
};

export const deleteGoal = async (id: string): Promise<void> => {
  return deleteDocument(COLLECTIONS.GOALS, id);
};

export const getUserGoals = async (userId: string, dogId?: string): Promise<Goal[]> => {
  const constraints: QueryConstraint[] = [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  ];

  if (dogId) {
    constraints.push(where('dogId', '==', dogId));
  }

  constraints.push(limit(DEFAULT_QUERY_LIMIT));

  return getDocuments<Goal>(COLLECTIONS.GOALS, constraints);
};

// --- Batch operations ---

/**
 * Creates multiple goals in a single atomic batch write.
 * Firestore batch limit is 500 writes.
 */
export const createGoalsBatch = async (
  goalsData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<void> => {
  const batch = writeBatch(db);
  const now = new Date();

  for (const goalData of goalsData) {
    const docRef = doc(collection(db, COLLECTIONS.GOALS));
    batch.set(docRef, {
      ...goalData,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
};

// incrementGoalCount removed — progress is now computed from sessions via computeTargetProgress
