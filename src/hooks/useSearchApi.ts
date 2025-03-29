/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useSearchApi.ts
import { useState, useCallback } from 'react';
import { gql, useLazyQuery } from '@apollo/client';

// Define the existing search queries
const SEARCH_USERS = gql`
  query SearchUsers($query: String!, $limit: Int) {
    searchUsers(query: $query, limit: $limit) {
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
  query SearchPosts($query: String!, $limit: Int) {
    searchPosts(query: $query, limit: $limit) {
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
  query SearchHashtags($query: String!, $limit: Int) {
    searchHashtags(query: $query, limit: $limit) {
      tag
      count
    }
  }
`;

const SEARCH_TICKERS = gql`
  query SearchTickers($query: String!, $limit: Int) {
    searchTickers(query: $query, limit: $limit) {
      symbol
      name
      price
      change
      changePercent
    }
  }
`;

// Add the combined search query
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

// Define pagination query for full search results
const PAGINATED_SEARCH_USERS = gql`
  query PaginatedSearchUsers($query: String!, $page: Int!, $pageSize: Int!) {
    paginatedSearchUsers(query: $query, page: $page, pageSize: $pageSize) {
      users {
        id
        displayName
        avatarUrl
        isVerified
        isFollowing
        followersCount
        followingCount
      }
      pagination {
        totalCount
        totalPages
        currentPage
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

const PAGINATED_SEARCH_POSTS = gql`
  query PaginatedSearchPosts($query: String!, $page: Int!, $pageSize: Int!) {
    paginatedSearchPosts(query: $query, page: $page, pageSize: $pageSize) {
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
      pagination {
        totalCount
        totalPages
        currentPage
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

/**
 * Enhanced hook providing API operations for search functionality
 * with support for combined search and pagination
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
  
  // Initialize pagination state
  const [pagination, setPagination] = useState<{
    users: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    posts: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }>({
    users: {
      totalCount: 0,
      totalPages: 0,
      currentPage: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    posts: {
      totalCount: 0,
      totalPages: 0,
      currentPage: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  });
  
  const [loading, setLoading] = useState({
    users: false,
    posts: false,
    hashtags: false,
    tickers: false,
    combined: false,
    paginatedUsers: false,
    paginatedPosts: false,
    any: false,
  });

  // Set up lazy queries
  const [searchUsersQuery] = useLazyQuery(SEARCH_USERS, {
    onCompleted: (result) => {
      setData((prev) => ({ ...prev, users: result.searchUsers }));
      setLoading((prev) => {
        const newLoading = { 
          ...prev, 
          users: false, 
          any: prev.posts || prev.hashtags || prev.tickers || prev.combined || prev.paginatedUsers || prev.paginatedPosts
        };
        return newLoading;
      });
    },
    onError: (error) => {
      console.error('Error searching users:', error);
      setLoading((prev) => ({ 
        ...prev, 
        users: false, 
        any: prev.posts || prev.hashtags || prev.tickers || prev.combined || prev.paginatedUsers || prev.paginatedPosts
      }));
    },
  });

  const [searchPostsQuery] = useLazyQuery(SEARCH_POSTS, {
    onCompleted: (result) => {
      setData((prev) => ({ ...prev, posts: result.searchPosts }));
      setLoading((prev) => ({ 
        ...prev, 
        posts: false, 
        any: prev.users || prev.hashtags || prev.tickers || prev.combined || prev.paginatedUsers || prev.paginatedPosts
      }));
    },
    onError: (error) => {
      console.error('Error searching posts:', error);
      setLoading((prev) => ({ 
        ...prev, 
        posts: false, 
        any: prev.users || prev.hashtags || prev.tickers || prev.combined || prev.paginatedUsers || prev.paginatedPosts
      }));
    },
  });

  const [searchHashtagsQuery] = useLazyQuery(SEARCH_HASHTAGS, {
    onCompleted: (result) => {
      setData((prev) => ({ ...prev, hashtags: result.searchHashtags }));
      setLoading((prev) => ({ 
        ...prev, 
        hashtags: false, 
        any: prev.users || prev.posts || prev.tickers || prev.combined || prev.paginatedUsers || prev.paginatedPosts
      }));
    },
    onError: (error) => {
      console.error('Error searching hashtags:', error);
      setLoading((prev) => ({ 
        ...prev, 
        hashtags: false, 
        any: prev.users || prev.posts || prev.tickers || prev.combined || prev.paginatedUsers || prev.paginatedPosts
      }));
    },
  });

  const [searchTickersQuery] = useLazyQuery(SEARCH_TICKERS, {
    onCompleted: (result) => {
      setData((prev) => ({ ...prev, tickers: result.searchTickers }));
      setLoading((prev) => ({ 
        ...prev, 
        tickers: false, 
        any: prev.users || prev.posts || prev.hashtags || prev.combined || prev.paginatedUsers || prev.paginatedPosts
      }));
    },
    onError: (error) => {
      console.error('Error searching tickers:', error);
      setLoading((prev) => ({ 
        ...prev, 
        tickers: false, 
        any: prev.users || prev.posts || prev.hashtags || prev.combined || prev.paginatedUsers || prev.paginatedPosts
      }));
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
      setLoading((prev) => ({ 
        ...prev, 
        combined: false, 
        any: prev.users || prev.posts || prev.hashtags || prev.tickers || prev.paginatedUsers || prev.paginatedPosts
      }));
    },
    onError: (error) => {
      console.error('Error in combined search:', error);
      setLoading((prev) => ({ 
        ...prev, 
        combined: false, 
        any: prev.users || prev.posts || prev.hashtags || prev.tickers || prev.paginatedUsers || prev.paginatedPosts
      }));
    },
  });

  // Add paginated search queries
  const [paginatedSearchUsersQuery] = useLazyQuery(PAGINATED_SEARCH_USERS, {
    onCompleted: (result) => {
      setData((prev) => ({ ...prev, users: result.paginatedSearchUsers.users }));
      setPagination((prev) => ({ 
        ...prev, 
        users: result.paginatedSearchUsers.pagination 
      }));
      setLoading((prev) => ({ 
        ...prev, 
        paginatedUsers: false, 
        any: prev.users || prev.posts || prev.hashtags || prev.tickers || prev.combined || prev.paginatedPosts
      }));
    },
    onError: (error) => {
      console.error('Error in paginated users search:', error);
      setLoading((prev) => ({ 
        ...prev, 
        paginatedUsers: false, 
        any: prev.users || prev.posts || prev.hashtags || prev.tickers || prev.combined || prev.paginatedPosts
      }));
    },
  });

  const [paginatedSearchPostsQuery] = useLazyQuery(PAGINATED_SEARCH_POSTS, {
    onCompleted: (result) => {
      setData((prev) => ({ ...prev, posts: result.paginatedSearchPosts.posts }));
      setPagination((prev) => ({ 
        ...prev, 
        posts: result.paginatedSearchPosts.pagination 
      }));
      setLoading((prev) => ({ 
        ...prev, 
        paginatedPosts: false, 
        any: prev.users || prev.posts || prev.hashtags || prev.tickers || prev.combined || prev.paginatedUsers
      }));
    },
    onError: (error) => {
      console.error('Error in paginated posts search:', error);
      setLoading((prev) => ({ 
        ...prev, 
        paginatedPosts: false, 
        any: prev.users || prev.posts || prev.hashtags || prev.tickers || prev.combined || prev.paginatedUsers
      }));
    },
  });

  // Define search functions
  const searchUsers = useCallback(
    async (query: string, limit?: number) => {
      if (!query.trim()) return { users: [] };
      
      setLoading((prev) => ({ ...prev, users: true, any: true }));
      
      try {
        await searchUsersQuery({ variables: { query, limit } });
        // Don't return data here, let the component get the updated state through the hook
        return { success: true };
      } catch (error) {
        console.error('Error searching users:', error);
        return { users: [], error };
      }
    },
    [searchUsersQuery]
  );

  const searchPosts = useCallback(
    async (query: string, limit?: number) => {
      if (!query.trim()) return { posts: [] };
      
      setLoading((prev) => ({ ...prev, posts: true, any: true }));
      
      try {
        await searchPostsQuery({ variables: { query, limit } });
        // Don't return data here, let the component get the updated state through the hook
        return { success: true };
      } catch (error) {
        console.error('Error searching posts:', error);
        return { posts: [], error };
      }
    },
    [searchPostsQuery]
  );

  const searchHashtags = useCallback(
    async (query: string, limit?: number) => {
      if (!query.trim()) return { hashtags: [] };
      
      setLoading((prev) => ({ ...prev, hashtags: true, any: true }));
      
      try {
        await searchHashtagsQuery({ variables: { query, limit } });
        // Don't return data here, let the component get the updated state through the hook
        return { success: true };
      } catch (error) {
        console.error('Error searching hashtags:', error);
        return { hashtags: [], error };
      }
    },
    [searchHashtagsQuery]
  );

  const searchTickers = useCallback(
    async (query: string, limit?: number) => {
      if (!query.trim()) return { tickers: [] };
      
      setLoading((prev) => ({ ...prev, tickers: true, any: true }));
      
      try {
        await searchTickersQuery({ variables: { query, limit } });
        // Don't return data here, let the component get the updated state through the hook
        return { success: true };
      } catch (error) {
        console.error('Error searching tickers:', error);
        return { tickers: [], error };
      }
    },
    [searchTickersQuery]
  );

  // Add combined search function
  const combinedSearch = useCallback(
    async (query: string, limit?: number) => {
      if (!query.trim()) {
        return {
          success: false,
          data: {
            users: [],
            posts: [],
            hashtags: [],
            tickers: [],
            hasMoreResults: false,
          }
        };
      }
      
      setLoading((prev) => ({ ...prev, combined: true, any: true }));
      
      try {
        await combinedSearchQuery({ variables: { query, limit } });
        // Don't return data here, let the component get the updated state through the hook
        return { success: true };
      } catch (error) {
        console.error('Error in combined search:', error);
        return {
          success: false,
          error,
          data: {
            users: [],
            posts: [],
            hashtags: [],
            tickers: [],
            hasMoreResults: false,
          }
        };
      }
    },
    [combinedSearchQuery]
  );

  // Add paginated search functions
  const paginatedSearchUsers = useCallback(
    async (query: string, page: number = 1, pageSize: number = 20) => {
      if (!query.trim()) {
        return { 
          success: false,
          data: {
            users: [],
            pagination: {
              totalCount: 0,
              totalPages: 0,
              currentPage: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            }
          }
        };
      }
      
      setLoading((prev) => ({ ...prev, paginatedUsers: true, any: true }));
      
      try {
        await paginatedSearchUsersQuery({ 
          variables: { query, page, pageSize } 
        });
        
        // Don't return data here, let the component get the updated state through the hook
        return { success: true };
      } catch (error) {
        console.error('Error in paginated users search:', error);
        return { 
          success: false,
          error,
          data: {
            users: [],
            pagination: {
              totalCount: 0,
              totalPages: 0,
              currentPage: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            }
          }
        };
      }
    },
    [paginatedSearchUsersQuery]
  );

  const paginatedSearchPosts = useCallback(
    async (query: string, page: number = 1, pageSize: number = 20) => {
      if (!query.trim()) {
        return { 
          success: false,
          data: {
            posts: [],
            pagination: {
              totalCount: 0,
              totalPages: 0,
              currentPage: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            }
          }
        };
      }
      
      setLoading((prev) => ({ ...prev, paginatedPosts: true, any: true }));
      
      try {
        await paginatedSearchPostsQuery({ 
          variables: { query, page, pageSize } 
        });
        
        // Don't return data here, let the component get the updated state through the hook
        return { success: true };
      } catch (error) {
        console.error('Error in paginated posts search:', error);
        return { 
          success: false,
          error,
          data: {
            posts: [],
            pagination: {
              totalCount: 0,
              totalPages: 0,
              currentPage: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            }
          }
        };
      }
    },
    [paginatedSearchPostsQuery]
  );
  
  // Execute all searches in parallel
  const searchAll = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        return {
          success: false,
          data: {
            users: [],
            posts: [],
            hashtags: [],
            tickers: [],
          }
        };
      }

      setLoading({
        users: true,
        posts: true,
        hashtags: true,
        tickers: true,
        combined: false,
        paginatedUsers: false,
        paginatedPosts: false,
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
        
        // Don't return data here, let the component get the updated state through the hook
        return { success: true };
      } catch (error) {
        console.error('Error performing search:', error);
        return {
          success: false,
          error,
          data: {
            users: [],
            posts: [],
            hashtags: [],
            tickers: [],
          }
        };
      }
    },
    [searchUsersQuery, searchPostsQuery, searchHashtagsQuery, searchTickersQuery]
  );

  return {
    searchUsers,
    searchPosts,
    searchHashtags,
    searchTickers,
    searchAll,
    combinedSearch,
    paginatedSearchUsers,
    paginatedSearchPosts,
    loading,
    data,
    pagination,
  };
};