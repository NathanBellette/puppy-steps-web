import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import { Dog, Session, Goal, SessionFilters } from '@/types';

// Collection names
const COLLECTIONS = {
  DOGS: 'dogs',
  SESSIONS: 'sessions',
  GOALS: 'goals',
  USERS: 'users',
} as const;

// Generic CRUD operations
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

export const getDocument = async <T>(collectionName: string, id: string): Promise<T | null> => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
};

export const getDocuments = async <T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  try {
    console.log(`getDocuments called for collection: ${collectionName} with constraints:`, constraints);
    const q = query(collection(db, collectionName), ...constraints);
    console.log('Firebase query created:', q);
    const querySnapshot = await getDocs(q);
    console.log('Firebase querySnapshot received:', querySnapshot);
    
    const result = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
    
    console.log('getDocuments returning:', result);
    return result;
  } catch (error) {
    console.error(`Error in getDocuments for collection ${collectionName}:`, error);
    throw error;
  }
};

// Dog-specific operations
export const createDog = async (dogData: Omit<Dog, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  return createDocument<Dog>(COLLECTIONS.DOGS, dogData);
};

export const updateDog = async (id: string, data: Partial<Omit<Dog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  return updateDocument<Dog>(COLLECTIONS.DOGS, id, data);
};

export const deleteDog = async (id: string): Promise<void> => {
  return deleteDocument(COLLECTIONS.DOGS, id);
};

export const getDog = async (id: string): Promise<Dog | null> => {
  return getDocument<Dog>(COLLECTIONS.DOGS, id);
};

export const getUserDogs = async (userId: string): Promise<Dog[]> => {
  return getDocuments<Dog>(COLLECTIONS.DOGS, [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  ]);
};

// Session-specific operations
export const createSession = async (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  return createDocument<Session>(COLLECTIONS.SESSIONS, sessionData);
};

export const updateSession = async (id: string, data: Partial<Omit<Session, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  return updateDocument<Session>(COLLECTIONS.SESSIONS, id, data);
};

export const deleteSession = async (id: string): Promise<void> => {
  return deleteDocument(COLLECTIONS.SESSIONS, id);
};

export const getSession = async (id: string): Promise<Session | null> => {
  return getDocument<Session>(COLLECTIONS.SESSIONS, id);
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

  console.log('Firebase query constraints:', constraints);
  
  try {
    const result = await getDocuments<Session>(COLLECTIONS.SESSIONS, constraints);
    console.log('getDocuments returned with result: ', result);
    console.log('Firebase query result:', result);
    return result;
  } catch (error) {
    console.error('Error in getUserSessions:', error);
    throw error;
  }
};

// Goal-specific operations
export const createGoal = async (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  return createDocument<Goal>(COLLECTIONS.GOALS, goalData);
};

export const updateGoal = async (id: string, data: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  return updateDocument<Goal>(COLLECTIONS.GOALS, id, data);
};

export const deleteGoal = async (id: string): Promise<void> => {
  return deleteDocument(COLLECTIONS.GOALS, id);
};

export const getGoal = async (id: string): Promise<Goal | null> => {
  return getDocument<Goal>(COLLECTIONS.GOALS, id);
};

export const getUserGoals = async (userId: string, dogId?: string): Promise<Goal[]> => {
  const constraints: QueryConstraint[] = [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  ];

  if (dogId) {
    constraints.push(where('dogId', '==', dogId));
  }

  return getDocuments<Goal>(COLLECTIONS.GOALS, constraints);
};

export const getUserGoalsByCategory = async (userId: string, dogId?: string): Promise<Record<string, Goal[]>> => {
  const goals = await getUserGoals(userId, dogId);
  return goals.reduce((acc, goal) => {
    if (!acc[goal.category]) {
      acc[goal.category] = [];
    }
    acc[goal.category].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);
};
