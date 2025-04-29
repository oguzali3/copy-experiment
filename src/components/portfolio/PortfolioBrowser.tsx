// PortfolioBrowser.tsx with loading state during page transitions
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, TrendingUp, Zap, Clock } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/utils/apiClient';
import { useDebounce } from '@/hooks/useDebounce';
import { PortfolioVisibility } from '@/constants/portfolioVisibility';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Define interface for portfolio feed item based on the API response
interface PortfolioFeedItem {
  id: string;
  name: string;
  description?: string;
  visibility: PortfolioVisibility;
  userId: string;
  createdAt: Date;
  lastDayChange: number;
  lastMonthChange: number;
  lastYearChange: number;
  totalValue: number;
  creator: {
    displayName: string;
    avatarUrl: string | null;
  };
  subscriberCount?: number;
}

// Interface for pagination info
interface PageInfo {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

// Interface for the entire API response
interface PortfolioFeedResponse {
  items: PortfolioFeedItem[];
  pageInfo: PageInfo;
  totalCount: number;
}

// Possible sort options from the API
type SortBy = 'createdAt' | 'name' | 'totalValue' | 'subscriberCount' | 
              'lastDayChange' | 'lastMonthChange' | 'lastYearChange';

const PortfolioBrowser: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for portfolio feed data
  const [portfolioFeed, setPortfolioFeed] = useState<PortfolioFeedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // State for query parameters
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeTab, setActiveTab] = useState('all');
  
  // Get current page from URL or default to 1
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '6', 10);
  
  // Map tabs to sort options
  const getTabSortOptions = (tab: string): { sortBy: SortBy, sortOrder: 'ASC' | 'DESC' } => {
    switch (tab) {
      case 'trending':
        return { sortBy: 'lastDayChange', sortOrder: 'DESC' };
      case 'top':
        return { sortBy: 'totalValue', sortOrder: 'DESC' };
      case 'recent':
        return { sortBy: 'createdAt', sortOrder: 'DESC' };
      default:
        return { sortBy: 'name', sortOrder: 'ASC' };
    }
  };

  // Fetch portfolios from feed endpoint
  useEffect(() => {
    const fetchPortfolioFeed = async () => {
      // Set loading state
      if (!portfolioFeed) {
        setIsLoading(true);
      } else {
        setIsTransitioning(true);
      }
      
      try {
        const { sortBy, sortOrder } = getTabSortOptions(activeTab);
        
        // Build query parameters
        const params: Record<string, any> = {
          page: currentPage,
          limit,
          sortBy,
          sortOrder,
        };
        
        // Add search parameter if we have a search query
        if (debouncedSearch) {
          params.search = debouncedSearch;
        }
        
        // Make API request
        const response = await apiClient.get<PortfolioFeedResponse>('/portfolios/feed', {
          params,
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        
        setPortfolioFeed(response.data);
      } catch (error) {
        console.error('Error fetching portfolio feed:', error);
        toast.error('Failed to load portfolios. Please try again later.');
      } finally {
        setIsLoading(false);
        setIsTransitioning(false);
      }
    };
    
    fetchPortfolioFeed();
  }, [currentPage, limit, activeTab, debouncedSearch]);

  // Handle page change
  const handlePageChange = (page: number) => {
    // Only proceed if we're not already loading
    if (!isTransitioning) {
      // Update URL parameters
      searchParams.set('page', page.toString());
      setSearchParams(searchParams);
      
      // Scroll to top of the page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Handle tab change
  const handleTabChange = (tab: string) => {
    // Only proceed if we're not already loading
    if (!isTransitioning) {
      setActiveTab(tab);
      // Reset to page 1 when changing tabs
      searchParams.set('page', '1');
      setSearchParams(searchParams);
    }
  };

  const handleViewPortfolio = (portfolioId: string) => {
    navigate(`/portfolio/view/${portfolioId}`);
  };

  const handleSubscribeClick = () => {
    navigate('/portfolio-subscriptions');
  };

  // Display initial loading state
  if (isLoading && !portfolioFeed) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-3">Loading portfolios...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Public Portfolios</h1>
          <p className="text-gray-600">Browse public investment portfolios from the community</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search portfolios..."
              className="pl-8 w-60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isTransitioning}
            />
          </div>
          <Button 
            variant="outline" 
            className="ml-4"
            onClick={() => navigate('/portfolio-subscriptions')}
            disabled={isTransitioning}
          >
            Premium Portfolios
          </Button>
        </div>
      </div>
      
      {/* Banner for premium portfolios */}
      <div className="mb-6 p-4 bg-gradient-to-r from-lavender-100 to-periwinkle-100 rounded-lg border border-lavender-200">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-3 md:mb-0">
            <h3 className="text-lg font-semibold text-indigo-600">Premium Portfolios Available</h3>
            <p className="text-sm text-indigo-600">
              View premium portfolios created by experienced investors.
            </p>
          </div>
          <Button 
            className="bg-indigo-400 hover:bg-indigo-500"
            onClick={handleSubscribeClick}
            disabled={isTransitioning}
          >
            View Premium Options
          </Button>
        </div>
      </div>
      
      {/* Page transition loading indicator */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <div>
              <p className="font-medium">Loading portfolios...</p>
              <p className="text-sm text-gray-500">Please wait while we fetch the data</p>
            </div>
          </div>
        </div>
      )}
      
      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange} 
        className="space-y-6"
      >
        <TabsList className="flex justify-center space-x-2">
          <TabsTrigger value="all" disabled={isTransitioning}>All</TabsTrigger>
          <TabsTrigger value="trending" disabled={isTransitioning}>
            <TrendingUp className="h-4 w-4 mr-1" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="top" disabled={isTransitioning}>
            <Zap className="h-4 w-4 mr-1" />
            Top Value
          </TabsTrigger>
          <TabsTrigger value="recent" disabled={isTransitioning}>
            <Clock className="h-4 w-4 mr-1" />
            Recently Updated
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="pt-4">
          {portfolioFeed && portfolioFeed.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioFeed.items.map(portfolio => (
                  <Card key={portfolio.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={portfolio.creator?.avatarUrl || undefined} />
                            <AvatarFallback>
                              {portfolio.creator?.displayName 
                                ? portfolio.creator.displayName.substring(0, 2).toUpperCase() 
                                : 'UN'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                            <CardDescription className="text-sm">
                              by {portfolio.creator?.displayName || 'Unknown User'}
                            </CardDescription>
                          </div>
                        </div>
                        
                        {/* Display badges for portfolio type and performance */}
                        <div className="flex flex-col gap-2 items-end">
                          {portfolio.visibility === PortfolioVisibility.PAID && (
                            <Badge className="bg-mauve-400 hover:bg-mauve-500 text-indigo-900">
                              Premium
                            </Badge>
                          )}
                          <Badge 
                            className={
                              (portfolio.lastDayChange >= 0 
                                ? "bg-green-500 hover:bg-green-600" 
                                : "bg-red-500 hover:bg-red-600")
                            }
                          >
                            {portfolio.lastDayChange >= 0 ? "+" : ""}
                            {portfolio.lastDayChange?.toFixed(2) || '0.00'}%
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm line-clamp-3 min-h-[60px]">
                        {portfolio.description || "No description available"}
                      </p>
                      
                      <div className="mt-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Total Value:</span>
                          {portfolio.visibility === PortfolioVisibility.PAID ? (
                            <span className="font-medium text-indigo-600">
                              Subscribe to view
                            </span>
                          ) : (
                            <span className="font-medium">
                              ${portfolio.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                        
                        {/* Performance metrics */}
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-500">1-Day Performance:</span>
                          <span className={`font-medium ${portfolio.lastDayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {portfolio.lastDayChange >= 0 ? '+' : ''}{portfolio.lastDayChange.toFixed(2)}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-500">1-Month Performance:</span>
                          <span className={`font-medium ${portfolio.lastMonthChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {portfolio.lastMonthChange >= 0 ? '+' : ''}{portfolio.lastMonthChange.toFixed(2)}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-500">1-Year Performance:</span>
                          <span className={`font-medium ${portfolio.lastYearChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {portfolio.lastYearChange >= 0 ? '+' : ''}{portfolio.lastYearChange.toFixed(2)}%
                          </span>
                        </div>
                        
                        {portfolio.subscriberCount !== undefined && portfolio.subscriberCount > 0 && (
                          <div className="flex justify-between mt-1">
                            <span className="text-gray-500">Subscribers:</span>
                            <span className="font-medium">
                              {portfolio.subscriberCount}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-500">Created at:</span>
                          <span className="font-medium">
                            {new Date(portfolio.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className={`w-full ${portfolio.visibility === PortfolioVisibility.PAID ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ''}`}
                        onClick={portfolio.visibility === PortfolioVisibility.PAID 
                          ? handleSubscribeClick 
                          : () => handleViewPortfolio(portfolio.id)}
                        disabled={isTransitioning}
                      >
                        {portfolio.visibility === PortfolioVisibility.PAID 
                          ? "View Subscription Options" 
                          : "View Portfolio"
                        }
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {/* Pagination using your existing component */}
              {portfolioFeed.pageInfo.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      {/* Previous button */}
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isTransitioning) handlePageChange(currentPage - 1);
                            }} 
                            className={isTransitioning ? "opacity-50 cursor-not-allowed" : ""}
                          />
                        </PaginationItem>
                      )}
                      
                      {/* First page */}
                      {currentPage > 2 && (
                        <PaginationItem>
                          <PaginationLink 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isTransitioning) handlePageChange(1);
                            }}
                            className={isTransitioning ? "opacity-50 cursor-not-allowed" : ""}
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      {/* Ellipsis if needed */}
                      {currentPage > 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      
                      {/* Page before current */}
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationLink 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isTransitioning) handlePageChange(currentPage - 1);
                            }}
                            className={isTransitioning ? "opacity-50 cursor-not-allowed" : ""}
                          >
                            {currentPage - 1}
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      {/* Current page */}
                      <PaginationItem>
                        <PaginationLink 
                          href="#" 
                          isActive 
                          onClick={(e) => e.preventDefault()}
                        >
                          {currentPage}
                        </PaginationLink>
                      </PaginationItem>
                      
                      {/* Page after current */}
                      {currentPage < portfolioFeed.pageInfo.totalPages && (
                        <PaginationItem>
                          <PaginationLink 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isTransitioning) handlePageChange(currentPage + 1);
                            }}
                            className={isTransitioning ? "opacity-50 cursor-not-allowed" : ""}
                          >
                            {currentPage + 1}
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      {/* Ellipsis if needed */}
                      {currentPage < portfolioFeed.pageInfo.totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      
                      {/* Last page */}
                      {currentPage < portfolioFeed.pageInfo.totalPages - 1 && (
                        <PaginationItem>
                          <PaginationLink 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isTransitioning) handlePageChange(portfolioFeed.pageInfo.totalPages);
                            }}
                            className={isTransitioning ? "opacity-50 cursor-not-allowed" : ""}
                          >
                            {portfolioFeed.pageInfo.totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      {/* Next button */}
                      {currentPage < portfolioFeed.pageInfo.totalPages && (
                        <PaginationItem>
                          <PaginationNext 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isTransitioning) handlePageChange(currentPage + 1);
                            }} 
                            className={isTransitioning ? "opacity-50 cursor-not-allowed" : ""}
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium mb-2">No Portfolios Found</h3>
              {searchQuery ? (
                <p className="text-gray-600 mb-4">
                  No portfolios match your search criteria.
                </p>
              ) : (
                <p className="text-gray-600 mb-4">
                  {isLoading ? 
                    'Loading portfolios...' : 
                    'There are no public or premium portfolios available right now.'}
                </p>
              )}
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={() => navigate('/portfolio')}
                  disabled={isTransitioning}
                >
                  Create Your Own Portfolio
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/portfolio-subscriptions')}
                  disabled={isTransitioning}
                >
                  View Premium Portfolios
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioBrowser;