/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useSearchApi.ts
import { useState, useCallback } from 'react';
import { gql, useLazyQuery } from '@apollo/client';

// Define the existing search queries
const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      id
      displayName
      avatarUrl
      isVerified
      isFollowing
      followersCount
      followingCount
    }
  }
`;

const SEARCH_POSTS = gql`
  query SearchPosts($query: String!) {
    searchPosts(query: $query) {
      id
      content
      imageUrl
      createdAt
      likesCount
      commentsCount
      isLikedByMe
      author {
        id
        displayName
        avatarUrl
        isVerified
      }
    }
  }
`;

const SEARCH_HASHTAGS = gql`
  query SearchHashtags($query: String!) {
    searchHashtags(query: $query) {
      tag
      count
    }
  }
`;

const SEARCH_TICKERS = gql`
  query SearchTickers($query: String!) {
    searchTickers(query: $query) {
      symbol
      name
      price
      change
      changePercent
    }
  }
`;

// Add the new combined search query
const COMBINED_SEARCH = gql`
  query CombinedSearch($query: String!, $limit: Int) {
    combinedSearch(query: $query, limit: $limit) {
      users {
        id
        displayName
        avatarUrl
        isVerified
        isFollowing
        followersCount
        followingCount
      }
      posts {
        id
        content
        imageUrl
        createdAt
        likesCount
        commentsCount
        isLikedByMe
        author {
          id
          displayName
          avatarUrl
          isVerified
        }
      }
      hashtags {
        tag
        count
      }
      tickers {
        symbol
        name
        price
        change
        changePercent
      }
      hasMoreResults
    }
  }
