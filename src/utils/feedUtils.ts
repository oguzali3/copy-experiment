// src/utils/FeedUtils.ts
import { SocialPaginationInput, FeedConnection } from '@/lib/graphql/types';
import { useEffect, useRef } from 'react';

/**
 * Utility function to detect differences between old and new feed data
 * to determine if there are actually new posts
 */
export const hasNewPosts = (
  oldData: FeedConnection | null,
  newData: FeedConnection | null
): boolean => {
  if (!oldData || !newData) {
    return true; // Consider new data if either is null
  }

  // Check if number of posts has changed
  if (oldData.edges.length !== newData.edges.length) {
    return true;
  }

  // Check if any post IDs differ
  for (let i = 0; i < oldData.edges.length; i++) {
    if (oldData.edges[i].node.id !== newData.edges[i].node.id) {
      return true;
    }
  }

  return false;
};

/**
 * Extracts the last cursor from a feed to use for pagination
 */
export const getLastCursor = (feedData: FeedConnection | null): string | undefined => {
  if (!feedData || !feedData.edges || feedData.edges.length === 0) {
    return undefined;
  }

  return feedData.edges[feedData.edges.length - 1].cursor;
};

/**
 * Generate the correct pagination parameters for the next page
 */
export const getNextPageParams = (
  feedData: FeedConnection | null,
  itemsPerPage: number
): SocialPaginationInput => {
  if (!feedData || !feedData.edges || feedData.edges.length === 0) {
    return { first: itemsPerPage };
  }

  return {
    first: itemsPerPage,
    after: getLastCursor(feedData)
  };
};

/**
 * Debug utility to help track pagination issues
 */
export const debugFeedData = (prefix: string, feedData: FeedConnection | null): void => {
  if (!feedData) {
    console.log(`${prefix}: No feed data available`);
    return;
  }

  console.log(`${prefix}: Feed has ${feedData.edges.length} posts`);
  console.log(`${prefix}: hasNextPage: ${feedData.pageInfo.hasNextPage}`);
  console.log(`${prefix}: endCursor: ${feedData.pageInfo.endCursor}`);
  
  if (feedData.edges.length > 0) {
    console.log(`${prefix}: First post ID: ${feedData.edges[0].node.id}`);
    console.log(`${prefix}: Last post ID: ${feedData.edges[feedData.edges.length - 1].node.id}`);
  }
};

/**
 * Hook to log pagination changes for debugging purposes
 */
export const useDebugPagination = (
  pagination: SocialPaginationInput,
  feedData: FeedConnection | null,
  enabled = false
): void => {
  const prevPagination = useRef<SocialPaginationInput | null>(null);
  const prevFeedLength = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    
    if (JSON.stringify(prevPagination.current) !== JSON.stringify(pagination)) {
      console.log('Pagination changed:', pagination);
      prevPagination.current = { ...pagination };
    }
    
    const currentLength = feedData?.edges.length || 0;
    if (prevFeedLength.current !== currentLength) {
      console.log(`Feed length changed: ${prevFeedLength.current} -> ${currentLength}`);
      console.log('Page info:', feedData?.pageInfo);
      prevFeedLength.current = currentLength;
    }
  }, [pagination, feedData, enabled]);
};