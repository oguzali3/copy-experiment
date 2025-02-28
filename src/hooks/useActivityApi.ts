// src/hooks/useActivityApi.ts
import { useQuery } from '@apollo/client';
import { GET_USER_ACTIVITY } from '@/lib/graphql/operations/queries';

export const useActivityApi = () => {
  // Hook to get a user's activity feed (posts and comments)
  const useActivity = (pagination: { first: number; after: string | null }) => {
    return useQuery(GET_USER_ACTIVITY, {
      variables: { pagination },
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-first',
    });
  };

  return {
    useActivity,
  };
};