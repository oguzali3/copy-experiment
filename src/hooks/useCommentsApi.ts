/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useCommentsApi.ts
import { useMutation, useQuery, ApolloError, gql } from '@apollo/client';
import {
  GET_POST_COMMENTS,
  GET_FEED // Add this import
} from '@/lib/graphql/operations/queries';
import {
  CREATE_COMMENT,
  UPDATE_COMMENT,
  DELETE_COMMENT,
  LIKE_COMMENT,
  UNLIKE_COMMENT
} from '@/lib/graphql/operations/mutations';
import { Comment, SocialPaginationInput, Post } from '@/lib/graphql/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// Define types for query responses
interface PostCommentsResponse {
  postComments: Comment[];
}

interface CreateCommentResponse {
  createComment: Comment;
}

interface UpdateCommentResponse {
  updateComment: Comment;
}

interface DeleteCommentResponse {
  deleteComment: boolean;
}

interface LikeCommentResponse {
  likeComment: Comment;
}

interface UnlikeCommentResponse {
  unlikeComment: Comment;
}

// Define the feed query response type
interface FeedResponse {
  feed: Post[];
}

// Define a proper interface for the post fragment
interface PostFragment {
  id: string;
  commentsCount: number;
  comments?: Comment[];
}


// Helper to ensure valid date strings
const ensureValidDateString = (value: any): string => {
  if (!value) return new Date().toISOString();
  
  if (typeof value === 'string') {
    try {
      const date = new Date(value);
      return !isNaN(date.getTime()) ? date.toISOString() : new Date().toISOString();
    } catch (e) {
      return new Date().toISOString();
    }
  }
  
  if (value instanceof Date) {
    return !isNaN(value.getTime()) ? value.toISOString() : new Date().toISOString();
  }
  
  return new Date().toISOString();
};

// Process a comment object to ensure it has valid dates
const processComment = (comment: any): any => {
  if (!comment) return comment;
  
  return {
    ...comment,
    createdAt: ensureValidDateString(comment.createdAt),
    updatedAt: comment.updatedAt ? ensureValidDateString(comment.updatedAt) : undefined
  };
};

// Process an array of comments
const processComments = (comments: any[]): any[] => {
  if (!comments || !Array.isArray(comments)) return [];
  return comments.map(processComment);
};

/**
 * Hook providing API operations for Comments
 */
