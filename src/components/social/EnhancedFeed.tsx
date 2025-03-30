// src/components/social/EnhancedFeed.tsx - Fixed pagination for non-standard cursor API
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Post } from "@/components/social/Post";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useImagePreloader } from '@/hooks/useImagePreloader';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Spinner, Skeleton, LoadingState, RetryMessage } from "@/components/ui/loaders";
import { 
  useFeed, 
  FeedType, 
  FeedFilterInput,
} from '@/hooks/useFeed';
import { Post as PostType } from "@/lib/graphql/types";
import { SocialPaginationInput } from "./types";

// Extended PostType interface to include imageVariants
interface ExtendedPostType extends PostType {
  imageVariants?: {
    original: string;
    thumbnail: string;
    medium: string;
    optimized: string;
  };
}

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
  const [posts, setPosts] = useState<ExtendedPostType[]>([]);
  const [loadedPages, setLoadedPages] = useState<number>(1);
  
  // Initialize pagination with correct parameters matching server expectations
  const [pagination, setPagination] = useState<SocialPaginationInput>({
    first: itemsPerPage,
    after: undefined
  });
  
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Track if we've reached the end of available posts
  const [reachedEnd, setReachedEnd] = useState(false);
  
  // Add a debounce flag for loadMore to prevent duplicate calls
  const isLoadingMoreRef = useRef(false);
  
  // Ref for infinite scrolling
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Create intersection observer for infinite scrolling
  const { isVisible } = useIntersectionObserver(
    loadMoreRef,
    {
      root: null,
      rootMargin: '200px', // Increased for better responsiveness
      threshold: 0.1
    }
  );
  
  // Fetch feed data with the custom hook with correct pagination
  const { 
    loading: feedLoading, 
    error: feedError,
    data: feedData, 
    fetchMore,
    refetch: refetchFeed,
    refreshFeed,
    isRefreshing
  } = useFeed(feedType, {
    pagination,
    filters,
    skip: !isAuthenticated
  });
  
  // Extract posts from the received feedData
  useEffect(() => {
    if (!feedData) return;

    console.log('[EnhancedFeed] Feed data received:', feedData);
    
    // Handle different response formats from the API
    let extractedPosts: ExtendedPostType[] = [];
    
    if (Array.isArray(feedData)) {
      // Direct array format
      extractedPosts = feedData as ExtendedPostType[];
    } else if (feedData.edges && Array.isArray(feedData.edges)) {
      // Connection pattern with edges and nodes
      extractedPosts = feedData.edges.map(edge => edge.node as ExtendedPostType);
    } else if (feedData.feed && Array.isArray(feedData.feed)) {
      // Nested feed array
      extractedPosts = feedData.feed as ExtendedPostType[];
    } else {
      console.error('[EnhancedFeed] Unexpected feed data format:', feedData);
    }
    
    if (extractedPosts.length > 0) {
      console.log('[EnhancedFeed] Extracted posts:', extractedPosts.length);
      
      // If this is a fresh load (not loading more), replace all posts
      if (!isLoadingMore) {
        setPosts(extractedPosts);
      } else {
        // When loading more, append new posts while avoiding duplicates
        setPosts(prevPosts => {
          const existingIds = new Set(prevPosts.map(post => post.id));
          const uniqueNewPosts = extractedPosts.filter(post => !existingIds.has(post.id));
          
          console.log('[EnhancedFeed] Unique new posts to add:', uniqueNewPosts.length);
          
          if (uniqueNewPosts.length === 0) {
            // No new posts means we've reached the end
            setTimeout(() => {
              setReachedEnd(true);
            }, 0);
            return prevPosts;
          }
          
          return [...prevPosts, ...uniqueNewPosts];
        });
      }
      
      // If received fewer posts than requested, we've likely reached the end
      if (extractedPosts.length < itemsPerPage) {
        console.log('[EnhancedFeed] Fewer posts than requested - likely end of feed');
        setReachedEnd(true);
      }
    } else if (isLoadingMore) {
      // No posts returned when loading more = end of feed
      console.log('[EnhancedFeed] No posts returned during loadMore - end of feed');
      setReachedEnd(true);
    }
    
    // Mark as initialized after first data load
    if (!hasInitialized && !feedLoading) {
      setHasInitialized(true);
    }
    
    // Reset loading more flag
    setIsLoadingMore(false);
    isLoadingMoreRef.current = false;
    
  }, [feedData, feedLoading, isLoadingMore, itemsPerPage, hasInitialized]);
  
  // Properly use the image preloader hook at component level with stable dependency list
  const postsToPreload = useCallback(() => {
    return posts.slice(0, 5);
  }, [posts]);
  
  useImagePreloader(postsToPreload(), 5);
  
  // Handle infinite scrolling with improved debouncing logic
  useEffect(() => {
    // Only proceed if we should load more and aren't already loading
    if (
      isVisible && 
      !isLoadingMoreRef.current && 
      !feedLoading && 
      hasInitialized && 
      !reachedEnd && 
      posts.length > 0
    ) {
      // Use a ref to track loading state to prevent duplicate calls
      if (!isLoadingMoreRef.current) {
        console.log('[EnhancedFeed] IntersectionObserver triggered loadMorePosts');
        isLoadingMoreRef.current = true;
        loadMorePosts();
      }
    }
    
  }, [isVisible, feedLoading, hasInitialized, posts.length, reachedEnd]);
  
  // Load more posts function with improved cursor handling
  const loadMorePosts = async () => {
    // Extra protection against duplicate calls
    if (isLoadingMoreRef.current || isLoadingMore || reachedEnd || feedLoading) {
      console.log('[EnhancedFeed] Skipping loadMorePosts - already in progress or conditions not met');
      return;
    }
    
    if (posts.length === 0) {
      console.log('[EnhancedFeed] No posts to paginate from');
      isLoadingMoreRef.current = false;
      return;
    }
    
    // Set loading flags
    setIsLoadingMore(true);
    isLoadingMoreRef.current = true;
    
    console.log('[EnhancedFeed] Loading more posts - page', loadedPages + 1);
    
    try {
      // Get the last post's ID to use as cursor
      const lastPost = posts[posts.length - 1];
      const lastPostId = lastPost?.id;
      
      if (!lastPostId) {
        console.warn('[EnhancedFeed] No valid cursor found, cannot fetch more posts');
        setReachedEnd(true);
        return;
      }
      
      console.log('[EnhancedFeed] Using cursor:', lastPostId);
      
      // Create pagination parameters for the next page
      const nextPagination: SocialPaginationInput = {
        first: itemsPerPage,
        after: lastPostId
      };
      
      // Use fetchMore to get the next page
      const result = await fetchMore({
        pagination: nextPagination
      });
      
      console.log('[EnhancedFeed] fetchMore result:', result);
      
      // Check if we got valid data back
      const hasNewData = validateFetchMoreResult(result);
      
      if (hasNewData) {
        // Increment the loaded pages counter
        setLoadedPages(prev => prev + 1);
      } else {
        console.log('[EnhancedFeed] No more posts returned, end of feed reached');
        setReachedEnd(true);
      }
    } catch (error) {
      console.error('[EnhancedFeed] Error loading more posts:', error);
      toast.error("Couldn't load more posts. Please try again.");
    } finally {
      // Reset loading state
      setIsLoadingMore(false);
      // Small delay before allowing another load
      setTimeout(() => {
        isLoadingMoreRef.current = false;
      }, 300);
    }
  };
  
  // Helper function to validate the fetchMore result
  const validateFetchMoreResult = (result: any): boolean => {
    if (!result.data) return false;
    
    // Handle different data structures
    if (Array.isArray(result.data)) {
      return result.data.length > 0;
    } else if (result.data.edges && Array.isArray(result.data.edges)) {
      return result.data.edges.length > 0;
    } else if (result.data.feed) {
      if (Array.isArray(result.data.feed)) {
        return result.data.feed.length > 0;
      } else if (result.data.feed.edges && Array.isArray(result.data.feed.edges)) {
        return result.data.feed.edges.length > 0;
      }
    }
    
    return false;
  };
  
  // Handle retry for feed loading
  const handleRetryFeed = async () => {
    setIsRetrying(true);
    try {
      await refetchFeed();
    } catch (error) {
      console.error('Error retrying feed load:', error);
    } finally {
      setIsRetrying(false);
    }
  };
  
  // Handle refresh button click with properly reset state
  const handleRefreshFeed = async () => {
    // Reset all pagination state
    setPagination({
      first: itemsPerPage,
      after: undefined
    });
    
    // Clear posts to force a full refresh
    setPosts([]);
    
    // Reset pagination state
    setLoadedPages(1);
    setReachedEnd(false);
    isLoadingMoreRef.current = false;
    
    try {
      const refreshed = await refreshFeed();
      if (refreshed) {
        toast.success("Feed refreshed successfully");
      }
    } catch (error) {
      console.error('Error refreshing feed:', error);
      toast.error("Couldn't refresh feed. Please try again.");
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
        <div className="space-y-6">
          {/* Show posts */}
          {posts.length > 0 ? (
            posts.map(post => (
              <Post
                key={post.id}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                post={post as any}
                onPostUpdated={handlePostUpdated}
              />
            ))
          ) : (
            // Empty state
            !feedLoading && (
              <div className="p-8 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow">
                {emptyMessage}
              </div>
            )
          )}
          
          {/* "Load more" indicator */}
          {!reachedEnd && posts.length > 0 && (
            <div 
              ref={loadMoreRef} 
              className="py-4 text-center"
            >
              {isLoadingMore ? (
                <Spinner size="sm" label="Loading more posts..." />
              ) : (
                <Button
                  variant="outline"
                  onClick={loadMorePosts}
                  disabled={isLoadingMore || feedLoading}
                >
                  Load more
                </Button>
              )}
            </div>
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