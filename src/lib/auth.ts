import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Re-export auth for use in other files
export { auth };
import { User, AuthUser } from '@/types';

export const signIn = async (email: string, password: string): Promise<void> => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signUp = async (
  email: string,
  password: string,
  displayName?: string
): Promise<void> => {
  try {
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
        notifications: true,
      },
    };

    await setDoc(doc(db, 'users', user.uid), userData);
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

export const getUserData = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { id: uid, ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Get user data error:', error);
    throw error;
  }
};

export const updateUserData = async (uid: string, data: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { ...data, updatedAt: new Date() }, { merge: true });
  } catch (error) {
    console.error('Update user data error:', error);
    throw error;
  }
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
