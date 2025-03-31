// src/hooks/useFeed.ts
import { useState, useCallback } from 'react';
import { gql, useQuery } from '@apollo/client';
import { SocialPaginationInput } from '@/components/social/types';

// Define all the feed types your resolver supports
export type FeedType = 'home' | 'explore' | 'following' | 'popular' | 'filtered';

// Define the filter input for filtered feeds
export interface FeedFilterInput {
  tickers?: string[];
  hashtags?: string[];
  timeRange?: string;
  contentType?: string;
}

// GraphQL fragment for post fields
const POST_FIELDS = `
  fragment PostFields on PostType {
    id
    content
    mentionedTickers
    imageUrl
    likesCount
    commentsCount
    isLiked
    isLikedByMe
    createdAt
    author {
      id
      displayName
      avatarUrl
      isVerified
      isFollowing
      followersCount
      followingCount
    }
    imageVariants {
      original
      thumbnail
      medium
      optimized
    }
  }
`;

// GraphQL queries for different feed types
const GET_HOME_FEED = gql`
  ${POST_FIELDS}
  query GetHomeFeed($pagination: SocialPaginationInput!) {
    homeFeed(pagination: $pagination) {
      edges {
        node {
          ...PostFields
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
        hasPreviousPage
      }
    }
  }
`;

const GET_EXPLORE_FEED = gql`
  ${POST_FIELDS}
  query GetExploreFeed($pagination: SocialPaginationInput!) {
    exploreFeed(pagination: $pagination) {
      edges {
        node {
          ...PostFields
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
        hasPreviousPage
      }
    }
  }
`;

const GET_FOLLOWING_FEED = gql`
  ${POST_FIELDS}
  query GetFollowingFeed($pagination: SocialPaginationInput!) {
    followingFeed(pagination: $pagination) {
      edges {
        node {
          ...PostFields
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
        hasPreviousPage
      }
    }
  }
`;

const GET_POPULAR_FEED = gql`
  ${POST_FIELDS}
  query GetPopularFeed($pagination: SocialPaginationInput!) {
    popularFeed(pagination: $pagination) {
      edges {
        node {
          ...PostFields
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
        hasPreviousPage
      }
    }
  }
`;

const GET_FILTERED_FEED = gql`
  ${POST_FIELDS}
  query GetFilteredFeed($pagination: SocialPaginationInput!, $filters: FeedFilterInput!) {
    filteredFeed(pagination: $pagination, filters: $filters) {
      edges {
        node {
          ...PostFields
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
        hasPreviousPage
      }
    }
  }
`;

// For backward compatibility - use the current feed query
const GET_FEED = gql`
  query GetFeed($pagination: SocialPaginationInput!) {
    feed(pagination: $pagination) {
      id
      content
      mentionedTickers
      imageUrl
      likesCount
      commentsCount
      isLiked
      isLikedByMe
      createdAt
      author {
        id
        displayName
        avatarUrl
        isVerified
        isFollowing
        followersCount
        followingCount
      }
      imageVariants {
        original
        thumbnail
        medium
        optimized
      }
    }
  }
`;

// Hook options interface
interface UseEnhancedFeedOptions {
  pagination?: SocialPaginationInput;
  filters?: FeedFilterInput;
  skip?: boolean;
}

/**
 * Enhanced hook for fetching feed data with support for all feed types
 */
