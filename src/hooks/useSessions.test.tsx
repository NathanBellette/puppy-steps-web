import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSessions, useSessionStats } from './useSessions';
import { Session } from '@/types';

// --- Mocks ---

const mockUser = { uid: 'user-1', email: 'test@test.com', displayName: 'Test' };

vi.mock('./useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}));

const mockSessions: Session[] = [
  {
    id: 'session-1',
    userId: 'user-1',
    dogId: 'dog-1',
    date: new Date('2024-03-10T10:00:00'),
    type: 'people',
    category: 'Men',
    reaction: '😊',
    placeType: 'Park',
    intensity: 'low',
    isNewToDog: false,
    createdAt: new Date('2024-03-10'),
  },
  {
    id: 'session-2',
    userId: 'user-1',
    dogId: 'dog-1',
    date: new Date('2024-03-11T14:00:00'),
    type: 'dogs',
    category: 'Small Dogs',
    reaction: '😍',
    placeType: 'Street',
    intensity: 'medium',
    isNewToDog: true,
    createdAt: new Date('2024-03-11'),
  },
];

const mockGetUserSessions = vi.fn().mockResolvedValue(mockSessions);
const mockCreateSession = vi.fn().mockResolvedValue('session-3');
const mockUpdateSession = vi.fn().mockResolvedValue(undefined);
const mockDeleteSession = vi.fn().mockResolvedValue(undefined);
const mockGetSession = vi.fn();
const mockUploadSessionPhoto = vi.fn().mockResolvedValue('https://example.com/session-photo.jpg');

vi.mock('@/lib/firestore', () => ({
  getUserSessions: (...args: unknown[]) => mockGetUserSessions(...args),
  createSession: (...args: unknown[]) => mockCreateSession(...args),
  updateSession: (...args: unknown[]) => mockUpdateSession(...args),
  deleteSession: (...args: unknown[]) => mockDeleteSession(...args),
  getSession: (...args: unknown[]) => mockGetSession(...args),
}));

vi.mock('@/lib/storage', () => ({
  uploadSessionPhoto: (...args: unknown[]) => mockUploadSessionPhoto(...args),
}));

// --- Helpers ---

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// --- Tests ---

describe('useSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserSessions.mockResolvedValue(mockSessions);
  });

  it('fetches sessions for the authenticated user', async () => {
    const { result } = renderHook(() => useSessions('dog-1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetUserSessions).toHaveBeenCalledWith('user-1', 'dog-1', undefined);
    expect(result.current.sessions).toEqual(mockSessions);
  });

  it('passes filters to the query function', async () => {
    const filters = { type: 'people' as const };

    const { result } = renderHook(() => useSessions('dog-1', filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetUserSessions).toHaveBeenCalledWith('user-1', 'dog-1', filters);
  });

  it('returns empty array when no sessions exist', async () => {
    mockGetUserSessions.mockResolvedValue([]);

    const { result } = renderHook(() => useSessions('dog-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.sessions).toEqual([]);
  });

  it('createSession calls firestore with correct data', async () => {
    const { result } = renderHook(() => useSessions('dog-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.createSession({
        dogId: 'dog-1',
        date: new Date('2024-03-15'),
        type: 'people',
        category: 'Men',
        reaction: '😊',
      });
    });

    expect(mockCreateSession).toHaveBeenCalledWith(
      expect.objectContaining({
        dogId: 'dog-1',
        type: 'people',
        category: 'Men',
        reaction: '😊',
        userId: 'user-1',
      })
    );
  });

  it('createSession uploads photo when provided', async () => {
    const { result } = renderHook(() => useSessions('dog-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const fakePhoto = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.createSession({
        dogId: 'dog-1',
        date: new Date('2024-03-15'),
        type: 'people',
        category: 'Men',
        reaction: '😊',
        photo: fakePhoto,
      });
    });

    expect(mockUploadSessionPhoto).toHaveBeenCalledWith(
      fakePhoto,
      'user-1',
      expect.stringContaining('temp-')
    );
    expect(mockCreateSession).toHaveBeenCalledWith(
      expect.objectContaining({
        photoUrl: 'https://example.com/session-photo.jpg',
      })
    );
  });

  it('deleteSession calls firestore with correct id', async () => {
    const { result } = renderHook(() => useSessions('dog-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteSession('session-1');
    });

    expect(mockDeleteSession.mock.calls[0][0]).toBe('session-1');
  });
});

describe('useSessionStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserSessions.mockResolvedValue(mockSessions);
  });

  it('derives stats from session data', async () => {
    const { result } = renderHook(() => useSessionStats('dog-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats).toBeDefined();
    expect(result.current.stats.totalSessions).toBe(2);
  });

  it('returns zero stats when no sessions', async () => {
    mockGetUserSessions.mockResolvedValue([]);

    const { result } = renderHook(() => useSessionStats('dog-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats.totalSessions).toBe(0);
  });
});
