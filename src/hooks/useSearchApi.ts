// src/hooks/useSearchApi.ts
import { useLazyQuery } from '@apollo/client';
import {
  SEARCH_USERS,
  SEARCH_POSTS,
  SEARCH_HASHTAGS,
  SEARCH_TICKERS
} from '@/lib/graphql/operations/search';
import { useCallback } from 'react';

/**
 * Hook providing API operations for search functionality
 */
export const useSearchApi = () => {
  // Lazy queries for on-demand searching
  const [searchUsersQuery, { loading: usersLoading, data: usersData }] = useLazyQuery(SEARCH_USERS);
  const [searchPostsQuery, { loading: postsLoading, data: postsData }] = useLazyQuery(SEARCH_POSTS);
  const [searchHashtagsQuery, { loading: hashtagsLoading, data: hashtagsData }] = useLazyQuery(SEARCH_HASHTAGS);
  const [searchTickersQuery, { loading: tickersLoading, data: tickersData }] = useLazyQuery(SEARCH_TICKERS);

  /**
   * Search users by query
   */
  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) return { users: [] };
    
    try {
      const { data } = await searchUsersQuery({ variables: { query } });
      return { users: data?.searchUsers || [] };
    } catch (error) {
      console.error('Error searching users:', error);
      return { users: [] };
    }
  }, [searchUsersQuery]);

  /**
   * Search posts by query
   */
  const searchPosts = useCallback(async (query: string) => {
    if (!query.trim()) return { posts: [] };
    
    try {
      const { data } = await searchPostsQuery({ variables: { query } });
      return { posts: data?.searchPosts || [] };
    } catch (error) {
      console.error('Error searching posts:', error);
      return { posts: [] };
    }
  }, [searchPostsQuery]);

  /**
   * Search hashtags by query
   */
  const searchHashtags = useCallback(async (query: string) => {
    if (!query.trim() || !query.startsWith('#')) return { hashtags: [] };
    
    try {
      const { data } = await searchHashtagsQuery({ variables: { query } });
      return { hashtags: data?.searchHashtags || [] };
    } catch (error) {
      console.error('Error searching hashtags:', error);
      return { hashtags: [] };
    }
  }, [searchHashtagsQuery]);

  /**
   * Search tickers by query
   */
  const searchTickers = useCallback(async (query: string) => {
    if (!query.trim() || !query.startsWith('$')) return { tickers: [] };
    
    try {
      const { data } = await searchTickersQuery({ variables: { query } });
      return { tickers: data?.searchTickers || [] };
    } catch (error) {
      console.error('Error searching tickers:', error);
      return { tickers: [] };
    }
  }, [searchTickersQuery]);

  /**
   * Perform a combined search across all entities
   */
  const searchAll = useCallback(async (query: string) => {
    if (!query.trim()) {
      return {
        users: [],
        posts: [],
        hashtags: [],
        tickers: []
      };
    }

    const isHashtag = query.startsWith('#');
    const isTicker = query.startsWith('$');

    try {
      // Execute queries in parallel for better performance
      const promises = [];
      
      // Always search users and posts
      promises.push(searchUsersQuery({ variables: { query } }));
      promises.push(searchPostsQuery({ variables: { query } }));
      
      // Only search hashtags if query starts with #
      if (isHashtag) {
        promises.push(searchHashtagsQuery({ variables: { query } }));
      }
      
      // Only search tickers if query starts with $
      if (isTicker) {
        promises.push(searchTickersQuery({ variables: { query } }));
      }
      
      await Promise.all(promises);
      
      return {
        users: usersData?.searchUsers || [],
        posts: postsData?.searchPosts || [],
        hashtags: isHashtag ? (hashtagsData?.searchHashtags || []) : [],
        tickers: isTicker ? (tickersData?.searchTickers || []) : []
      };
    } catch (error) {
      console.error('Error performing search:', error);
      return {
        users: [],
        posts: [],
        hashtags: [],
        tickers: []
      };
    }
  }, [
    searchUsersQuery,
    searchPostsQuery,
    searchHashtagsQuery,
    searchTickersQuery,
    usersData,
    postsData,
    hashtagsData,
    tickersData
  ]);

  return {
    searchUsers,
    searchPosts,
    searchHashtags,
    searchTickers,
    searchAll,
    loading: {
      users: usersLoading,
      posts: postsLoading,
      hashtags: hashtagsLoading,
      tickers: tickersLoading,
      any: usersLoading || postsLoading || hashtagsLoading || tickersLoading
    },
    data: {
      users: usersData?.searchUsers || [],
      posts: postsData?.searchPosts || [],
      hashtags: hashtagsData?.searchHashtags || [],
      tickers: tickersData?.searchTickers || []
    }
  };
};