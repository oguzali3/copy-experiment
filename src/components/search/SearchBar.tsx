// src/components/search/SearchBar.tsx
import React, { useRef, useEffect } from 'react';
import { Search, X, User, Hash, DollarSign, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUnifiedSearch } from '@/hooks/useUnifiedSearch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/loaders';

export const SearchBar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Initialize search with URL query parameter
  const initialQuery = searchParams.get('q') || '';
  
  // Use our unified search hook
  const {
    searchQuery,
    setSearchQuery,
    results,
    isLoading,
    hasResults,
    resultsVisible,
    showResults,
    hideResults,
    clearSearch
  } = useUnifiedSearch(initialQuery, {
    debounceMs: 300,
    minQueryLength: 2,
    cacheResults: true,
    showResultsWhileTyping: true
  });
  
  // Handle outside clicks to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        hideResults();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [hideResults]);
  
  // Handle search form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      hideResults();
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  // Navigation handlers
  const handleUserClick = (userId: string) => {
    hideResults();
    navigate(`/profile?id=${userId}`);
  };
  
  const handleHashtagClick = (tag: string) => {
    hideResults();
    navigate(`/?q=${encodeURIComponent(tag)}`);
  };
  
  const handleTickerClick = (symbol: string) => {
    hideResults();
    navigate(`/?q=${encodeURIComponent('$' + symbol)}`);
  };
  
  const handleViewAll = () => {
    hideResults();
    navigate(`/?q=${encodeURIComponent(searchQuery)}`);
  };
  
  return (
    <div className="relative flex-1" ref={searchRef}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-gray-100 dark:bg-gray-800 border-none"
            onFocus={() => {
              if (searchQuery.trim() && hasResults) {
                showResults();
              }
            }}
            aria-expanded={resultsVisible}
            aria-controls="search-results"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 h-full"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-gray-400" />
            </Button>
          )}
        </div>
      </form>
      
      {/* Search Results Dropdown */}
      {resultsVisible && searchQuery && (
        <div 
          id="search-results"
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50 max-h-96 overflow-y-auto"
          role="listbox"
        >
          {isLoading ? (
            <div className="p-4">
              <Skeleton count={3} />
            </div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-gray-500">
              No results found for "{searchQuery}"
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {/* Users Section */}
              {results.users.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    People
                  </div>
                  {results.users.slice(0, 3).map((user) => (
                    <button
                      key={user.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md w-full text-left"
                      onClick={() => handleUserClick(user.id)}
                      role="option"
                    >
                      <div className="flex-shrink-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <div className="font-medium">{user.displayName}</div>
                        <div className="text-xs text-gray-500">@{user.displayName.toLowerCase().replace(/\s+/g, '')}</div>
                      </div>
                    </button>
                  ))}
                  {results.users.length > 3 && (
                    <button
                      className="w-full text-blue-500 text-sm p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-center"
                      onClick={handleViewAll}
                    >
                      View all users
                    </button>
                  )}
                </div>
              )}
              
              {/* Hashtags Section */}
              {results.hashtags.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Hashtags
                  </div>
                  {results.hashtags.slice(0, 3).map((hashtag) => (
                    <button
                      key={hashtag.tag}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md w-full text-left"
                      onClick={() => handleHashtagClick(`#${hashtag.tag}`)}
                      role="option"
                    >
                      <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                        <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium">#{hashtag.tag}</div>
                        <div className="text-xs text-gray-500">{hashtag.count} posts</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Tickers Section */}
              {results.tickers.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Tickers
                  </div>
                  {results.tickers.slice(0, 3).map((ticker) => (
                    <button
                      key={ticker.symbol}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md w-full text-left"
                      onClick={() => handleTickerClick(ticker.symbol)}
                      role="option"
                    >
                      <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 p-2 rounded-full">
                        <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="font-medium">${ticker.symbol}</div>
                        <div className="text-xs text-gray-500">{ticker.name}</div>
                      </div>
                      <div className={`ml-auto text-sm ${
                        ticker.changePercent < 0 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {ticker.price.toFixed(2)} ({ticker.changePercent > 0 ? '+' : ''}
                        {ticker.changePercent.toFixed(2)}%)
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Posts Preview */}
              {results.posts.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Posts
                  </div>
                  {results.posts.slice(0, 2).map((post) => (
                    <button
                      key={post.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md w-full text-left"
                      onClick={handleViewAll}
                      role="option"
                    >
                      <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                        <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                          {post.content}
                        </div>
                        <div className="text-xs text-gray-500">by {post.author.displayName}</div>
                      </div>
                    </button>
                  ))}
                  {results.posts.length > 2 && (
                    <button
                      className="w-full text-blue-500 text-sm p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-center"
                      onClick={handleViewAll}
                    >
                      View all posts
                    </button>
                  )}
                </div>
              )}
              
              {/* Search all button */}
              <div className="p-2">
                <button
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md py-2 px-4 text-sm font-medium"
                  onClick={handleViewAll}
                >
                  Search for "{searchQuery}"
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};