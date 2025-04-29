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
  uri: import.meta.env.VITE_GRAPHQL_URL,
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
          // Standard feed query
          feed: {
            // Don't merge arrays, use cache-and-network to get fresh data when needed
            merge(existing, incoming) {
              return incoming;
            }
          },
          
          // Connection-based feed types
          homeFeed: {
            keyArgs: false,
            merge(existing = { edges: [], pageInfo: {} }, incoming) {
              if (!incoming) return existing;
              
              // If this is a refresh (no existing data or clearing cache), just return incoming
              if (!existing.edges || existing.edges.length === 0) {
                return incoming;
              }
              
              // Create a set of existing IDs for efficient lookup
              const existingIds = new Set(
                existing.edges.map(edge => edge.node.id)
              );
              
              // Filter incoming edges to only include new unique ones
              const newUniqueEdges = incoming.edges.filter(
                edge => !existingIds.has(edge.node.id)
              );
              
              console.log(`[Apollo Cache] Merging homeFeed: found ${newUniqueEdges.length} new edges`);
              
              return {
                __typename: incoming.__typename,
                edges: [...existing.edges, ...newUniqueEdges],
                pageInfo: incoming.pageInfo,
              };
            }
          },
          
          exploreFeed: {
            keyArgs: false,
            merge(existing = { edges: [], pageInfo: {} }, incoming) {
              if (!incoming) return existing;
              
              // If this is a refresh (no existing data or clearing cache), just return incoming
              if (!existing.edges || existing.edges.length === 0) {
                return incoming;
              }
              
              // Create a set of existing IDs for efficient lookup
              const existingIds = new Set(
                existing.edges.map(edge => edge.node.id)
              );
              
              // Filter incoming edges to only include new unique ones
              const newUniqueEdges = incoming.edges.filter(
                edge => !existingIds.has(edge.node.id)
              );
              
              console.log(`[Apollo Cache] Merging exploreFeed: found ${newUniqueEdges.length} new edges`);
              
              // CRITICAL FIX: Create a new object for Apollo cache to properly detect the change
              const result = {
                __typename: incoming.__typename,
                edges: [...existing.edges, ...newUniqueEdges],
                pageInfo: incoming.pageInfo,
              };
              
              console.log(`[Apollo Cache] Final exploreFeed edges count: ${result.edges.length}`);
              
              return result;
            }
          },
          
          followingFeed: {
            keyArgs: false,
            merge(existing = { edges: [], pageInfo: {} }, incoming) {
              if (!incoming) return existing;
              
              if (!existing.edges || existing.edges.length === 0) {
                return incoming;
              }
              
              const existingIds = new Set(
                existing.edges.map(edge => edge.node.id)
              );
              
              const newUniqueEdges = incoming.edges.filter(
                edge => !existingIds.has(edge.node.id)
              );
              
              console.log(`[Apollo Cache] Merging followingFeed: found ${newUniqueEdges.length} new edges`);
              
              return {
                __typename: incoming.__typename,
                edges: [...existing.edges, ...newUniqueEdges],
                pageInfo: incoming.pageInfo,
              };
            }
          },
          
          popularFeed: {
            keyArgs: false,
            merge(existing = { edges: [], pageInfo: {} }, incoming) {
              if (!incoming) return existing;
              
              if (!existing.edges || existing.edges.length === 0) {
                return incoming;
              }
              
              const existingIds = new Set(
                existing.edges.map(edge => edge.node.id)
              );
              
              const newUniqueEdges = incoming.edges.filter(
                edge => !existingIds.has(edge.node.id)
              );
              
              console.log(`[Apollo Cache] Merging popularFeed: found ${newUniqueEdges.length} new edges`);
              
              return {
                __typename: incoming.__typename,
                edges: [...existing.edges, ...newUniqueEdges],
                pageInfo: incoming.pageInfo,
              };
            }
          },
          
          filteredFeed: {
            // For filteredFeed, we need to consider filters as key args
            keyArgs: ['filters'],
            merge(existing = { edges: [], pageInfo: {} }, incoming, { args }) {
              if (!incoming) return existing;
              
              if (!existing.edges || existing.edges.length === 0) {
                return incoming;
              }
              
              const existingIds = new Set(
                existing.edges.map(edge => edge.node.id)
              );
              
              const newUniqueEdges = incoming.edges.filter(
                edge => !existingIds.has(edge.node.id)
              );
              
              console.log(`[Apollo Cache] Merging filteredFeed: found ${newUniqueEdges.length} new edges`);
              
              return {
                __typename: incoming.__typename,
                edges: [...existing.edges, ...newUniqueEdges],
                pageInfo: incoming.pageInfo,
              };
            }
          },
          
          // Other pagination-based fields
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
      // Disable caching for all queries
      fetchPolicy: 'network-only', // Changed from 'cache-and-network'
      nextFetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only', // Changed from 'cache-first'
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