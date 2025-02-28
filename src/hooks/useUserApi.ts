// src/hooks/useUserApi.ts
import { useMutation, useQuery, gql } from '@apollo/client';
import {
  GET_USER_PROFILE,
  GET_FOLLOWERS,
  GET_FOLLOWING,
  GET_SUGGESTED_USERS,
} from '@/lib/graphql/operations/queries';
import {
  FOLLOW_USER,
  UNFOLLOW_USER,
} from '@/lib/graphql/operations/mutations';
import { SocialPaginationInput } from '@/lib/graphql/types';
import { toast } from 'sonner';

interface FollowUserResponse {
  followUser: boolean;
}

interface UnfollowUserResponse {
  unfollowUser: boolean;
}
/**
 * Hook providing API operations for User-related data
 */
export const useUserApi = () => {
  /**
   * Hook for fetching user profile
   */
  const useUserProfile = (userId: string) => {
    return useQuery(GET_USER_PROFILE, {
      variables: { id: userId },
      skip: !userId,
      fetchPolicy: 'network-only',
      onError: (error) => {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load profile');
      }
    });
  };

  /**
   * Hook for fetching user followers
   */
  const useUserFollowers = (userId: string, pagination: SocialPaginationInput) => {
    return useQuery(GET_FOLLOWERS, {
      variables: { userId, pagination },
      skip: !userId,
      fetchPolicy: 'network-only',
      onError: (error) => {
        console.error('Error fetching followers:', error);
        toast.error('Failed to load followers');
      }
    });
  };

  /**
   * Hook for fetching users being followed
   */
  const useUserFollowing = (userId: string, pagination: SocialPaginationInput) => {
    return useQuery(GET_FOLLOWING, {
      variables: { userId, pagination },
      skip: !userId,
      fetchPolicy: 'network-only',
      onError: (error) => {
        console.error('Error fetching following:', error);
        toast.error('Failed to load following users');
      }
    });
  };

  /**
   * Hook for fetching suggested users to follow
   */
  const useSuggestedUsers = (limit: number = 10) => {
    return useQuery(GET_SUGGESTED_USERS, {
      variables: { limit },
      fetchPolicy: 'network-only',
      onError: (error) => {
        console.error('Error fetching suggested users:', error);
      }
    });
  };

/**
 * Hook for following/unfollowing users
 */
const useFollowUser = () => {
  const [followMutation, { loading: followLoading }] = useMutation<FollowUserResponse>(FOLLOW_USER);
  const [unfollowMutation, { loading: unfollowLoading }] = useMutation<UnfollowUserResponse>(UNFOLLOW_USER);

  // Define fragment for cache updates to avoid repeating the fragment
  const USER_FOLLOW_STATUS_FRAGMENT = gql`
    fragment UserFollowStatus on UserType {
      id
      isFollowing
    }
  `;

  // Define type for cache reference
  interface UserRef {
    __ref: string;
  }

  // Define type for user fragment result
  interface UserFollowStatus {
    id: string;
    isFollowing: boolean;
  }

  const toggleFollow = async (userId: string, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        await unfollowMutation({
          variables: { userId },
          update: (cache) => {
            // We need to update any queries that might include this user's follow status
            cache.modify({
              fields: {
                getSuggestedUsers: (existingUsers: ReadonlyArray<UserRef> = []) => {
                  return existingUsers.map((userRef: UserRef) => {
                    const user = cache.readFragment<UserFollowStatus>({
                      id: userRef.__ref,
                      fragment: USER_FOLLOW_STATUS_FRAGMENT
                    });
                    
                    if (user && user.id === userId) {
                      return {
                        ...userRef,
                        isFollowing: false
                      };
                    }
                    return userRef;
                  });
                }
              }
            });
          }
        });
        return true;
      } else {
        await followMutation({
          variables: { userId },
          update: (cache) => {
            // Similarly update for follow
            cache.modify({
              fields: {
                getSuggestedUsers: (existingUsers: ReadonlyArray<UserRef> = []) => {
                  return existingUsers.map((userRef: UserRef) => {
                    const user = cache.readFragment<UserFollowStatus>({
                      id: userRef.__ref,
                      fragment: USER_FOLLOW_STATUS_FRAGMENT
                    });
                    
                    if (user && user.id === userId) {
                      return {
                        ...userRef,
                        isFollowing: true
                      };
                    }
                    return userRef;
                  });
                }
              }
            });
          }
        });
        return true;
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
      throw error;
    }
  };

  return { 
    toggleFollow, 
    loading: followLoading || unfollowLoading 
  };
};

  return {
    useUserProfile,
    useUserFollowers,
    useUserFollowing,
    useSuggestedUsers,
    useFollowUser
  };
};