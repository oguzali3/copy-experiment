// src/providers/ApolloProvider.tsx
import { ApolloProvider as BaseApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/graphql/client';
import { ReactNode, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';

interface ApolloProviderProps {
  children: ReactNode;
}

export const ApolloProvider = ({ children }: ApolloProviderProps) => {
  const user = useUser();

  // Reset the Apollo cache when the user changes
  useEffect(() => {
    apolloClient.resetStore();
  }, [user?.id]);

  return (
    <BaseApolloProvider client={apolloClient}>
      {children}
    </BaseApolloProvider>
  );
};