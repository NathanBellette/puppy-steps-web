import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Re-export auth for use in other files
export { auth };
import { User, AuthUser } from '@/types';

export const signIn = async (email: string, password: string): Promise<void> => {
  await signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (
  email: string,
  password: string,
  displayName?: string
): Promise<void> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update display name
  if (displayName) {
    await updateProfile(user, { displayName });
  }

  // Create user document in Firestore
  const userData: Omit<User, 'id'> = {
    email: user.email!,
    displayName: displayName ?? user.displayName ?? undefined,
    photoURL: user.photoURL ?? undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    preferences: {
      theme: 'system',
    },
  };

  await setDoc(doc(db, 'users', user.uid), userData);
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

// Convert Firebase user to our AuthUser type
export const mapFirebaseUser = (user: FirebaseUser | null): AuthUser | null => {
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
};
