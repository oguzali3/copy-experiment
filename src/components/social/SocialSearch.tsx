// src/components/social/SocialSearch.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, Hash, DollarSign, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchApi } from '@/hooks/useSearchApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const SocialSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [showResults, setShowResults] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Use the search API hook
  const { searchUsers, searchPosts, searchHashtags, searchTickers, loading, data } = useSearchApi();
  
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
  
  // Perform search when debounced search term changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearch.trim()) {
        setShowResults(true);
        
        // Determine which search to run based on prefix
        if (debouncedSearch.startsWith('#')) {
          await searchHashtags(debouncedSearch);
        } else if (debouncedSearch.startsWith('$')) {
          await searchTickers(debouncedSearch);
        } else {
          // Run both users and posts searches
          await Promise.all([
            searchUsers(debouncedSearch),
            searchPosts(debouncedSearch)
          ]);
        }
        
        // Check if we have any results
        const hasAnyResults = 
          data.users.length > 0 || 
          data.posts.length > 0 || 
          data.hashtags.length > 0 || 
          data.tickers.length > 0;
        
        setHasResults(hasAnyResults);
      } else {
        setShowResults(false);
        setHasResults(false);
      }
    };
    
    performSearch();
  }, [debouncedSearch, searchUsers, searchPosts, searchHashtags, searchTickers, data]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowResults(false);
      navigate(`/?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  
  const handleUserClick = (userId: string) => {
    setShowResults(false);
    navigate(`/profile?id=${userId}`);
  };
  
  const handleHashtagClick = (tag: string) => {
    setShowResults(false);
    navigate(`/?q=${encodeURIComponent(tag)}`);
  };
  
  const handleTickerClick = (symbol: string) => {
    setShowResults(false);
    navigate(`/?q=${encodeURIComponent('$' + symbol)}`);
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
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
      
      {/* Search Results Dropdown */}
      {showResults && searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50 max-h-96 overflow-y-auto">
          {loading.any ? (
            <div className="p-4 text-center text-gray-500">
              Searching...
            </div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-gray-500">
              No results found for "{searchTerm}"
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {/* Users */}
              {data.users.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    People
                  </div>
                  {data.users.slice(0, 3).map((user) => (
                    <button
                      key={user.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md w-full text-left"
                      onClick={() => handleUserClick(user.id)}
                    >
                      <div className="flex-shrink-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatarUrl || undefined} />
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
                  {data.users.length > 3 && (
                    <button
                      className="w-full text-blue-500 text-sm p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-center"
                      onClick={() => {
                        setShowResults(false);
                        navigate(`/?q=${encodeURIComponent(searchTerm)}`);
                      }}
                    >
                      View all users
                    </button>
                  )}
                </div>
              )}
              
              {/* Hashtags */}
              {data.hashtags.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Hashtags
                  </div>
                  {data.hashtags.slice(0, 3).map((hashtag) => (
                    <button
                      key={hashtag.tag}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md w-full text-left"
                      onClick={() => handleHashtagClick(`#${hashtag.tag}`)}
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
              
              {/* Tickers */}
              {data.tickers.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Tickers
                  </div>
                  {data.tickers.slice(0, 3).map((ticker) => (
                    <button
                      key={ticker.symbol}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md w-full text-left"
                      onClick={() => handleTickerClick(ticker.symbol)}
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
              {data.posts.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Posts
                  </div>
                  {data.posts.slice(0, 2).map((post) => (
                    <button
                      key={post.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md w-full text-left"
                      onClick={() => {
                        setShowResults(false);
                        navigate(`/?q=${encodeURIComponent(searchTerm)}`);
                      }}
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
                  {data.posts.length > 2 && (
                    <button
                      className="w-full text-blue-500 text-sm p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-center"
                      onClick={() => {
                        setShowResults(false);
                        navigate(`/?q=${encodeURIComponent(searchTerm)}`);
                      }}
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
                  onClick={() => {
                    setShowResults(false);
                    navigate(`/?q=${encodeURIComponent(searchTerm)}`);
                  }}
                >
                  Search for "{searchTerm}"
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};