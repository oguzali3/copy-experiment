// src/pages/Search.tsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Post } from "@/components/social/Post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Hash } from "lucide-react";
import { SocialHeader } from "@/components/social/SocialHeader";
import { SocialSidebar } from "@/components/social/SocialSidebar";
import { CustomPagination } from "@/components/ui/custom-pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/loaders";
import { useSearchApi } from "@/hooks/useSearchApi";
import TickersSection from "@/components/social/TickerSection";

const PAGE_SIZE = 20;

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const filter = searchParams.get("filter") || "all";
  const [activeTab, setActiveTab] = useState<string>(filter !== "all" ? filter : "posts");
  const [currentPage, setCurrentPage] = useState({
    users: 1,
    posts: 1
  });

  const navigate = useNavigate();

  // Use our GraphQL search API hook
  const { 
    paginatedSearchUsers,
    paginatedSearchPosts,
    searchHashtags,
    searchTickers,
    loading,
    data,
    pagination
  } = useSearchApi();

  // Fetch search results when query or active tab changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;

      if (activeTab === "users" || activeTab === "all") {
        await paginatedSearchUsers(query, currentPage.users, PAGE_SIZE);
      }
      
      if (activeTab === "posts" || activeTab === "all") {
        await paginatedSearchPosts(query, currentPage.posts, PAGE_SIZE);
      }
      
      if (activeTab === "hashtags" || activeTab === "all") {
        await searchHashtags(query, 30);
      }
      
      if (activeTab === "tickers" || activeTab === "all") {
        await searchTickers(query, 30);
      }
    };

    fetchSearchResults();
  }, [query, activeTab, currentPage]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset pagination when changing tabs
    setCurrentPage({
      users: 1,
      posts: 1
    });
  };

  const handlePageChange = (page: number) => {
    if (activeTab === "users") {
      setCurrentPage(prev => ({ ...prev, users: page }));
    } else if (activeTab === "posts") {
      setCurrentPage(prev => ({ ...prev, posts: page }));
    }
  };

  const handleProfileClick = (userId: string) => {
    navigate(`/profile?id=${userId}`);
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="fixed left-0 top-0 h-full w-[68px] border-r border-gray-200 dark:border-gray-800">
          <SocialSidebar />
        </div>
        
        <div className="fixed left-1/2 transform -translate-x-1/2" style={{
          width: '680px',
          marginLeft: '34px'
        }}>
          <div className="border-x border-gray-200 dark:border-gray-800 h-screen flex flex-col bg-white dark:bg-gray-900">
            <SocialHeader />
            <div className="p-8 text-center text-gray-500">
              Enter a search term to see results
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="fixed left-0 top-0 h-full w-[68px] border-r border-gray-200 dark:border-gray-800">
        <SocialSidebar />
      </div>
        
      <div className="fixed left-1/2 transform -translate-x-1/2" style={{
        width: '680px',
        marginLeft: '34px'
      }}>
        <div className="border-x border-gray-200 dark:border-gray-800 h-screen flex flex-col bg-white dark:bg-gray-900">
          <SocialHeader />
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1">Search Results</h1>
              <p className="text-gray-500">
                {query.startsWith('$') ? 
                  `Posts mentioning ${query}` : 
                  `Showing results for "${query}"`
                }
              </p>
            </div>
            
            <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
              <TabsList className="w-full mb-6">
                <TabsTrigger value="users" className="flex-1">
                  <User className="w-4 h-4 mr-2" />
                  People
                </TabsTrigger>
                <TabsTrigger value="posts" className="flex-1">
                  Posts
                </TabsTrigger>
                <TabsTrigger value="hashtags" className="flex-1">
                  <Hash className="w-4 h-4 mr-2" />
                  Hashtags
                </TabsTrigger>
                <TabsTrigger value="tickers" className="flex-1">
                  Tickers
                </TabsTrigger>
              </TabsList>
                
              {/* Users Tab */}
              <TabsContent value="users" className="mt-4">
                {loading.paginatedUsers ? (
                  <div className="flex justify-center items-center p-12">
                    <Spinner size="lg" label="Loading users..." />
                  </div>
                ) : data.users.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {data.users.map(user => (
                        <div key={user.id} className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                          <Avatar className="h-12 w-12 mr-4">
                            <AvatarImage src={user.avatarUrl || undefined} />
                            <AvatarFallback>
                              <User className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 cursor-pointer" onClick={() => handleProfileClick(user.id)}>
                            <div className="flex items-center">
                              <h3 className="font-semibold text-lg">{user.displayName}</h3>
                              {user.isVerified && (
                                <span className="ml-1 text-blue-500 text-sm">✓</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{user.displayName.toLowerCase().replace(/\s+/g, '')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.followersCount.toLocaleString()} followers · {user.followingCount.toLocaleString()} following
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                      
                    {pagination.users.totalPages > 1 && (
                      <div className="flex justify-center mt-8">
                        <CustomPagination
                          currentPage={pagination.users.currentPage}
                          totalPages={pagination.users.totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-12 text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow">
                    No users found matching "{query}"
                  </div>
                )}
              </TabsContent>
                
              {/* Posts Tab */}
              <TabsContent value="posts" className="mt-4">
                {loading.paginatedPosts ? (
                  <div className="flex justify-center items-center p-12">
                    <Spinner size="lg" label="Loading posts..." />
                  </div>
                ) : data.posts.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {data.posts.map(post => (
                        <Post key={post.id} post={post} />
                      ))}
                    </div>
                      
                    {pagination.posts.totalPages > 1 && (
                      <div className="flex justify-center mt-8">
                        <CustomPagination
                          currentPage={pagination.posts.currentPage}
                          totalPages={pagination.posts.totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-12 text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow">
                    No posts found matching "{query}"
                  </div>
                )}
              </TabsContent>
                
              {/* Hashtags Tab */}
              <TabsContent value="hashtags" className="mt-4">
                {loading.hashtags ? (
                  <div className="flex justify-center items-center p-12">
                    <Spinner size="lg" label="Loading hashtags..." />
                  </div>
                ) : data.hashtags.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.hashtags.map(hashtag => (
                      <div 
                        key={hashtag.tag} 
                        className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => navigate(`/?q=${encodeURIComponent('#' + hashtag.tag)}`)}
                      >
                        <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
                          <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">#{hashtag.tag}</h3>
                          <div className="text-sm text-gray-500">
                            {hashtag.count.toLocaleString()} posts
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-12 text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow">
                    No hashtags found matching "{query}"
                  </div>
                )}
              </TabsContent>
                
              {/* Tickers Tab */}
              <TabsContent value="tickers" className="mt-4">
                <TickersSection
                  isLoading={loading.tickers} 
                  tickers={data.tickers} 
                  query={query} 
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;