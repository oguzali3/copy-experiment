// src/hooks/useFeed.ts - Fixed hook for proper pagination
import { useState, useEffect, useCallback } from 'react';
import { gql, useQuery } from '@apollo/client';
import { SocialPaginationInput } from '@/components/social/types';

// Define the feed types
export type FeedType = 'home' | 'filtered';

// Define the filter input for filtered feeds
export interface FeedFilterInput {
  tickers?: string[];
  hashtags?: string[];
  timeRange?: string;
  contentType?: string;
  sortBy?: string;
  includeFollowing?: boolean;
  includeUserPosts?: boolean;
}

// GraphQL query for home feed
const GET_HOME_FEED = gql`
  query GetHomeFeed($pagination: SocialPaginationInput!) {
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

// GraphQL query for filtered feed
const GET_FILTERED_FEED = gql`
  query GetFilteredFeed($pagination: SocialPaginationInput!, $filters: FeedFilterInput!) {
    filteredFeed(pagination: $pagination, filters: $filters) {
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
interface UseFeedOptions {
  pagination?: SocialPaginationInput;
  filters?: FeedFilterInput;
  skip?: boolean;
}

/**
 * Hook for fetching feed data with pagination support
 */
export const useFeed = (
  feedType: FeedType,
  options: UseFeedOptions = {}
) => {
  const { pagination = { first: 10 }, filters = {}, skip = false } = options;
  
  // State for refreshing
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Determine which query to use based on feed type
  const query = feedType === 'home' ? GET_HOME_FEED : GET_FILTERED_FEED;
  
  // Prepare query variables based on feed type
  const variables = feedType === 'home' 
    ? { pagination }
    : { pagination, filters };
  
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
    fetchPolicy: 'network-only',  // Always fetch from network first
    nextFetchPolicy: 'cache-first', // Then use cache for subsequent requests
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
      console.error(`[useFeed] Error refetching ${feedType} feed:`, error);
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
      console.error(`[useFeed] Error refreshing ${feedType} feed:`, error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [apolloRefetch, feedType]);
  
  // Function to fetch more feed data (pagination)
  const fetchMore = useCallback(async ({ pagination: newPagination }) => {
    console.log(`[useFeed] Fetching more ${feedType} feed data with pagination:`, newPagination);
    
    try {
      // Prepare new variables based on feed type
      const newVariables = feedType === 'home'
        ? { pagination: newPagination }
        : { pagination: newPagination, filters };
      
      // Log key information for debugging
      console.log(`[useFeed] fetchMore variables:`, newVariables);
      
      // Call Apollo's fetchMore
      const result = await apolloFetchMore({
        variables: newVariables,
      });
      
      // Log result structure for debugging
      console.log(`[useFeed] fetchMore result structure:`, {
        hasData: !!result.data,
        dataKeys: result.data ? Object.keys(result.data) : []
      });
      
      return result;
    } catch (error) {
      console.error(`[useFeed] Error fetching more ${feedType} feed data:`, error);
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
 * Helper hook to extract and format feed data from different response formats
 */
const useFeedData = (feedType: FeedType, data: any) => {
  // Process and return the appropriate data based on feed type
  if (!data) return null;
  
  switch (feedType) {
    case 'home':
      // Home feed is directly in data.feed
      return data.feed || [];
    
    case 'filtered':
      // Filtered feed is in data.filteredFeed
      return data.filteredFeed || [];
    
    default:
      console.warn(`[useFeedData] Unknown feed type: ${feedType}`);
      return [];
  }
};

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