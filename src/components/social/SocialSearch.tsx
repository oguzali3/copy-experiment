// src/components/social/SocialSearch.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchApi } from '@/hooks/useSearchApi';
import { EnhancedSearchResults } from './EnhancedSearchResult';

export const SocialSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [showResults, setShowResults] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Use the search API hook
  const { 
    combinedSearch, 
    searchUsers, 
    searchPosts, 
    searchHashtags, 
    searchTickers, 
    loading, 
    data 
  } = useSearchApi();
  
  // Handle outside clicks to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Create memoized function to check for results
  const checkForResults = useCallback(() => {
    return (
      data.users.length > 0 || 
      data.posts.length > 0 || 
      data.hashtags.length > 0 || 
      data.tickers.length > 0
    );
  }, [data.users.length, data.posts.length, data.hashtags.length, data.tickers.length]);
  
  // Perform search when debounced search term changes
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearch.trim()) {
        setShowResults(false);
        setHasResults(false);
        return;
      }
      
      setShowResults(true);
      
      try {
        // Use the combinedSearch for more efficient results
        await combinedSearch(debouncedSearch, 10);
      } catch (error) {
        console.error('Search error:', error);
      }
    };
    
    performSearch();
  }, [debouncedSearch, combinedSearch]);
  
  // Update hasResults in a separate effect to avoid infinite loop
  useEffect(() => {
    if (debouncedSearch.trim()) {
      setHasResults(checkForResults());
    }
  }, [debouncedSearch, checkForResults, data]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowResults(false);
      navigate(`/?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
  };

  const handleViewAll = (type: 'users' | 'posts' | 'hashtags' | 'tickers') => {
    setShowResults(false);
    
    let url = `/?q=${encodeURIComponent(searchTerm.trim())}`;
    
    // Optionally add a filter parameter to indicate which section to focus on
    if (type !== 'users') {
      url += `&filter=${type}`;
    }
    
    navigate(url);
  };
  
  return (
    <div className="relative flex-1" ref={searchRef}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 bg-gray-100 dark:bg-gray-800 border-none"
            onFocus={() => {
              if (searchTerm.trim() && hasResults) {
                setShowResults(true);
              }
            }}
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 h-full"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4 text-gray-400" />
            </Button>
          )}
        </div>
      </form>
      
      {/* Enhanced Search Results Dropdown */}
      {showResults && searchTerm && (
        loading.any ? (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50">
            <div className="p-4 text-center text-gray-500">
              Searching...
            </div>
          </div>
        ) : (
          <EnhancedSearchResults
            query={searchTerm}
            users={data.users}
            posts={data.posts}
            hashtags={data.hashtags}
            tickers={data.tickers}
            hasMoreResults={data.hasMoreResults}
            onClose={() => setShowResults(false)}
            onViewAll={handleViewAll}
          />
        )
      )}
    </div>
  );
};