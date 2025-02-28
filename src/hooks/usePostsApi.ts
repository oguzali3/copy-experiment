// src/hooks/usePostsApi.ts
import { useQuery, useMutation, gql } from '@apollo/client';
import { GET_FEED, GET_POST } from '@/lib/graphql/operations/queries';
import { 
  CREATE_POST, 
  UPDATE_POST, 
  LIKE_POST, 
  UNLIKE_POST 
} from '@/lib/graphql/operations/mutations';
import { 
  Post, 
  SocialPaginationInput, 
  CreatePostInput, 
  UpdatePostInput
} from '@/lib/graphql/types';
import { toast } from 'sonner';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export const usePostsApi = () => {
  // Use our new error handler
  const { handleError } = useErrorHandler();

  // Query hooks
  const useFeed = (pagination: SocialPaginationInput) => {
    const result = useQuery<{ feed: Post[] }>(GET_FEED, {
      variables: { pagination },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-and-network',
      onError: (error) => handleError(error, 'network', {
        context: 'loading feed',
        retry: () => result.refetch(),
      }),
    });
    
    return result;
  };

  const usePost = (id: string) => {
    return useQuery<{ post: Post }>(GET_POST, {
      variables: { id },
      skip: !id,
      onError: (error) => handleError(error, 'data', {
        context: `loading post ${id}`,
      }),
    });
  };

  // Mutation hooks
  const useCreatePost = () => {
    const [createPostMutation, { loading }] = useMutation<
      { createPost: Post },
      { input: CreatePostInput }
    >(CREATE_POST, {
      update: (cache, { data }) => {
        if (!data?.createPost) return;
        
        try {
          // Update feed cache with the new post
          const existingFeed = cache.readQuery<{ feed: Post[] }>({
            query: GET_FEED,
            variables: { pagination: { first: 10 } },
          });

          if (existingFeed) {
            cache.writeQuery({
              query: GET_FEED,
              variables: { pagination: { first: 10 } },
              data: {
                feed: [data.createPost, ...existingFeed.feed],
              },
            });
          }
        } catch (error) {
          handleError(error, 'data', {
            context: 'updating cache after post creation',
            silent: true // Don't show to the user since the post was actually created
          });
        }
      },
    });

    const createPost = async (variables: { variables: { input: CreatePostInput } }) => {
      try {
        const result = await createPostMutation(variables);
        toast.success('Post created successfully');
        return result.data?.createPost;
      } catch (error) {
        return handleError(error, 'action', {
          context: 'creating post',
          fallback: null
        });
      }
    };

    return { createPost, loading };
  };

  const useUpdatePost = () => {
    const [updatePostMutation, { loading }] = useMutation(UPDATE_POST);

    const updatePost = async (id: string, input: UpdatePostInput) => {
      try {
        const { data } = await updatePostMutation({ variables: { id, input } });
        toast.success('Post updated successfully');
        return data?.updatePost;
      } catch (error) {
        return handleError(error, 'action', {
          context: `updating post ${id}`,
          fallback: null
        });
      }
    };

    return { updatePost, loading };
  };

  /**
   * Hook for liking/unliking posts
   */
  const useLikePost = () => {
    const [likeMutation, { loading: likeLoading }] = useMutation(LIKE_POST);
    const [unlikeMutation, { loading: unlikeLoading }] = useMutation(UNLIKE_POST);

    const toggleLike = async (id: string, isLiked: boolean) => {
      try {
        if (isLiked) {
          await unlikeMutation({
            variables: { id }
          });
        } else {
          await likeMutation({
            variables: { id }
          });
        }
        return true;
      } catch (error) {
        handleError(error, 'action', {
          context: `${isLiked ? 'unliking' : 'liking'} post`,
          silent: true // Silent because this is usually handled in the UI with optimistic updates
        });
        return false;
      }
    };

    return { 
      toggleLike, 
      loading: likeLoading || unlikeLoading 
    };
  };

  return {
    useFeed,
    usePost,
    useCreatePost,
    useUpdatePost,
    useLikePost,
  };
};