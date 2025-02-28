// src/components/social/UserActivityFeed.tsx
import React, { useState, useEffect } from 'react';
import { useActivityApi } from '@/hooks/useActivityApi';
import { Post } from '@/components/social/Post';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

const UserActivityFeed = () => {
  const [page, setPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const { useActivity } = useActivityApi();
  
  const { data, loading, error, fetchMore, refetch } = useActivity({ 
    first: 10, 
    after: null 
  });
  
  // Set error message if there's a GraphQL error
  useEffect(() => {
    if (error) {
      console.error('Activity feed error:', error);
      setErrorMessage('Error loading your activity feed');
    } else {
      setErrorMessage(null);
    }
  }, [error]);
  
  const loadMore = () => {
    if (data?.userActivity?.length) {
      const lastPostId = data.userActivity[data.userActivity.length - 1].id;
      
      try {
        fetchMore({
          variables: {
            pagination: {
              first: 10,
              after: lastPostId
            }
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            
            return {
              userActivity: [
                ...prev.userActivity,
                ...fetchMoreResult.userActivity
              ]
            };
          }
        });
        
        setPage(page + 1);
      } catch (fetchError) {
        console.error('Error loading more posts:', fetchError);
        setErrorMessage('Error loading more posts. Please try again.');
      }
    }
  };
  
  // Handler for when a post is updated (liked, commented, etc.)
  const handlePostUpdated = () => {
    // Refetch the activity data to get the latest comments
    try {
      refetch({
        pagination: {
          first: 10 * page, // Fetch all current pages
          after: null
        }
      });
    } catch (refetchError) {
      console.error('Error refreshing feed:', refetchError);
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    setErrorMessage(null);
    
    refetch()
      .then(() => {
        setIsRetrying(false);
      })
      .catch(error => {
        console.error('Error retrying feed fetch:', error);
        setErrorMessage('Still having trouble loading your activity');
        setIsRetrying(false);
      });
  };
  
  if (loading && page === 1 && !isRetrying) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-pulse">Loading your activity...</div>
      </div>
    );
  }
  
  // Show error with retry button
  if (errorMessage && !data?.userActivity?.length) {
    return (
      <Card className="p-6 bg-red-50 dark:bg-red-900/10 my-4">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-3">
          <AlertCircle size={20} />
          <h3 className="font-semibold">Error Loading Activity</h3>
        </div>
        <p className="text-red-700 dark:text-red-400 mb-4">{errorMessage}</p>
        <Button 
          onClick={handleRetry} 
          variant="outline" 
          className="bg-white dark:bg-transparent"
          disabled={isRetrying}
        >
          {isRetrying ? (
            <>
              <RefreshCw size={16} className="mr-2 animate-spin" />
              Retrying...
            </>
          ) : (
            'Retry'
          )}
        </Button>
      </Card>
    );
  }
  
  const noActivity = !loading && (!data?.userActivity || data.userActivity.length === 0);
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Your Activity</h2>
      
      {noActivity ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-300">You haven't posted or commented yet.</p>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Create your first post or comment to see your activity here.</p>
        </div>
      ) : (
        <>
          {/* Error banner that appears above posts if there was an error but we still have data */}
          {errorMessage && data?.userActivity?.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-md mb-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  {errorMessage}. Showing available activity.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry} 
                  disabled={isRetrying}
                  className="text-xs bg-white dark:bg-transparent"
                >
                  {isRetrying ? "Retrying..." : "Refresh"}
                </Button>
              </div>
            </div>
          )}
        
          <div className="space-y-6">
            {data?.userActivity?.map(post => (
              <Post 
                key={post.id}
                post={post}
                onPostUpdated={handlePostUpdated}
                alwaysShowComments={true}
              />
            ))}
          </div>
          
          {data?.userActivity?.length > 0 && (
            <div className="my-6 text-center">
              {loading && page > 1 ? (
                <div className="animate-pulse">Loading more...</div>
              ) : (
                <Button
                  onClick={loadMore}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Load More
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserActivityFeed;