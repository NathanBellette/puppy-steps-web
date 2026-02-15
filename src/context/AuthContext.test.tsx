import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';

// --- Mocks ---

// Track the onAuthStateChanged callback so we can trigger it manually
let authStateCallback: ((user: any) => void) | null = null;
const mockUnsubscribe = vi.fn();

const mockSignInWithEmailAndPassword = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockFirebaseSignOut = vi.fn();
const mockSendPasswordResetEmail = vi.fn();
const mockUpdateProfile = vi.fn();

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: any, callback: (user: any) => void) => {
    authStateCallback = callback;
    return mockUnsubscribe;
  },
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args: unknown[]) => mockCreateUserWithEmailAndPassword(...args),
  signOut: (...args: unknown[]) => mockFirebaseSignOut(...args),
  sendPasswordResetEmail: (...args: unknown[]) => mockSendPasswordResetEmail(...args),
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
}));

const mockSetDoc = vi.fn();

vi.mock('firebase/firestore', () => ({
  doc: (_db: any, collection: string, id: string) => ({ path: `${collection}/${id}` }),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  getDoc: vi.fn(),
}));

vi.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

// We need to mock the auth module since AuthContext imports from it
const mockAuthSignIn = vi.fn();
const mockAuthSignUp = vi.fn();
const mockAuthSignOut = vi.fn();
const mockAuthResetPassword = vi.fn();

vi.mock('@/lib/auth', () => ({
  auth: { currentUser: null },
  signIn: (...args: unknown[]) => mockAuthSignIn(...args),
  signUp: (...args: unknown[]) => mockAuthSignUp(...args),
  signOut: (...args: unknown[]) => mockAuthSignOut(...args),
  resetPassword: (...args: unknown[]) => mockAuthResetPassword(...args),
  mapFirebaseUser: (user: any) => {
    if (!user) return null;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  },
}));

// --- Helpers ---

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

// --- Tests ---

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStateCallback = null;
  });

  it('starts in loading state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('sets user when onAuthStateChanged fires with a user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      authStateCallback?.({
        uid: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual({
      uid: 'user-1',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
    });
  });

  it('clears user when onAuthStateChanged fires with null', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // First sign in
    act(() => {
      authStateCallback?.({
        uid: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      });
    });

    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });

    // Then sign out
    act(() => {
      authStateCallback?.(null);
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  it('signIn calls auth.signIn and manages loading state', async () => {
    mockAuthSignIn.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Complete initial auth loading
    act(() => {
      authStateCallback?.(null);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123');
    });

    expect(mockAuthSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('signUp calls auth.signUp', async () => {
    mockAuthSignUp.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      authStateCallback?.(null);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.signUp('new@example.com', 'password123', 'New User');
    });

    expect(mockAuthSignUp).toHaveBeenCalledWith('new@example.com', 'password123', 'New User');
  });

  it('signOut calls auth.signOut', async () => {
    mockAuthSignOut.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      authStateCallback?.({
        uid: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockAuthSignOut).toHaveBeenCalled();
  });

  it('resetPassword calls auth.resetPassword', async () => {
    mockAuthResetPassword.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      authStateCallback?.(null);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.resetPassword('test@example.com');
    });

    expect(mockAuthResetPassword).toHaveBeenCalledWith('test@example.com');
  });

  it('signIn restores loading to false even on error', async () => {
    mockAuthSignIn.mockRejectedValue(new Error('Invalid credentials'));
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      authStateCallback?.(null);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.signIn('bad@example.com', 'wrong');
      })
    ).rejects.toThrow('Invalid credentials');

    expect(result.current.loading).toBe(false);
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for the expected error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });

  it('unsubscribes from onAuthStateChanged on unmount', () => {
    const { unmount } = renderHook(() => useAuth(), { wrapper });

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