`;

/**
 * Enhanced hook providing API operations for search functionality
 * with support for combined search
 */
export const useSearchApi = () => {
  // Initialize state
  const [data, setData] = useState<{
    users: any[];
    posts: any[];
    hashtags: any[];
    tickers: any[];
    hasMoreResults: boolean;
  }>({
    users: [],
    posts: [],
    hashtags: [],
    tickers: [],
    hasMoreResults: false,
  });
  
  const [loading, setLoading] = useState({
    users: false,
    posts: false,
    hashtags: false,
    tickers: false,
    combined: false,
    any: false,
  });

  // Set up lazy queries
  const [searchUsersQuery] = useLazyQuery(SEARCH_USERS, {
    onCompleted: (result) => {
      setData((prev) => ({ ...prev, users: result.searchUsers }));
      setLoading((prev) => ({ ...prev, users: false, any: prev.posts || prev.hashtags || prev.tickers || prev.combined }));
    },
    onError: (error) => {
      console.error('Error searching users:', error);
      setLoading((prev) => ({ ...prev, users: false, any: prev.posts || prev.hashtags || prev.tickers || prev.combined }));
    },
  });

  const [searchPostsQuery] = useLazyQuery(SEARCH_POSTS, {
    onCompleted: (result) => {
      setData((prev) => ({ ...prev, posts: result.searchPosts }));
      setLoading((prev) => ({ ...prev, posts: false, any: prev.users || prev.hashtags || prev.tickers || prev.combined }));
    },
    onError: (error) => {
      console.error('Error searching posts:', error);
      setLoading((prev) => ({ ...prev, posts: false, any: prev.users || prev.hashtags || prev.tickers || prev.combined }));
    },
  });

  const [searchHashtagsQuery] = useLazyQuery(SEARCH_HASHTAGS, {
    onCompleted: (result) => {
      setData((prev) => ({ ...prev, hashtags: result.searchHashtags }));
      setLoading((prev) => ({ ...prev, hashtags: false, any: prev.users || prev.posts || prev.tickers || prev.combined }));
    },
    onError: (error) => {
      console.error('Error searching hashtags:', error);
      setLoading((prev) => ({ ...prev, hashtags: false, any: prev.users || prev.posts || prev.tickers || prev.combined }));
    },
  });

  const [searchTickersQuery] = useLazyQuery(SEARCH_TICKERS, {
    onCompleted: (result) => {
      setData((prev) => ({ ...prev, tickers: result.searchTickers }));
      setLoading((prev) => ({ ...prev, tickers: false, any: prev.users || prev.posts || prev.hashtags || prev.combined }));
    },
    onError: (error) => {
      console.error('Error searching tickers:', error);
      setLoading((prev) => ({ ...prev, tickers: false, any: prev.users || prev.posts || prev.hashtags || prev.combined }));
    },
  });

  // Add combined search query
  const [combinedSearchQuery] = useLazyQuery(COMBINED_SEARCH, {
    onCompleted: (result) => {
      setData({
        users: result.combinedSearch.users,
        posts: result.combinedSearch.posts,
        hashtags: result.combinedSearch.hashtags,
        tickers: result.combinedSearch.tickers,
        hasMoreResults: result.combinedSearch.hasMoreResults,
      });
      setLoading((prev) => ({ ...prev, combined: false, any: false }));
    },
    onError: (error) => {
      console.error('Error in combined search:', error);
      setLoading((prev) => ({ ...prev, combined: false, any: false }));
    },
  });

  // Define search functions
  const searchUsers = useCallback(
    async (query: string) => {
      if (!query.trim()) return { users: [] };
      
      setLoading((prev) => ({ ...prev, users: true, any: true }));
      
      try {
        await searchUsersQuery({ variables: { query } });
        return { users: data.users };
      } catch (error) {
        console.error('Error searching users:', error);
        return { users: [] };
      }
    },
    [searchUsersQuery, data.users]
  );

  const searchPosts = useCallback(
    async (query: string) => {
      if (!query.trim()) return { posts: [] };
      
      setLoading((prev) => ({ ...prev, posts: true, any: true }));
      
      try {
        await searchPostsQuery({ variables: { query } });
        return { posts: data.posts };
      } catch (error) {
        console.error('Error searching posts:', error);
        return { posts: [] };
      }
    },
    [searchPostsQuery, data.posts]
  );

  const searchHashtags = useCallback(
    async (query: string) => {
      if (!query.trim()) return { hashtags: [] };
      
      setLoading((prev) => ({ ...prev, hashtags: true, any: true }));
      
      try {
        await searchHashtagsQuery({ variables: { query } });
        return { hashtags: data.hashtags };
      } catch (error) {
        console.error('Error searching hashtags:', error);
        return { hashtags: [] };
      }
    },
    [searchHashtagsQuery, data.hashtags]
  );

  const searchTickers = useCallback(
    async (query: string) => {
      if (!query.trim()) return { tickers: [] };
      
      setLoading((prev) => ({ ...prev, tickers: true, any: true }));
      
      try {
        await searchTickersQuery({ variables: { query } });
        return { tickers: data.tickers };
      } catch (error) {
        console.error('Error searching tickers:', error);
        return { tickers: [] };
      }
    },
    [searchTickersQuery, data.tickers]
  );

  // Add combined search function
  const combinedSearch = useCallback(
    async (query: string, limit?: number) => {
      if (!query.trim()) {
        return {
          users: [],
          posts: [],
          hashtags: [],
          tickers: [],
          hasMoreResults: false,
        };
      }
      
      setLoading((prev) => ({ ...prev, combined: true, any: true }));
      
      try {
        await combinedSearchQuery({ variables: { query, limit } });
        return data;
      } catch (error) {
        console.error('Error in combined search:', error);
        return {
          users: [],
          posts: [],
          hashtags: [],
          tickers: [],
          hasMoreResults: false,
        };
      }
    },
    [combinedSearchQuery, data]
  );
  

  // Execute all searches in parallel
  const searchAll = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        return {
          users: [],
          posts: [],
          hashtags: [],
          tickers: [],
        };
      }

      setLoading({
        users: true,
        posts: true,
        hashtags: true,
        tickers: true,
        combined: false,
        any: true,
      });

      try {
        // Execute queries in parallel
        await Promise.all([
          searchUsersQuery({ variables: { query } }),
          searchPostsQuery({ variables: { query } }),
          searchHashtagsQuery({ variables: { query } }),
          searchTickersQuery({ variables: { query } }),
        ]);
        
        return data;
      } catch (error) {
        console.error('Error performing search:', error);
        return {
          users: [],
          posts: [],
          hashtags: [],
          tickers: [],
        };
      }
    },
    [searchUsersQuery, searchPostsQuery, searchHashtagsQuery, searchTickersQuery, data]
  );

  return {
    searchUsers,
    searchPosts,
    searchHashtags,
    searchTickers,
    searchAll,
    combinedSearch,
    loading,
    data,
  };
};