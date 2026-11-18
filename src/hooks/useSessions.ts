import {
  getUserSessions,
  createSession,
  updateSession,
  deleteSession,
} from '@/lib/firestore';
import { uploadSessionPhoto } from '@/lib/storage';
import { SessionFormData, SessionFilters } from '@/types';
import { computeSessionStats } from '@/services/sessionStats';
import { useDerivedStats, useRefreshingMutation, useUserDocuments } from './useUserDocuments';

export const useSessions = (dogId?: string, filters?: SessionFilters) => {
  const {
    user,
    queryKey,
    data: sessions,
    isLoading,
    error,
    refetch
  } = useUserDocuments('sessions', [dogId, filters], (userId) => getUserSessions(userId, dogId, filters));

  const createSessionMutation = useRefreshingMutation(async ({ photo, ...data }: SessionFormData) => {
    const photoUrl = photo ? await uploadSessionPhoto(photo, user!.uid, `temp-${Date.now()}`) : undefined;
    return createSession({
      ...data,
      userId: user!.uid,
      photoUrl,
    });
  }, queryKey);

  const updateSessionMutation = useRefreshingMutation(async ({
    id,
    data,
    photo
  }: {
    id: string;
    data: Partial<SessionFormData>;
    photo?: File
  }) => {
    const photoUrl = photo ? await uploadSessionPhoto(photo, user!.uid, id) : undefined;
    const { photo: _omit, ...updateData } = data;
    return updateSession(id, { ...updateData, photoUrl });
  }, queryKey);

  const deleteSessionMutation = useRefreshingMutation(deleteSession, queryKey);

  return {
    sessions,
    isLoading,
    error,
    refetch,
    createSession: createSessionMutation.mutateAsync,
    updateSession: updateSessionMutation.mutateAsync,
    deleteSession: deleteSessionMutation.mutateAsync,
    isCreating: createSessionMutation.isPending,
    isUpdating: updateSessionMutation.isPending,
    isDeleting: deleteSessionMutation.isPending,
  };
};

/** Session stats for a dog, derived from the cached sessions list. */
export const useSessionStats = (dogId?: string) => {
  const { sessions, isLoading } = useSessions(dogId);
  return useDerivedStats(sessions, isLoading, computeSessionStats);
};