export const useEnhancedFeed = (
  feedType: FeedType = 'home',
  options: UseEnhancedFeedOptions = {}
) => {
  const { pagination = { first: 10 }, filters = {}, skip = false } = options;
  
  // State for refreshing
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Determine which query to use based on feed type
  const getQueryForFeedType = useCallback(() => {
    switch (feedType) {
      case 'home':
        return GET_HOME_FEED;
      case 'explore':
        return GET_EXPLORE_FEED;
      case 'following':
        return GET_FOLLOWING_FEED;
      case 'popular':
        return GET_POPULAR_FEED;
      case 'filtered':
        return GET_FILTERED_FEED;
      default:
        return GET_FEED; // Fallback to basic feed
    }
  }, [feedType]);
  
  const query = getQueryForFeedType();
  
  // Prepare query variables based on feed type
  const variables = feedType === 'filtered' 
    ? { pagination, filters }
    : { pagination };
  
  // Use Apollo's useQuery hook
  const { 
    loading,
    error,
    data,
    refetch: apolloRefetch,
    fetchMore: apolloFetchMore
  } = useQuery(query, {
    variables,
    skip,
    fetchPolicy: 'no-cache',
    nextFetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
  });
  
  // Extract the relevant feed data from the response
  const feedData = useFeedData(feedType, data);
  
  // Function to refetch feed data
  const refetch = useCallback(async () => {
    try {
      const result = await apolloRefetch();
      return result.data;
    } catch (error) {
      console.error(`[useEnhancedFeed] Error refetching ${feedType} feed:`, error);
      throw error;
    }
  }, [apolloRefetch, feedType]);
  
  // Function to refresh feed data (with loading state)
  const refreshFeed = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const result = await apolloRefetch();
      return !!result.data;
    } catch (error) {
      console.error(`[useEnhancedFeed] Error refreshing ${feedType} feed:`, error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [apolloRefetch, feedType]);
  
  // Function to fetch more feed data (pagination)
  const fetchMore = useCallback(async ({ pagination: newPagination }) => {
    console.log(`[useEnhancedFeed] Fetching more ${feedType} feed data with pagination:`, newPagination);
    
    try {
      // Prepare new variables based on feed type
      const newVariables = feedType === 'filtered'
        ? { pagination: newPagination, filters }
        : { pagination: newPagination };
      
      // Call Apollo's fetchMore with proper options
      const result = await apolloFetchMore({
        variables: newVariables,
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          
          console.log('[useEnhancedFeed] Received more data:', fetchMoreResult);
          
          const feedKey = `${feedType}Feed`;
          if (!fetchMoreResult[feedKey]) {
            console.warn('[useEnhancedFeed] No feed data in result');
            return prev;
          }
          
          // Get the response
          const feedResponse = fetchMoreResult[feedKey];
          
          // No edges or empty edges
          if (!feedResponse.edges || !Array.isArray(feedResponse.edges) || feedResponse.edges.length === 0) {
            console.log('[useEnhancedFeed] No edges found in fetchMoreResult');
            return prev;
          }
          
          // Check if prev has the expected structure
          if (!prev[feedKey] || !prev[feedKey].edges) {
            console.warn('[useEnhancedFeed] Previous data missing expected structure');
            return fetchMoreResult; // Return new result if prev is malformed
          }
          
          // Create a *new* merged result that Apollo can safely cache
          const mergedResult = {
            ...prev,
            [feedKey]: {
              ...feedResponse,
              __typename: feedResponse.__typename,
              edges: [
                ...prev[feedKey].edges,
                ...feedResponse.edges
              ],
              pageInfo: feedResponse.pageInfo
            }
          };
          
          console.log(`[useEnhancedFeed] Combined result has ${mergedResult[feedKey].edges.length} total edges`);
          
          return mergedResult;
        }
      });
      
      console.log(`[useEnhancedFeed] fetchMore result:`, result.data);
      
      return result;
    } catch (error) {
      console.error(`[useEnhancedFeed] Error fetching more ${feedType} feed data:`, error);
      throw error;
    }
  }, [apolloFetchMore, feedType, filters]);
  
  return {
    loading,
    error,
    data: feedData,
    refetch,
    refreshFeed,
    fetchMore,
    isRefreshing,
  };
};

/**
 * Helper function to extract and format feed data from different response formats
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useFeedData = (feedType: FeedType, data: any) => {
  if (!data) return null;
  
  console.log(`[useFeedData] Processing data for ${feedType}:`, data);
  
  // Handle different feed response formats
  switch (feedType) {
    case 'home':
      if (data.homeFeed) {
        // Connection pattern with edges and nodes
        return data.homeFeed;
      }
      break;
    
    case 'explore':
      if (data.exploreFeed) {
        // Connection pattern with edges and nodes
        return data.exploreFeed;
      }
      break;
    
    case 'following':
      if (data.followingFeed) {
        // Connection pattern with edges and nodes
        return data.followingFeed;
      }
      break;
    
    case 'popular':
      if (data.popularFeed) {
        // Connection pattern with edges and nodes
        return data.popularFeed;
      }
      break;
    
    case 'filtered':
      if (data.filteredFeed) {
        // Connection pattern with edges and nodes
        return data.filteredFeed;
      }
      break;
    
    default:
      // Backward compatibility with the old feed format
      if (data.feed) {
        return data.feed;
      }
      break;
  }
  
  return null;
};

// Additional hooks for related queries

/**
 * Hook for fetching trending hashtags
 */
export const useTrendingHashtags = (limit = 5) => {
  const TRENDING_HASHTAGS = gql`
    query GetTrendingHashtags($limit: Int) {
      searchHashtags(query: "", limit: $limit) {
        tag
        count
      }
    }
  `;
  
  const { loading, error, data } = useQuery(TRENDING_HASHTAGS, {
    variables: { limit },
    fetchPolicy: 'cache-and-network',
  });
  
  return { loading, error, data };
};

/**
 * Hook for fetching trending tickers
 */
export const useTrendingTickers = (limit = 5) => {
  const TRENDING_TICKERS = gql`
    query GetTrendingTickers($limit: Int) {
      searchTickers(query: "", limit: $limit) {
        symbol
        name
        price
        change
        changePercent
      }
    }
  `;
  
  const { loading, error, data } = useQuery(TRENDING_TICKERS, {
    variables: { limit },
    fetchPolicy: 'cache-and-network',
  });
  
  return { loading, error, data };
};