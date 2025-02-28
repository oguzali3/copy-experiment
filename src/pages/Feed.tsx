// src/pages/Feed.tsx
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Post } from "@/components/social/Post";
import { CreatePost } from "@/components/social/CreatePost";
import { SocialSidebar } from "@/components/social/SocialSidebar";
import { SocialHeader } from "@/components/social/SocialHeader";
import { WhoToFollow } from "@/components/social/WhoToFollow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { usePostsApi } from "@/hooks/usePostsApi";
import { Post as PostType, User as UserType } from "@/lib/graphql/types";
import { useQuery } from "@apollo/client";
import { SEARCH_USERS, SEARCH_POSTS } from "@/lib/graphql/operations/search";
import { useImagePreloader } from '@/hooks/useImagePreloader';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from "@/components/ui/button";
import { Spinner, Skeleton, LoadingState, RetryMessage } from "@/components/ui/loaders";
import { useErrorHandler } from "@/hooks/useErrorHandler";

// Extended PostType interface to include imageVariants
interface ExtendedPostType extends PostType {
  imageVariants?: {
    original: string;
    thumbnail: string;
    medium: string;
    optimized: string;
  };
}

const Feed = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q");
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [posts, setPosts] = useState<ExtendedPostType[]>([]);
  const [profiles, setProfiles] = useState<UserType[]>([]);
  const { handleError } = useErrorHandler();

  // Use GraphQL hooks for feed data
  const { useFeed } = usePostsApi();
  
  // Default pagination for feed
  const [pagination, setPagination] = useState({ first: 10 });
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Ref for infinite scrolling
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Create intersection observer for infinite scrolling
  const { isVisible } = useIntersectionObserver(
    loadMoreRef,
    {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    }
  );
  
  // Preload images for better UX
  useImagePreloader(posts, 5);
  
  // Load feed posts using GraphQL with proper policy
  const { 
    loading: feedLoading, 
    error: feedQueryError,
    data: feedData, 
    fetchMore,
    refetch: refetchFeed 
  } = useFeed(pagination);

  // Update error state when feed query fails
  useEffect(() => {
    if (feedQueryError) {
      setFeedError(feedQueryError);
      handleError(feedQueryError, 'data', {
        context: 'loading feed',
        silent: true // We'll handle UI display ourselves
      });
    } else {
      setFeedError(null);
    }
  }, [feedQueryError, handleError]);

  // Search queries using GraphQL
  const { loading: profileSearchLoading, data: profileSearchData } = useQuery(SEARCH_USERS, {
    variables: { query: searchQuery || "" },
    skip: !searchQuery,
    fetchPolicy: 'network-only',
    onError: (error) => handleError(error, 'data', {
      context: 'searching users',
    })
  });

  const { loading: postSearchLoading, data: postSearchData } = useQuery(SEARCH_POSTS, {
    variables: { query: searchQuery || "" },
    skip: !searchQuery,
    fetchPolicy: 'network-only',
    onError: (error) => handleError(error, 'data', {
      context: 'searching posts',
    })
  });

  // Handle infinite scrolling
  useEffect(() => {
    if (isVisible && hasMore && !isLoadingMore && !feedLoading && !searchQuery && !feedError) {
      loadMorePosts();
    }
  }, [isVisible, hasMore, isLoadingMore, feedLoading, searchQuery, feedError]);

  // Load more posts function
  const loadMorePosts = async () => {
    if (!feedData?.feed || feedData.feed.length === 0) return;
    
    setIsLoadingMore(true);
    
    try {
      const lastPost = feedData.feed[feedData.feed.length - 1];
      const result = await fetchMore({
        variables: {
          pagination: {
            first: pagination.first,
            after: lastPost.id
          }
        }
      });
      
      // Check if we have more posts to load
      if (result.data.feed.length < pagination.first) {
        setHasMore(false);
      }
    } catch (error) {
      handleError(error, 'data', {
        context: 'loading more posts',
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handle retry for feed loading
  const handleRetryFeed = async () => {
    setIsRetrying(true);
    try {
      await refetchFeed();
      setFeedError(null);
    } catch (error) {
      handleError(error, 'data', {
        context: 'retrying feed load',
      });
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      // Reset pagination when searching
      setHasMore(true);
    } else {
      setIsSearching(false);
      // Reset profiles when not searching
      setProfiles([]);
    }
  }, [searchQuery]);

  // Update profiles data when search results change
  useEffect(() => {
    if (profileSearchData?.searchUsers) {
      setProfiles(profileSearchData.searchUsers);
    }
  }, [profileSearchData]);

  // Update posts when feed or search results change
  useEffect(() => {
    if (searchQuery && postSearchData?.searchPosts) {
      setPosts(postSearchData.searchPosts as ExtendedPostType[]);
    } else if (!searchQuery && feedData?.feed) {
      setPosts(feedData.feed as ExtendedPostType[]);
    }
  }, [feedData, postSearchData, searchQuery]);

  const handleProfileClick = (userId: string) => {
    navigate(`/profile?id=${userId}`);
  };

  const handlePostUpdated = () => {
    // Make sure the feed gets the latest data with network policy
    refetchFeed({
      fetchPolicy: 'network-only'
    });
  };

  // Redirect to sign in if not authenticated
  if (!authLoading && !isAuthenticated) {
    navigate('/signin');
    return null;
  }

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Spinner size="lg" label="Loading your account..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="fixed left-0 top-0 h-full w-[68px] border-r border-gray-200 dark:border-gray-800">
        <SocialSidebar />
      </div>
      
      <div className="fixed left-1/2 transform -translate-x-1/2" style={{
        width: '680px',
        marginLeft: '34px'
      }}>
        <div className="border-x border-gray-200 dark:border-gray-800 h-screen flex flex-col bg-white dark:bg-gray-900">
          <SocialHeader />
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-4 space-y-4">
              {!searchQuery && <CreatePost onPostCreated={handlePostUpdated} />}
              
              {searchQuery && (
                <h2 className="text-xl font-semibold px-4 py-2">
                  {searchQuery.startsWith('$') 
                    ? `Posts mentioning ${searchQuery}`
                    : `Search results for "${searchQuery}"`}
                </h2>
              )}

              {/* Feed Error State */}
              {feedError && !isSearching && (
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
                loading={(feedLoading || profileSearchLoading || postSearchLoading) && posts.length === 0}
                spinnerLabel={isSearching ? "Searching..." : "Loading your feed..."}
                fallback={
                  <div className="space-y-4">
                    <Skeleton variant="feed-post" count={3} />
                  </div>
                }
              >
                <div className="space-y-6">
                  {/* Show profiles section if there are matching profiles */}
                  {searchQuery && profiles.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                      <div className="p-4 border-b dark:border-gray-700">
                        <h2 className="text-xl font-semibold">People</h2>
                      </div>
                      <div className="divide-y dark:divide-gray-700">
                        {profiles.map((profile) => (
                          <button
                            key={profile.id}
                            className="flex items-center gap-3 w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                            onClick={() => handleProfileClick(profile.id)}
                          >
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={profile.avatarUrl || undefined} />
                              <AvatarFallback>
                                <User className="w-6 h-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">{profile.displayName}</div>
                              <div className="text-sm text-gray-500">@{profile.displayName}</div>
                              {profile.bio && (
                                <div className="text-sm text-gray-600 mt-1">{profile.bio}</div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show posts section */}
                  {searchQuery && posts.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Posts</h2>
                      {posts.map(post => (
                        <Post
                          key={post.id}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          post={post as any}
                          onPostUpdated={handlePostUpdated}
                        />
                      ))}
                    </div>
                  )}

                  {/* Show regular feed if no search query */}
                  {!searchQuery && posts.map(post => (
                    <Post
                      key={post.id}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      post={post as any}
                      onPostUpdated={handlePostUpdated}
                    />
                  ))}

                  {/* "Load more" button or indicator */}
                  {!searchQuery && hasMore && (
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
                          disabled={isLoadingMore}
                        >
                          Load more
                        </Button>
                      )}
                    </div>
                  )}

                  {/* No results message */}
                  {searchQuery && profiles.length === 0 && posts.length === 0 && 
                   !profileSearchLoading && !postSearchLoading && (
                    <div className="p-8 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              </LoadingState>
            </div>
          </div>
        </div>
      </div>
      
      <div className="fixed right-0 top-0 w-[320px] h-full p-4">
        <WhoToFollow />
      </div>
    </div>
  );
};

export default Feed;