import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import * as authModule from '@/lib/auth';
import { AuthUser } from '@/types';

// --- Mocks ---

// Track the onAuthStateChanged callback so we can trigger it manually
let authStateCallback: ((user: AuthUser | null) => void) | null = null;
const mockUnsubscribe = vi.fn();

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: unknown, callback: (user: AuthUser | null) => void) => {
    authStateCallback = callback;
    return mockUnsubscribe;
  },
}));

// AuthContext delegates all auth operations to this module
vi.mock('@/lib/auth', () => ({
  auth: { currentUser: null },
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  mapFirebaseUser: (user: AuthUser | null) =>
    user && { uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL },
}));

// --- Helpers ---

const testUser: AuthUser = {
  uid: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

const renderAuth = () => renderHook(() => useAuth(), { wrapper });

const fireAuthStateChanged = (user: AuthUser | null) =>
  act(() => {
    authStateCallback?.(user);
  });

/** Renders the provider and completes the initial auth state change. */
const renderSettledAuth = async (user: AuthUser | null = null) => {
  const { result } = renderAuth();
  fireAuthStateChanged(user);
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
};

// --- Tests ---

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStateCallback = null;
  });

  it('starts in loading state', () => {
    const { result } = renderAuth();

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('sets user when onAuthStateChanged fires with a user', async () => {
    const result = await renderSettledAuth(testUser);

    expect(result.current.user).toEqual(testUser);
  });

  it('clears user when onAuthStateChanged fires with null', async () => {
    const result = await renderSettledAuth(testUser);
    expect(result.current.user).not.toBeNull();

    fireAuthStateChanged(null);

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  it.each<{ action: 'signIn' | 'signUp' | 'signOut' | 'resetPassword'; args: string[]; signedInAs?: AuthUser }>([
    { action: 'signIn', args: ['test@example.com', 'password123'] },
    { action: 'signUp', args: ['new@example.com', 'password123', 'New User'] },
    { action: 'signOut', args: [], signedInAs: testUser },
    { action: 'resetPassword', args: ['test@example.com'] },
  ])('$action calls auth.$action', async ({ action, args, signedInAs }) => {
    vi.mocked(authModule[action]).mockResolvedValue(undefined);
    const result = await renderSettledAuth(signedInAs);

    await act(async () => {
      await (result.current[action] as (...actionArgs: string[]) => Promise<void>)(...args);
    });

    expect(authModule[action]).toHaveBeenCalledWith(...args);
  });

  it('signIn restores loading to false even on error', async () => {
    vi.mocked(authModule.signIn).mockRejectedValue(new Error('Invalid credentials'));
    const result = await renderSettledAuth();

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
    const { unmount } = renderAuth();

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
