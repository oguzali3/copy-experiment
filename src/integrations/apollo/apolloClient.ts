// src/integrations/apollo/apolloClient.ts
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { toast } from 'sonner';
import { getAuthToken } from '@/services/auth.service';

// Create an http link
const httpLink = createHttpLink({
  uri:  'http://localhost:4000/graphql',
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // Show user-friendly error message for common errors
      if (message.includes('Unauthorized') || message.includes('not authenticated')) {
        toast.error('Your session has expired. Please sign in again.');
      } else {
        toast.error(message || 'An error occurred with your request');
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    toast.error('Network error. Please check your connection');
  }
});

// Auth link for adding the token to requests
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from the service
  const token = getAuthToken();
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Create the Apollo Client
const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default client;