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
  WhereFilterOp,
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

/** Fields Firestore or this module set, which callers never write directly. */
type SystemFields = 'id' | 'createdAt' | 'updatedAt';
type NewDocument<T> = Omit<T, SystemFields>;
type DocumentUpdate<T> = Partial<Omit<T, SystemFields | 'userId'>>;

/** Adds matching createdAt/updatedAt stamps to a new document. */
const withCreationTimestamps = <T>(data: T, now = new Date()) => ({ ...data, createdAt: now, updatedAt: now });

export const createDocument = async <T extends Record<string, any>>(
  collectionName: string,
  data: NewDocument<T>
): Promise<string> => {
  const docRef = await addDoc(collection(db, collectionName), withCreationTimestamps(data));
  return docRef.id;
};

export const updateDocument = async <T extends Record<string, any>>(
  collectionName: string,
  id: string,
  data: DocumentUpdate<T>
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

/** Builds the create, update and delete operations for one collection. */
const collectionOperations = <T extends Record<string, any>>(collectionName: string) => ({
  create: (data: NewDocument<T>) => createDocument<T>(collectionName, data),
  update: (id: string, data: DocumentUpdate<T>) => updateDocument<T>(collectionName, id, data),
  delete: (id: string) => deleteDocument(collectionName, id),
});

/** A filter that only applies when its value is set. */
const whereIfSet = (field: string, op: WhereFilterOp, value: unknown): QueryConstraint[] =>
  value ? [where(field, op, value)] : [];

/** Reads a user's documents, newest first by `orderField`, capped at DEFAULT_QUERY_LIMIT. */
const getUserDocuments = async <T>(
  collectionName: string,
  userId: string,
  orderField: string,
  filters: QueryConstraint[] = []
): Promise<T[]> =>
  getDocuments<T>(collectionName, [
    where('userId', '==', userId),
    orderBy(orderField, 'desc'),
    ...filters,
    limit(DEFAULT_QUERY_LIMIT),
  ]);

// --- Dog-specific operations ---

export const { create: createDog, update: updateDog, delete: deleteDog } = collectionOperations<Dog>(COLLECTIONS.DOGS);

export const getUserDogs = async (userId: string): Promise<Dog[]> =>
  getUserDocuments<Dog>(COLLECTIONS.DOGS, userId, 'createdAt');

// --- Session-specific operations ---

export const {
  create: createSession,
  update: updateSession,
  delete: deleteSession,
} = collectionOperations<Session>(COLLECTIONS.SESSIONS);

export const getUserSessions = async (
  userId: string,
  dogId?: string,
  filters?: SessionFilters
): Promise<Session[]> =>
  getUserDocuments<Session>(COLLECTIONS.SESSIONS, userId, 'date', [
    ...whereIfSet('dogId', '==', dogId),
    ...whereIfSet('type', '==', filters?.type),
    ...whereIfSet('date', '>=', filters?.dateFrom),
    ...whereIfSet('date', '<=', filters?.dateTo),
  ]);

// --- Goal-specific operations ---

export const { create: createGoal, update: updateGoal, delete: deleteGoal } = collectionOperations<Goal>(COLLECTIONS.GOALS);

export const getUserGoals = async (userId: string, dogId?: string): Promise<Goal[]> =>
  getUserDocuments<Goal>(COLLECTIONS.GOALS, userId, 'createdAt', whereIfSet('dogId', '==', dogId));

// --- Batch operations ---

/**
 * Creates multiple goals in a single atomic batch write.
 * Firestore batch limit is 500 writes.
 */
export const createGoalsBatch = async (
  goalsData: NewDocument<Goal>[]
): Promise<void> => {
  const batch = writeBatch(db);
  const now = new Date();

  for (const goalData of goalsData) {
    const docRef = doc(collection(db, COLLECTIONS.GOALS));
    batch.set(docRef, withCreationTimestamps(goalData, now));
  }

  await batch.commit();
};

// incrementGoalCount removed — progress is now computed from sessions via computeTargetProgress
