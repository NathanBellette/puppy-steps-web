import { act } from '@testing-library/react';
import { useSessions, useSessionStats } from './useSessions';
import { getUserSessions, createSession, deleteSession } from '@/lib/firestore';
import { uploadSessionPhoto } from '@/lib/storage';
import { makePhoto, makeSession } from '@/test/fixtures';
import { renderLoadedHook } from '@/test/utils';

vi.mock('./useAuth');
vi.mock('@/lib/firestore');
vi.mock('@/lib/storage');

const mockSessions = [
  makeSession({
    date: new Date('2024-03-10T10:00:00'),
    placeType: 'Park',
    intensity: 'low',
    isNewToDog: false,
    createdAt: new Date('2024-03-10'),
  }),
  makeSession({
    id: 'session-2',
    date: new Date('2024-03-11T14:00:00'),
    type: 'dogs',
    category: 'Small Dogs',
    reaction: '😍',
    placeType: 'Street',
    intensity: 'medium',
    isNewToDog: true,
    createdAt: new Date('2024-03-11'),
  }),
];

const renderSessions = async () => (await renderLoadedHook(() => useSessions('dog-1'))).result;

const logMenSession = async (photo?: File) => {
  const result = await renderSessions();
  await act(async () => {
    await result.current.createSession({
      dogId: 'dog-1',
      date: new Date('2024-03-15'),
      type: 'people',
      category: 'Men',
      reaction: '😊',
      photo,
    });
  });
};

describe('useSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserSessions).mockResolvedValue(mockSessions);
    vi.mocked(createSession).mockResolvedValue('session-3');
    vi.mocked(uploadSessionPhoto).mockResolvedValue('https://example.com/session-photo.jpg');
  });

  it.each([
    { scenario: 'fetches sessions for the authenticated user', sessions: mockSessions },
    { scenario: 'returns empty array when no sessions exist', sessions: [] },
  ])('$scenario', async ({ sessions }) => {
    vi.mocked(getUserSessions).mockResolvedValue(sessions);

    const { result, initiallyLoading } = await renderLoadedHook(() => useSessions('dog-1'));

    expect(initiallyLoading).toBe(true);
    expect(getUserSessions).toHaveBeenCalledWith('user-1', 'dog-1', undefined);
    expect(result.current.sessions).toEqual(sessions);
  });

  it('passes filters to the query function', async () => {
    const filters = { type: 'people' as const };

    await renderLoadedHook(() => useSessions('dog-1', filters));

    expect(getUserSessions).toHaveBeenCalledWith('user-1', 'dog-1', filters);
  });

  it('createSession calls firestore with correct data', async () => {
    await logMenSession();

    expect(createSession).toHaveBeenCalledWith(
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
    const photo = makePhoto();

    await logMenSession(photo);

    expect(uploadSessionPhoto).toHaveBeenCalledWith(
      photo,
      'user-1',
      expect.stringContaining('temp-')
    );
    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({ photoUrl: 'https://example.com/session-photo.jpg' })
    );
  });

  it('deleteSession calls firestore with correct id', async () => {
    const result = await renderSessions();

    await act(async () => {
      await result.current.deleteSession('session-1');
    });

    expect(vi.mocked(deleteSession).mock.calls[0][0]).toBe('session-1');
  });
});

describe('useSessionStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    { sessions: mockSessions, totalSessions: 2, scenario: 'derives stats from session data' },
    { sessions: [], totalSessions: 0, scenario: 'returns zero stats when no sessions' },
  ])('$scenario', async ({ sessions, totalSessions }) => {
    vi.mocked(getUserSessions).mockResolvedValue(sessions);

    const { result } = await renderLoadedHook(() => useSessionStats('dog-1'));

    expect(result.current.stats).toMatchObject({ totalSessions });
  });
});
