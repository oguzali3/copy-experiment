// src/components/social/TrendingSection.tsx - Updated for correct API calls
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Hash } from "lucide-react";
import { useTrendingHashtags, useTrendingTickers } from '@/hooks/useFeed';
import { Skeleton } from '@/components/ui/loaders';

export const TrendingSection: React.FC = () => {
  const navigate = useNavigate();
  
  // Use hooks with the correct property names
  const { 
    data: hashtagsData, 
    loading: hashtagsLoading 
  } = useTrendingHashtags(5);
  
  const { 
    data: tickersData, 
    loading: tickersLoading 
  } = useTrendingTickers(5);

  const handleHashtagClick = (tag: string) => {
    navigate(`/?q=${encodeURIComponent('#' + tag)}`);
  };

  const handleTickerClick = (symbol: string) => {
    navigate(`/?q=${encodeURIComponent('$' + symbol)}`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Trending</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="hashtags">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
            <TabsTrigger value="tickers">Tickers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hashtags" className="p-3 pt-4">
            {hashtagsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            // Use searchHashtags since that's what the server provides
            ) : hashtagsData?.searchHashtags && hashtagsData.searchHashtags.length > 0 ? (
              <div className="space-y-3">
                {hashtagsData.searchHashtags.map((hashtag) => (
                  <button
                    key={hashtag.tag}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md w-full text-left"
                    onClick={() => handleHashtagClick(hashtag.tag)}
                  >
                    <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                      <Hash className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">#{hashtag.tag}</div>
                      <div className="text-xs text-gray-500">{hashtag.count} posts</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No trending hashtags
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tickers" className="p-3 pt-4">
            {tickersLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            // Use searchTickers since that's what the server provides
            ) : tickersData?.searchTickers && tickersData.searchTickers.length > 0 ? (
              <div className="space-y-3">
                {tickersData.searchTickers.map((ticker) => (
                  <button
                    key={ticker.symbol}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md w-full text-left"
                    onClick={() => handleTickerClick(ticker.symbol)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 p-2 rounded-full">
                        <DollarSign className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">${ticker.symbol}</div>
                        <div className="text-xs text-gray-500 truncate w-24">{ticker.name}</div>
                      </div>
                    </div>
                    <div className={`text-xs font-medium ${
                      ticker.changePercent < 0 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {ticker.changePercent > 0 ? '+' : ''}
                      {ticker.changePercent.toFixed(2)}%
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No trending tickers
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};