export const useCommentsApi = () => {
  const { user } = useAuth();

  /**
   * Hook for fetching comments of a post
   */
  const usePostComments = (postId: string, pagination: SocialPaginationInput) => {
    const result = useQuery<PostCommentsResponse>(GET_POST_COMMENTS, {
      variables: { postId, pagination },
      skip: !postId,
      fetchPolicy: 'network-only',
      // Enhanced error handling
      onError: (error: ApolloError) => {
        console.error('Error fetching comments:', error);
        
        // Log additional details for debugging
        if (error.graphQLErrors?.length) {
          console.error('GraphQL errors:', error.graphQLErrors);
        }
        if (error.networkError) {
          console.error('Network error:', error.networkError);
        }
      },
      // Transform response to ensure valid dates
      onCompleted: (data) => {
        if (data?.postComments) {
          data.postComments = processComments(data.postComments);
        }
      }
    });

    // Provide a safe way to access the comments, even if there's an error
    const safeComments = result.data?.postComments 
      ? processComments(result.data.postComments) 
      : [];
    
    return {
      ...result,
      safeComments
    };
  };

  /**
   * Hook for creating comments with improved cache handling
   */
  const useCreateComment = () => {
    const [createCommentMutation, { loading }] = useMutation<CreateCommentResponse>(CREATE_COMMENT, {
      errorPolicy: 'all', // Important: Continue even if there are GraphQL errors
    });
  
    const createComment = async (input: { postId: string; content: string }) => {
      try {
        // Store the current date as an ISO string for consistency
        const timestamp = new Date().toISOString();
        
        // Define the optimistic response - NOTE: matching backend types
        const optimisticResponse = {
          __typename: 'Mutation',
          createComment: {
            __typename: 'CommentType', // IMPORTANT: Matches backend response
            id: `temp-${Date.now()}`,
            content: input.content,
            createdAt: timestamp,
            likesCount: 0,
            isLikedByMe: false,
            postId: input.postId,
            author: {
              __typename: 'UserType', // IMPORTANT: Matches backend response
              id: user?.id || 'current-user',
              displayName: user?.displayName || 'You',
              avatarUrl: user?.avatarUrl || null
            }
          }
        } as any; // Use 'any' type here to avoid TypeScript errors
        
        const { data, errors } = await createCommentMutation({
          variables: { input },
          optimisticResponse,
          update: (cache, { data }) => {
            if (!data?.createComment) return;
            
            try {
              // Process the comment to ensure valid dates
              const safeComment = processComment(data.createComment);
              
              // Make sure postId is included (important for cache)
              if (!safeComment.postId) {
                safeComment.postId = input.postId;
              }
              
              // Try to update the cache for post comments
              try {
                const existingData = cache.readQuery<PostCommentsResponse>({
                  query: GET_POST_COMMENTS,
                  variables: { 
                    postId: input.postId,
                    pagination: { first: 20 } 
                  }
                });
                
                if (existingData?.postComments) {
                  // Write back with the new comment added at the beginning
                  cache.writeQuery<PostCommentsResponse>({
                    query: GET_POST_COMMENTS,
                    variables: { 
                      postId: input.postId,
                      pagination: { first: 20 } 
                    },
                    data: {
                      postComments: [safeComment, ...existingData.postComments]
                    }
                  });
                }
              } catch (e) {
                console.log('Post comments cache update skipped:', e);
              }
              
              // Try to update the cache for the feed
              try {
                const feedData = cache.readQuery<FeedResponse>({
                  query: GET_FEED,
                  variables: { pagination: { first: 20 } }
                });
                
                if (feedData?.feed) {
                  // Find the post in the feed
                  const feedPosts = [...feedData.feed];
                  const postIndex = feedPosts.findIndex(post => post.id === input.postId);
                  
                  if (postIndex !== -1) {
                    // Update the post's commentsCount
                    const updatedPost = {
                      ...feedPosts[postIndex],
                      commentsCount: feedPosts[postIndex].commentsCount + 1
                    };
                    
                    // Only update comments array if it already exists on the post
                    if (feedPosts[postIndex].comments) {
                      updatedPost.comments = [safeComment, ...(feedPosts[postIndex].comments || [])];
                    }
                    
                    feedPosts[postIndex] = updatedPost;
                    
                    // Write the updated feed back to the cache
                    cache.writeQuery<FeedResponse>({
                      query: GET_FEED,
                      variables: { pagination: { first: 20 } },
                      data: { feed: feedPosts }
                    });
                  }
                }
              } catch (e) {
                console.log('Feed cache update skipped:', e);
              }
              
              // Also try to update the parent post fragment in cache
              try {
                const postId = input.postId;
                const postFragmentId = `Post:${postId}`;
                
                // Try to read the existing post from cache
                const existingPost = cache.readFragment<PostFragment>({
                  id: postFragmentId,
                  fragment: gql`
                    fragment PostWithCommentCount on Post {
                      id
                      commentsCount
                      comments {
                        id
                      }
                    }
                  `,
                });
                
                if (existingPost) {
                  // Update the post fragment
                  cache.writeFragment<PostFragment>({
                    id: postFragmentId,
                    fragment: gql`
                      fragment PostWithUpdatedCommentCount on Post {
                        id
                        commentsCount
                        comments
                      }
                    `,
                    data: {
                      id: existingPost.id,
                      commentsCount: existingPost.commentsCount + 1,
                      comments: existingPost.comments 
                        ? [safeComment, ...existingPost.comments]
                        : [safeComment]
                    }
                  });
                }
              } catch (e) {
                console.error('Post fragment update skipped:', e);
              }
            } catch (e) {
              console.error('Error in cache update function:', e);
            }
          }
        });
        
        // Handle GraphQL errors
        if (errors && errors.length > 0) {
          console.error('GraphQL errors in createComment:', errors);
          throw new Error(errors[0].message);
        }
        
        // If no data returned at all
        if (!data || !data.createComment) {
          throw new Error('No data returned from mutation');
        }
        
        // Process the comment to ensure valid dates
        const result = processComment(data.createComment);
        
        // Make sure postId is included
        if (!result.postId) {
          result.postId = input.postId;
        }
        
        console.log('Successfully created comment:', result);
        return result;
      } catch (error) {
        console.error('Error creating comment:', error);
        toast.error('Failed to post comment');
        throw error; // Re-throw to let component handle it
      }
    };
  
    return { createComment, loading };
  };

  /**
   * Hook for updating comments
   */
  const useUpdateComment = () => {
    const [updateCommentMutation, { loading }] = useMutation<UpdateCommentResponse>(UPDATE_COMMENT, {
      errorPolicy: 'all',
      update: (cache, { data }) => {
        if (!data?.updateComment) return;
        
        try {
          // Process the comment to ensure valid dates
          const safeComment = processComment(data.updateComment);
          
          // Update the comment in the cache for all relevant queries
          const commentId = safeComment.id;
          
          // Find all POST_COMMENTS queries that might have this comment
          const cacheIds = Object.keys(cache.extract())
            .filter(id => id.includes('postComments'));
          
          for (const cacheId of cacheIds) {
            try {
              // Try to parse the query to get the postId
              const query = JSON.parse(cacheId);
              if (query.variables && query.variables.postId) {
                const postId = query.variables.postId;
                
                // Read the current comments for this post
                const commentData = cache.readQuery<PostCommentsResponse>({
                  query: GET_POST_COMMENTS,
                  variables: { 
                    postId: postId, 
                    pagination: { first: 20 } 
                  }
                });
                
                if (commentData && commentData.postComments) {
                  // Check if this comment is in the result
                  const commentIndex = commentData.postComments.findIndex(c => c.id === commentId);
                  
                  if (commentIndex !== -1) {
                    // Create a new array with the updated comment
                    const updatedComments = [...commentData.postComments];
                    updatedComments[commentIndex] = {
                      ...updatedComments[commentIndex],
                      ...safeComment
                    };
                    
                    // Write back to cache
                    cache.writeQuery<PostCommentsResponse>({
                      query: GET_POST_COMMENTS,
                      variables: { 
                        postId: postId, 
                        pagination: { first: 20 } 
                      },
                      data: {
                        postComments: updatedComments
                      }
                    });
                  }
                }
              }
            } catch (e) {
              console.log(`Error updating comment in cache for ${cacheId}:`, e);
            }
          }
        } catch (e) {
          console.error('Error in update comment cache function:', e);
        }
      }
    });
  
    const updateComment = async (commentId: string, input: { content: string }) => {
        try {
          // Create optimistic response with all required fields
          const optimisticResponse = {
            __typename: 'Mutation',
            updateComment: {
              __typename: 'CommentType',
              id: commentId,
              content: input.content,
              createdAt: new Date().toISOString(),
              likesCount: 0, // We'll use a placeholder since we don't know the actual value
              isLikedByMe: false, // Placeholder
              author: {
                __typename: 'UserType',
                id: user?.id || 'unknown',
                displayName: user?.displayName || 'Unknown User',
                avatarUrl: user?.avatarUrl || null
              }
            }
          };
          
          const { data } = await updateCommentMutation({
            variables: { id: commentId, input },
            optimisticResponse
          });
          
          if (!data) throw new Error('No data returned from mutation');
          return processComment(data.updateComment);
        } catch (error) {
          console.error('Error updating comment:', error);
          toast.error('Failed to update comment');
          throw error;
        }
      };
  
    return { updateComment, loading };
  };

    /**
     * Hook for deleting comments
     */
    const useDeleteComment = () => {
        const [deleteCommentMutation, { loading }] = useMutation<DeleteCommentResponse>(
        DELETE_COMMENT,
        {
            update: (cache, { data }, { variables }) => {
            // Only proceed if the deletion was successful
            if (!data || !data.deleteComment || !variables?.id) return;
            
            const commentId = variables.id;
            
            try {
                // First, find any post references in the cache that contain this comment
                // We need to search the cache for any POST_COMMENTS query results
                const cacheIds = Object.keys(cache.extract())
                .filter(id => id.includes('Post:'));
                
                for (const cacheId of cacheIds) {
                // Extract post ID from cache ID
                const postId = cacheId.split(':')[1];
                if (!postId) continue;
                
                try {
                    // Try to find and update the post fragment
                    const postFragmentId = `Post:${postId}`;
                    const existingPost = cache.readFragment<PostFragment>({
                    id: postFragmentId,
                    fragment: gql`
                        fragment PostWithCommentCount on Post {
                        id
                        commentsCount
                        comments {
                            id
                        }
                        }
                    `,
                    });
                    
                    if (existingPost) {
                    // Check if this post contains the deleted comment
                    const hasComment = existingPost.comments?.some(c => c.id === commentId);
                    
                    if (hasComment || !existingPost.comments) {
                        // Update the comment count
                        cache.writeFragment({
                        id: postFragmentId,
                        fragment: gql`
                            fragment PostWithUpdatedCommentCount on Post {
                            id
                            commentsCount
                            }
                        `,
                        data: {
                            id: existingPost.id,
                            commentsCount: Math.max(0, existingPost.commentsCount - 1)
                        }
                        });
                        
                        // If the post has comments, update the list
                        if (existingPost.comments) {
                        cache.writeFragment({
                            id: postFragmentId,
                            fragment: gql`
                            fragment PostWithFilteredComments on Post {
                                id
                                comments
                            }
                            `,
                            data: {
                            id: existingPost.id,
                            comments: existingPost.comments.filter(c => c.id !== commentId)
                            }
                        });
                        }
                    }
                    }
                    
                    // Also try to update any GET_FEED queries
                    try {
                    const feedData = cache.readQuery<FeedResponse>({
                        query: GET_FEED,
                        variables: { pagination: { first: 20 } }
                    });
                    
                    if (feedData?.feed) {
                        // Find the post in the feed
                        const feedPosts = [...feedData.feed];
                        const postIndex = feedPosts.findIndex(post => post.id === postId);
                        
                        if (postIndex !== -1) {
                        // Only update if the post exists in the feed
                        const post = feedPosts[postIndex];
                        // Create updated post with decremented count
                        const updatedPost = {
                            ...post,
                            commentsCount: Math.max(0, post.commentsCount - 1)
                        };
                        
                        // If the post has comments, update them too
                        if (post.comments) {
                            updatedPost.comments = post.comments.filter(c => c.id !== commentId);
                        }
                        
                        // Replace the post in the feed
                        feedPosts[postIndex] = updatedPost;
                        
                        // Write the updated feed back to the cache
                        cache.writeQuery<FeedResponse>({
                            query: GET_FEED,
                            variables: { pagination: { first: 20 } },
                            data: { feed: feedPosts }
                        });
                        }
                    }
                    } catch (e) {
                    console.log('Feed cache update skipped:', e);
                    }
                } catch (e) {
                    console.error(`Error updating cache for post ${postId}:`, e);
                }
                }
                
                // Finally, evict the comment itself
                cache.evict({ id: `CommentType:${commentId}` });
                cache.gc();
            } catch (e) {
                console.error('Error in delete comment cache update:', e);
            }
            }
        }
        );
    
        const deleteComment = async (commentId: string) => {
        try {
            const { data } = await deleteCommentMutation({
            variables: { id: commentId }
            });
            
            if (data === undefined) {
            throw new Error('No data returned from mutation');
            }
            
            return data.deleteComment; // This is a boolean value
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.error('Failed to delete comment');
            throw error;
        }
        };
  
    return { deleteComment, loading };
  };

  /**
   * Hook for liking/unliking comments
   */
  const useLikeComment = () => {
    const [likeMutation, { loading: likeLoading }] = useMutation<LikeCommentResponse>(LIKE_COMMENT);
    const [unlikeMutation, { loading: unlikeLoading }] = useMutation<UnlikeCommentResponse>(UNLIKE_COMMENT);

    const toggleLike = async (commentId: string, isLiked: boolean) => {
      try {
        if (isLiked) {
          const { data } = await unlikeMutation({
            variables: { id: commentId }
          });
          
          if (!data) throw new Error('No data returned from mutation');
          return processComment(data.unlikeComment);
        } else {
          const { data } = await likeMutation({
            variables: { id: commentId }
          });
          
          if (!data) throw new Error('No data returned from mutation');
          return processComment(data.likeComment);
        }
      } catch (error) {
        console.error('Error toggling comment like:', error);
        toast.error('Failed to update like');
        throw error;
      }
    };

    return { 
      toggleLike, 
      loading: likeLoading || unlikeLoading 
    };
  };

  return {
    usePostComments,
    useCreateComment,
    useUpdateComment,
    useDeleteComment,
    useLikeComment
  };
};