import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { 
  getUserSessions, 
  createSession, 
  updateSession, 
  deleteSession,
  getSession 
} from '@/lib/firestore';
import { uploadSessionPhoto } from '@/lib/storage';
import { SessionFormData, SessionFilters } from '@/types';
import { computeSessionStats } from '@/services/sessionStats';

export const useSessions = (dogId?: string, filters?: SessionFilters) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    data: sessions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['sessions', user?.uid, dogId, filters],
    queryFn: () => getUserSessions(user!.uid, dogId, filters),
    enabled: !!user,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: SessionFormData) => {
      let photoUrl: string | undefined;
      
      if (sessionData.photo) {
        const sessionId = `temp-${Date.now()}`;
        photoUrl = await uploadSessionPhoto(sessionData.photo, user!.uid, sessionId);
      }

      const { photo: _photo, ...data } = sessionData;
      return createSession({
        ...data,
        userId: user!.uid,
        photoUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', user?.uid, dogId, filters] });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ 
      id, 
      data, 
      photo 
    }: { 
      id: string; 
      data: Partial<SessionFormData>; 
      photo?: File 
    }) => {
      let photoUrl: string | undefined;
      
      if (photo) {
        photoUrl = await uploadSessionPhoto(photo, user!.uid, id);
      }

      const { photo: _omit, ...updateData } = data;
      return updateSession(id, { ...updateData, photoUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', user?.uid, dogId, filters] });
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', user?.uid, dogId, filters] });
    },
  });

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

export const useSession = (sessionId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSession(sessionId),
    enabled: !!user && !!sessionId,
  });
};

export const useSessionsByDate = (dogId?: string, startDate?: Date, endDate?: Date) => {
  const filters: SessionFilters = {
    dogId,
    dateFrom: startDate,
    dateTo: endDate,
  };

  return useSessions(dogId, filters);
};

/**
 * Derives session stats from the sessions list using a pure computation function.
 * Shares the React Query cache with useSessions.
 */
export const useSessionStats = (dogId?: string) => {
  const { sessions, isLoading } = useSessions(dogId);
  const stats = useMemo(() => computeSessionStats(sessions), [sessions]);
  return { stats, isLoading };
};
