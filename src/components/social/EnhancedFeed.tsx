/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/social/EnhancedFeed.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Post } from "@/components/social/Post";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useImagePreloader } from '@/hooks/useImagePreloader';
import { Spinner, Skeleton, LoadingState, RetryMessage } from "@/components/ui/loaders";
import { 
  useEnhancedFeed, 
  FeedType, 
  FeedFilterInput,
} from '@/hooks/useFeed';
import { SocialPaginationInput } from "./types";

interface EnhancedFeedProps {
  feedType: FeedType;
  filters?: FeedFilterInput;
  onPostUpdated?: () => void;
  showRefreshButton?: boolean;
  emptyMessage?: string;
  itemsPerPage?: number;
}

export const EnhancedFeed: React.FC<EnhancedFeedProps> = ({
  feedType,
  filters,
  onPostUpdated,
  showRefreshButton = true,
  emptyMessage = "No posts found",
  itemsPerPage = 10,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loadedPages, setLoadedPages] = useState<number>(1);
  
  // Initialize pagination with correct parameters
  const [pagination, setPagination] = useState<SocialPaginationInput>({
    first: itemsPerPage,
    after: undefined
  });
  
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);
  const isLoadingMoreRef = useRef(false);
  const loadMoreTriggerTimestamp = useRef(0);
  
  // Create ref for the load more sentinel
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Track component mount state
  const componentIsMounted = useRef(true);
  
  useEffect(() => {
    componentIsMounted.current = true;
    return () => {
      componentIsMounted.current = false;
    };
  }, []);
  
  // Use the enhanced feed hook
  const { 
    loading: feedLoading, 
    error: feedError,
    data: feedData, 
    fetchMore,
    refetch: refetchFeed,
    refreshFeed,
    isRefreshing
  } = useEnhancedFeed(feedType, {
    pagination,
    filters,
    skip: !isAuthenticated
  });
  
  // Set hasInitialized after first data load
  useEffect(() => {
    if (feedData && !hasInitialized) {
      console.log('[EnhancedFeed] Feed initialized');
      setHasInitialized(true);
    }
  }, [feedData, hasInitialized]);

  // Extract posts from the received feedData
  useEffect(() => {
    if (!feedData) return;
  
    console.log(`[EnhancedFeed] ${feedType} feed data received:`, feedData);
    
    // Log pageInfo specifically for debugging
    if (feedData.pageInfo) {
      console.log(`[EnhancedFeed] pageInfo:`, {
        hasNextPage: feedData.pageInfo.hasNextPage,
        endCursor: feedData.pageInfo.endCursor,
        edges: feedData.edges?.length || 0
      });
    }
    
    // Handle different response formats from the API
    let extractedPosts: any[] = [];
    
    if (Array.isArray(feedData)) {
      // Direct array format (old feed endpoint)
      extractedPosts = feedData;
    } else if (feedData.edges && Array.isArray(feedData.edges)) {
      // Connection pattern with edges and nodes (new feed endpoints)
      extractedPosts = feedData.edges.map(edge => edge.node);
      
      // Check if we've reached the end based on pageInfo
      if (feedData.pageInfo && feedData.pageInfo.hasNextPage === false) {
        console.log('[EnhancedFeed] Server indicates no more pages');
        setReachedEnd(true);
      }
    }
    
    if (extractedPosts.length > 0) {
      console.log('[EnhancedFeed] Extracted posts:', extractedPosts.length);
      
      // Only update posts for initial loads, not when loading more
      // This prevents the useEffect from conflicting with the direct updates in loadMorePosts
      if (!isLoadingMore) {
        console.log('[EnhancedFeed] Setting initial posts');
        setPosts(extractedPosts);
        
        // If received fewer posts than requested, we've likely reached the end
        if (extractedPosts.length < itemsPerPage) {
          console.log('[EnhancedFeed] Fewer posts than requested - likely end of feed');
          setReachedEnd(true);
        }
      }
    } else if (!isLoadingMore) {
      // Only show empty state for initial loads
      console.log('[EnhancedFeed] No posts returned for initial load');
      setPosts([]);
    }
    
    // Reset loading flags for initial loads only
    // For "load more" operations, this is handled in the loadMorePosts function
    if (!isLoadingMore) {
      setTimeout(() => {
        if (componentIsMounted.current) {
          isLoadingMoreRef.current = false;
        }
      }, 100);
    }
    
  }, [feedData, feedType, isLoadingMore, itemsPerPage]);
  
  // Preload images for better UX
  const postsToPreload = useCallback(() => {
    return posts.slice(0, 5);
  }, [posts]);
  
  useImagePreloader(postsToPreload(), 5);
  
  // SIMPLE APPROACH: Use direct scroll event listening instead of Intersection Observer
  useEffect(() => {
    // Find the scrollable container - usually a parent with overflow-y: auto
    const findScrollContainer = () => {
      // Try to find the closest scrollable parent
      let element: HTMLElement | null = loadMoreRef.current;
      while (element) {
        // Check if this element or its parent is scrollable
        const style = window.getComputedStyle(element);
        if (style && (style.overflowY === 'auto' || style.overflowY === 'scroll')) {
          return element;
        }
        
        // Move up to parent
        element = element.parentElement;
      }
      
      // If no scrollable parent found, use document
      return document;
    };
    
    // The handler for scroll events
    const handleScroll = () => {
      if (
        !isLoadingMoreRef.current && 
        !feedLoading && 
        hasInitialized && 
        !reachedEnd && 
        posts.length > 0 &&
        loadMoreRef.current
      ) {
        const now = Date.now();
        
        // Only check if we're not throttled
        if (now - loadMoreTriggerTimestamp.current >= 1000) {
          // Get the position of our load-more element
          const rect = loadMoreRef.current.getBoundingClientRect();
          
          // Get the height of the viewport
          const viewportHeight = window.innerHeight;
          
          // Calculate buffer as a percentage of viewport height
          // 70% of viewport height means we'll start loading when the user is 70% of the way down
          const bufferPercentage = 0.7;
          const bufferDistance = viewportHeight * bufferPercentage;
          
          // If element is within our buffer distance of entering the viewport
          if (rect.top - viewportHeight < bufferDistance) {
            console.log('[EnhancedFeed] Scroll position triggered loadMorePosts');
            loadMoreTriggerTimestamp.current = now;
            
            if (componentIsMounted.current) {
              loadMorePosts();
            }
          }
        }
      }
    };
    
    // Find the scrollable container to attach our listener to
    const scrollContainer = findScrollContainer();
    
    // Add the scroll event listener
    if (scrollContainer === document) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    } else {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    // Cleanup the event listener when component unmounts
    return () => {
      if (scrollContainer === document) {
        window.removeEventListener('scroll', handleScroll);
      } else {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [feedLoading, hasInitialized, posts.length, reachedEnd]);
  
  // Improved loadMorePosts function
  const loadMorePosts = async () => {
    // Prevent duplicate loading
    if (isLoadingMoreRef.current || isLoadingMore || reachedEnd || feedLoading) {
      console.log('[EnhancedFeed] Skipping loadMorePosts - already in progress or conditions not met');
      return;
    }
    
    if (posts.length === 0) {
      console.log('[EnhancedFeed] No posts to paginate from');
      return;
    }
    
    // Set loading state
    setIsLoadingMore(true);
    isLoadingMoreRef.current = true;
    
    console.log('[EnhancedFeed] Loading more posts - page', loadedPages + 1);
    
    try {
      // Get cursor directly from feedData.pageInfo
      const endCursor = feedData?.pageInfo?.endCursor;
    
      if (!endCursor) {
        console.warn('[EnhancedFeed] No valid cursor found, cannot fetch more posts');
        setReachedEnd(true);
        setIsLoadingMore(false);
        isLoadingMoreRef.current = false;
        return;
      }
      
      console.log('[EnhancedFeed] Using endCursor:', endCursor);
      
      // Create pagination parameters for the next page
      const nextPagination: SocialPaginationInput = {
        first: itemsPerPage,
        after: endCursor
      };
      
      // Use fetchMore to get the next page
      const result = await fetchMore({
        pagination: nextPagination
      });
      
      // Safety check to make sure component is still mounted
      if (!componentIsMounted.current) return;
      
      // Extract the new posts from the response and update component state
      const feedResponse = result.data?.[`${feedType}Feed`];
      
      if (feedResponse?.edges?.length > 0) {
        // Extract posts from edges
        const newPosts = feedResponse.edges.map(edge => edge.node);
        console.log('[EnhancedFeed] New posts found:', newPosts.length);
        
        // Directly update posts state to ensure the UI updates
        setPosts(prevPosts => {
          // Create a set of existing post IDs for efficient lookup
          const existingPostIds = new Set(prevPosts.map(post => post.id));
          
          // Filter to keep only posts with IDs not already in our list
          const uniqueNewPosts = newPosts.filter(post => !existingPostIds.has(post.id));
          
          console.log('[EnhancedFeed] Unique new posts found:', uniqueNewPosts.length);
          
          if (uniqueNewPosts.length === 0) {
            console.log('[EnhancedFeed] No unique new posts found, likely reached end');
            setTimeout(() => {
              if (componentIsMounted.current) {
                setReachedEnd(true);
              }
            }, 0);
            return prevPosts;
          }
          
          // Update loaded pages count
          setLoadedPages(prev => prev + 1);
          
          // Return combined array of existing posts plus new unique posts
          return [...prevPosts, ...uniqueNewPosts];
        });
      } else {
        console.log('[EnhancedFeed] No new posts returned');
        setReachedEnd(true);
      }
      
      // Update the reached end flag based on pageInfo
      if (feedResponse?.pageInfo?.hasNextPage === false) {
        console.log('[EnhancedFeed] Server indicates end of feed reached');
        setReachedEnd(true);
      }
    } catch (error) {
      console.error('[EnhancedFeed] Error loading more posts:', error);
      if (componentIsMounted.current) {
        toast.error("Couldn't load more posts. Please try again.");
      }
    } finally {
      // Ensure flags are reset even if an error occurs
      setTimeout(() => {
        // Only update state if the component is still mounted
        if (componentIsMounted.current) {
          setIsLoadingMore(false);
          isLoadingMoreRef.current = false;
        }
      }, 300);
    }
  };
  
  // Handle retry for feed loading
  const handleRetryFeed = async () => {
    setIsRetrying(true);
    try {
      await refetchFeed();
    } catch (error) {
      console.error('Error retrying feed load:', error);
    } finally {
      if (componentIsMounted.current) {
        setIsRetrying(false);
      }
    }
  };
  
  // Handle refresh button click with better state management
  const handleRefreshFeed = async () => {
    console.log('[EnhancedFeed] Refreshing feed...');
    
    // Reset all pagination state
    setPagination({
      first: itemsPerPage,
      after: undefined
    });
    
    // Clear posts to force a full refresh
    setPosts([]);
    
    // Reset all pagination-related state
    setLoadedPages(1);
    setReachedEnd(false);
    isLoadingMoreRef.current = false;
    setIsLoadingMore(false);
    loadMoreTriggerTimestamp.current = 0;
    
    // Also reset the hasInitialized flag to ensure proper synchronization
    setHasInitialized(false);
    
    try {
      console.log('[EnhancedFeed] Calling refreshFeed() API...');
      const refreshed = await refreshFeed();
      
      if (refreshed && componentIsMounted.current) {
        // Add a delay to ensure state updates have settled
        setTimeout(() => {
          if (componentIsMounted.current) {
            console.log('[EnhancedFeed] Feed successfully refreshed');
            toast.success("Feed refreshed");
            
            // Set hasInitialized after a successful refresh
            setHasInitialized(true);
          }
        }, 100);
      } else {
        console.warn('[EnhancedFeed] refreshFeed() returned false');
      }
    } catch (error) {
      console.error('[EnhancedFeed] Error refreshing feed:', error);
      if (componentIsMounted.current) {
        toast.error("Couldn't refresh feed. Please try again.");
      }
    }
  };
  
  // Handle post update (like, comment, etc.)
  const handlePostUpdated = useCallback(() => {
    if (onPostUpdated) {
      onPostUpdated();
    }
  }, [onPostUpdated]);
  
  // Feed title based on type
  const getFeedTitle = () => {
    switch (feedType) {
      case 'home':
        return 'Home Feed';
      case 'explore':
        return 'Explore';
      case 'following':
        return 'Following';
      case 'popular':
        return 'Popular';
      case 'filtered':
        return 'Search Results';
      default:
        return 'Feed';
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Feed header with refresh button */}
      {showRefreshButton && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {getFeedTitle()}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshFeed}
            disabled={isRefreshing || feedLoading}
            className="flex items-center gap-2"
          >
            <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      )}
      
      {/* Feed Error State */}
      {feedError && (
        <RetryMessage
          message="Couldn't load your feed"
          description="There was a problem loading the latest posts."
          onRetry={handleRetryFeed}
          retrying={isRetrying}
          className="mb-4"
        />
      )}
      
      {/* Main Loading State */}
      <LoadingState
        loading={feedLoading && posts.length === 0}
        spinnerLabel={`Loading ${feedType} feed...`}
        fallback={
          <div className="space-y-4">
            <Skeleton variant="feed-post" count={3} />
          </div>
        }
      >
        <div className="space-y-6 relative">
          {/* Show posts */}
          {posts.length > 0 ? (
            <>
              {posts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  onPostUpdated={handlePostUpdated}
                />
              ))}
              
              {/* Load more indicator */}
              {!reachedEnd && (
                <div 
                  ref={loadMoreRef} 
                  className="py-4 w-full"
                  data-testid="load-more-trigger"
                >
                  {isLoadingMore ? (
                    <div className="text-center">
                      <Spinner size="sm" label="Loading more posts..." />
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={loadMorePosts}
                      disabled={isLoadingMore || feedLoading}
                      className="mx-auto block"
                    >
                      Load more
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            // Empty state
            !feedLoading && (
              <div className="p-8 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow">
                {emptyMessage}
              </div>
            )
          )}
          
          {/* End of feed indicator */}
          {reachedEnd && posts.length > 0 && (
            <div className="py-4 text-center text-gray-500">
              You've reached the end of your feed
            </div>
          )}
        </div>
      </LoadingState>
    </div>
  );
};