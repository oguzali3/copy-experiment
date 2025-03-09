/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useUnifiedSearch.ts
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLazyQuery } from '@apollo/client';
import {
  SEARCH_USERS,
  SEARCH_POSTS,
  SEARCH_HASHTAGS,
  SEARCH_TICKERS
} from '@/lib/graphql/operations/search';
import { useDebounce } from '@/hooks/useDebounce';

// Search result types
interface SearchResult {
  users: any[];
  posts: any[];
  hashtags: any[];
  tickers: any[];
  isLoading: boolean;
}

interface SearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  cacheResults?: boolean;
  showResultsWhileTyping?: boolean;
}

/**
 * Unified search hook that provides efficient and responsive search functionality
 * across users, posts, hashtags, and tickers.
 */
export const useUnifiedSearch = (initialQuery = '', options: SearchOptions = {}) => {
  // Default options
  const {
    debounceMs = 300,
    minQueryLength = 2,
    cacheResults = true,
    showResultsWhileTyping = true
  } = options;
  
  // State
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [resultsCache, setResultsCache] = useState<Record<string, SearchResult>>({});
  
  // Debounce search query to prevent excessive API calls
  const debouncedQuery = useDebounce(searchQuery, debounceMs);
  
  // GraphQL lazy queries
  const [searchUsersQuery, { loading: usersLoading, data: usersData }] = useLazyQuery(SEARCH_USERS);
  const [searchPostsQuery, { loading: postsLoading, data: postsData }] = useLazyQuery(SEARCH_POSTS);
  const [searchHashtagsQuery, { loading: hashtagsLoading, data: hashtagsData }] = useLazyQuery(SEARCH_HASHTAGS);
  const [searchTickersQuery, { loading: tickersLoading, data: tickersData }] = useLazyQuery(SEARCH_TICKERS);
  
  // Track if any search is in progress
  const isLoading = usersLoading || postsLoading || hashtagsLoading || tickersLoading;
  
  // Check if we have results
  const hasResults = useMemo(() => {
    if (!usersData && !postsData && !hashtagsData && !tickersData) return false;
    
    return (
      (usersData?.searchUsers?.length > 0) ||
      (postsData?.searchPosts?.length > 0) ||
      (hashtagsData?.searchHashtags?.length > 0) ||
      (tickersData?.searchTickers?.length > 0)
    );
  }, [usersData, postsData, hashtagsData, tickersData]);
  
  // Combined results
  const results: SearchResult = useMemo(() => ({
    users: usersData?.searchUsers || [],
    posts: postsData?.searchPosts || [],
    hashtags: hashtagsData?.searchHashtags || [],
    tickers: tickersData?.searchTickers || [],
    isLoading
  }), [
    usersData, 
    postsData, 
    hashtagsData, 
    tickersData, 
    isLoading
  ]);
  
  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setResultsVisible(false);
  }, []);
  
  // Show/hide results dropdown
  const showResults = useCallback(() => {
    if (debouncedQuery.trim().length >= minQueryLength || hasResults) {
      setResultsVisible(true);
    }
  }, [debouncedQuery, hasResults, minQueryLength]);
  
  const hideResults = useCallback(() => {
    setResultsVisible(false);
  }, []);
  
  // Perform search based on query and prefix
  const performSearch = useCallback(async () => {
    const trimmedQuery = debouncedQuery.trim();
    
    // Don't search if query is too short
    if (trimmedQuery.length < minQueryLength) {
      return;
    }
    
    // Check cache first if enabled
    if (cacheResults && resultsCache[trimmedQuery]) {
      console.log('Using cached results for:', trimmedQuery);
      return;
    }
    
    try {
      // Determine which searches to run based on prefix
      const isHashtag = trimmedQuery.startsWith('#');
      const isTicker = trimmedQuery.startsWith('$');
      
      // Execute queries in parallel for better performance
      const promises = [];
      
      // Always search users and posts unless it's a specialized search
      if (!isHashtag && !isTicker) {
        promises.push(searchUsersQuery({ variables: { query: trimmedQuery } }));
        promises.push(searchPostsQuery({ variables: { query: trimmedQuery } }));
      }
      
      // Only search hashtags if query starts with # or explicitly searching hashtags
      if (isHashtag) {
        promises.push(searchHashtagsQuery({ variables: { query: trimmedQuery } }));
        // Also search posts with this hashtag
        promises.push(searchPostsQuery({ variables: { query: trimmedQuery } }));
      }
      
      // Only search tickers if query starts with $ or explicitly searching tickers
      if (isTicker) {
        promises.push(searchTickersQuery({ variables: { query: trimmedQuery } }));
        // Also search posts with this ticker
        promises.push(searchPostsQuery({ variables: { query: trimmedQuery } }));
      }
      
      // Wait for all queries to complete
      await Promise.all(promises);
      
      // Update cache if enabled
      if (cacheResults) {
        setResultsCache(prev => ({
          ...prev,
          [trimmedQuery]: results
        }));
      }
      
      // Show results if we have any and configured to show while typing
      if (showResultsWhileTyping && hasResults) {
        showResults();
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }, [
    debouncedQuery,
    minQueryLength,
    cacheResults,
    resultsCache,
    searchUsersQuery,
    searchPostsQuery,
    searchHashtagsQuery,
    searchTickersQuery,
    results,
    showResultsWhileTyping,
    hasResults,
    showResults
  ]);
  
  // Run search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= minQueryLength) {
      performSearch();
    } else if (debouncedQuery.trim().length === 0) {
      // Clear results when query is empty
      hideResults();
    }
  }, [debouncedQuery, performSearch, hideResults, minQueryLength]);
  
  return {
    searchQuery,
    setSearchQuery,
    results,
    isLoading,
    hasResults,
    resultsVisible,
    showResults,
    hideResults,
    clearSearch,
    performSearch
  };
};