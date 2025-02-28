// src/lib/graphql/client.ts
import { ApolloClient, InMemoryCache, createHttpLink, from, Observable } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { toast } from 'sonner';

// Local storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

// Create an HTTP link to your GraphQL server
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const error of graphQLErrors) {
      console.error(
        `[GraphQL error]: Message: ${error.message}, Location: ${error.locations}, Path: ${error.path}`
      );
      
      // Only show toast for errors that should be visible to users
      if (!error.message.includes('Authentication')) {
        toast.error(`Error: ${error.message}`);
      }

      // Handle authentication errors
      if (error.message.includes('Authentication')) {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        
        if (refreshToken) {
          // This would typically be handled by the auth context refresh mechanism
          // But we include basic handling here as a fallback
          return new Observable(observer => {
            // We don't attempt to refresh the token here because that would create
            // a circular dependency with operations that themselves might get auth errors
            // The AuthContext handles token refresh
            observer.error(error);
          });
        }
      }
    }
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    toast.error('Network error. Please check your connection.');
  }
});

// Auth link to add authorization headers
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from localStorage
  const token = localStorage.getItem(TOKEN_KEY);
  
  // Return the headers to the context
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create the Apollo Client with improved cache configuration
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          feed: {
            // Don't merge arrays, use cache-and-network to get fresh data when needed
            merge(existing, incoming) {
              return incoming;
            }
          },
          postComments: {
            // Merge function for paginated comments
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            }
          },
          getFollowers: {
            // Custom merge for followers connection
            merge(existing, incoming) {
              if (!existing) return incoming;
              return {
                ...incoming,
                users: [...(existing.users || []), ...incoming.users]
              };
            }
          },
          getFollowing: {
            // Custom merge for following connection
            merge(existing, incoming) {
              if (!existing) return incoming;
              return {
                ...incoming,
                users: [...(existing.users || []), ...incoming.users]
              };
            }
          }
        }
      },
      // Add specific type policies for Post
      Post: {
        fields: {
          likesCount: {
            // Make likesCount properly merge with existing values
            merge(existing, incoming) {
              return incoming;
            }
          },
          isLikedByMe: {
            // Ensure isLikedByMe is always updated correctly
            merge(existing, incoming) {
              return incoming;
            }
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      // Use cache-first for better performance, with network updates when needed
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Utility function to reset the Apollo cache
export const resetApolloCache = () => {
  apolloClient.resetStore();
};