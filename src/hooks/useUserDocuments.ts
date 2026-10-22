import { useMemo } from 'react';
import { QueryKey, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

/**
 * Lists the signed-in user's documents under the query key `[name, uid, ...scope]`.
 * The query stays idle until someone is signed in.
 */
export const useUserDocuments = <T>(name: string, scope: unknown[], fetch: (userId: string) => Promise<T[]>) => {
  const { user } = useAuth();
  const queryKey = [name, user?.uid, ...scope];
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetch(user!.uid),
    enabled: !!user,
  });
  return { user, queryKey, data, isLoading, error, refetch };
};

/** A mutation that refreshes the given queries once it succeeds. */
export const useRefreshingMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  ...queryKeys: QueryKey[]
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryKeys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    },
  });
};

/**
 * Derives stats from a list using a pure computation function.
 * Shares the React Query cache with the hook that supplied the list.
 */
export const useDerivedStats = <T, S>(items: T[], isLoading: boolean, computeStats: (items: T[]) => S) => {
  const stats = useMemo(() => computeStats(items), [items, computeStats]);
  return { stats, isLoading };
};

