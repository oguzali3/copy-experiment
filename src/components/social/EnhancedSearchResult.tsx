/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/social/EnhancedSearchResult.tsx
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DollarSign, FileText, Hash, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EnhancedSearchResultsProps {
  query: string;
  users: any[];
  posts: any[];
  hashtags: any[];
  tickers: any[];
  hasMoreResults: boolean;
  onClose: () => void;
  onViewAll: (type: 'users' | 'posts' | 'hashtags' | 'tickers') => void;
}

// Configuration for initial display limits
const DISPLAY_LIMITS = {
  USERS: 3,
  POSTS: 2,
  HASHTAGS: 3,
  TICKERS: 3,
};

export const EnhancedSearchResults = ({
  query,
  users,
  posts,
  hashtags,
  tickers,
  hasMoreResults,
  onClose,
  onViewAll
}: EnhancedSearchResultsProps) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<{
    users: boolean;
    posts: boolean;
    hashtags: boolean;
    tickers: boolean;
  }>({
    users: false,
    posts: false,
    hashtags: false,
    tickers: false,
  });

  if (!query) return null;

  const handleProfileClick = (userId: string) => {
    navigate(`/profile?id=${userId}`);
    onClose();
  };
  
  const handlePostClick = (postId: string) => {
    navigate(`/post/${postId}`);
    onClose();
  };

  const handleHashtagClick = (tag: string) => {
    navigate(`/?q=${encodeURIComponent('#' + tag)}`);
    onClose();
  };

  const handleTickerClick = (symbol: string) => {
    navigate(`/?q=${encodeURIComponent('$' + symbol)}`);
    onClose();
  };

  const handleExpand = (section: 'users' | 'posts' | 'hashtags' | 'tickers') => {
    setExpanded(prev => ({
      ...prev,
      [section]: true
    }));
  };

  // Determine display counts based on expanded state
  const displayCounts = {
    users: expanded.users ? users.length : Math.min(users.length, DISPLAY_LIMITS.USERS),
    posts: expanded.posts ? posts.length : Math.min(posts.length, DISPLAY_LIMITS.POSTS),
    hashtags: expanded.hashtags ? hashtags.length : Math.min(hashtags.length, DISPLAY_LIMITS.HASHTAGS),
    tickers: expanded.tickers ? tickers.length : Math.min(tickers.length, DISPLAY_LIMITS.TICKERS),
  };

  const hasAnyResults = users.length > 0 || posts.length > 0 || hashtags.length > 0 || tickers.length > 0;

  return (
    <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border rounded-lg shadow-lg mt-2 max-h-[80vh] overflow-y-auto z-50">
      {/* Users Section */}
      {users.length > 0 && (
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">People</h3>
            {users.length > DISPLAY_LIMITS.USERS && !expanded.users && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleExpand('users')}
                className="text-blue-500 hover:text-blue-600"
              >
                Show more
              </Button>
            )}
            {users.length > displayCounts.users && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onViewAll('users')}
                className="text-blue-500 hover:text-blue-600"
              >
                View all
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {users.slice(0, displayCounts.users).map((user) => (
              <button
                key={user.id}
                className="flex items-center gap-3 w-full hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md text-left"
                onClick={() => handleProfileClick(user.id)}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback>
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{user.displayName}</div>
                  <div className="text-sm text-gray-500">
                    @{user.displayName.toLowerCase().replace(/\s+/g, '')}
                  </div>
                </div>
                {user.isVerified && (
                  <span className="ml-1 text-blue-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hashtags Section */}
      {hashtags.length > 0 && (
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Hashtags</h3>
            {hashtags.length > DISPLAY_LIMITS.HASHTAGS && !expanded.hashtags && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleExpand('hashtags')}
                className="text-blue-500 hover:text-blue-600"
              >
                Show more
              </Button>
            )}
            {hashtags.length > displayCounts.hashtags && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onViewAll('hashtags')}
                className="text-blue-500 hover:text-blue-600"
              >
                View all
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {hashtags.slice(0, displayCounts.hashtags).map((hashtag) => (
              <button
                key={hashtag.tag}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md w-full text-left"
                onClick={() => handleHashtagClick(hashtag.tag)}
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
        </div>
      )}

      {/* Tickers Section */}
      {tickers.length > 0 && (
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Tickers</h3>
            {tickers.length > DISPLAY_LIMITS.TICKERS && !expanded.tickers && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleExpand('tickers')}
                className="text-blue-500 hover:text-blue-600"
              >
                Show more
              </Button>
            )}
            {tickers.length > displayCounts.tickers && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onViewAll('tickers')}
                className="text-blue-500 hover:text-blue-600"
              >
                View all
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {tickers.slice(0, displayCounts.tickers).map((ticker) => (
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
        </div>
      )}

      {/* Posts Section */}
      {posts.length > 0 && (
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Posts</h3>
            {posts.length > DISPLAY_LIMITS.POSTS && !expanded.posts && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleExpand('posts')}
                className="text-blue-500 hover:text-blue-600"
              >
                Show more
              </Button>
            )}
            {posts.length > displayCounts.posts && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onViewAll('posts')}
                className="text-blue-500 hover:text-blue-600"
              >
                View all
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {posts.slice(0, displayCounts.posts).map((post) => (
              <div 
                key={post.id}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors" 
                onClick={() => handlePostClick(post.id)}
              >
                <div className="flex items-center gap-3 p-2">
                  <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                    <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                      {post.content}
                    </div>
                    <div className="text-xs text-gray-500">by {post.author.displayName}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {!hasAnyResults && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No results found for "{query}"
        </div>
      )}

      {/* See All Results Button */}
      {hasMoreResults && (
        <div className="p-4">
          <Button
            onClick={() => navigate(`/?q=${encodeURIComponent(query)}`)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            See all results for "{query}"
          </Button>
        </div>
      )}
    </div>
  );
};