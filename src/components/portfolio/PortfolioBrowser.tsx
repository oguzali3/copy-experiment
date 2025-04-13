// PortfolioBrowser.tsx with simplified subscription handling
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import portfolioApi from '@/services/portfolioApi';
import { profileAPI } from '@/services/profileApi';
import { getUserData } from '@/services/auth.service';
import { PortfolioVisibility } from '@/constants/portfolioVisibility';

interface PublicPortfolio {
  id: string;
  name: string;
  description?: string;
  visibility: PortfolioVisibility;
  totalValue: number;
  lastDayChange: number; // Use this instead of dayChangePercent
  lastMonthChange: number;
  lastYearChange: number;
  userId: string;
  createdAt: Date;
  creator?: {
    displayName: string;
    avatarUrl: string | null;
  };
}

const PortfolioBrowser: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [publicPortfolios, setPublicPortfolios] = useState<PublicPortfolio[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchPortfolios = async () => {
      setIsLoading(true);
      try {
        // Fetch portfolios using the new endpoints
        const publicPortfoliosResponse = await portfolioApi.getBasicPortfoliosByVisibility('public');
        let portfoliosData = [...publicPortfoliosResponse];
        
        // Optionally try to get paid portfolios if public fetch was successful
        try {
          const paidPortfoliosResponse = await portfolioApi.getBasicPortfoliosByVisibility('paid');
          // If successful, add them to the array
          portfoliosData = [...portfoliosData, ...paidPortfoliosResponse];
        } catch (paidError) {
          console.warn('Failed to fetch paid portfolios:', paidError);
          // Continue with just the public portfolios
        }
        
        // Get user data for each portfolio owner (same as before)
        const userIds = [...new Set(portfoliosData.map(portfolio => portfolio.userId))]
          .filter(Boolean);
        
        const userDataMap = new Map();
        // ... rest of user data fetching code remains the same
        
        // Transform the portfolios with the new structure
        const transformedPortfolios = portfoliosData.map(portfolio => {
          try {
            const userId = portfolio.userId || 'unknown';            
            const creator = {
              displayName: portfolio.creator?.displayName || 'Unknown User',
              avatarUrl: portfolio.creator?.avatarUrl || null
            };
               
            return {
              id: portfolio.id || 'unknown',
              name: portfolio.name || 'Unnamed Portfolio',
              description: portfolio.description || '',
              visibility: portfolio.visibility || PortfolioVisibility.PUBLIC,
              totalValue: typeof portfolio.totalValue === 'number' ? portfolio.totalValue : 0,
              lastDayChange: typeof portfolio.lastDayChange === 'number' ? portfolio.lastDayChange : 0,
              lastMonthChange: typeof portfolio.lastMonthChange === 'number' ? portfolio.lastMonthChange : 0,
              lastYearChange: typeof portfolio.lastYearChange === 'number' ? portfolio.lastYearChange : 0,
              userId: userId,
              createdAt: portfolio.createdAt || new Date(),
              creator
            };
          } catch (error) {
            console.error('Error transforming portfolio:', error, portfolio);
            // Return a minimal valid object
            return {
              id: portfolio.id || 'unknown',
              name: portfolio.name || 'Error Loading Portfolio',
              description: 'There was an error loading this portfolio.',
              visibility: PortfolioVisibility.PUBLIC,
              totalValue: 0,
              lastDayChange: 0,
              lastMonthChange: 0,
              lastYearChange: 0,
              userId: 'unknown',
              createdAt: new Date(),
              creator: {
                displayName: 'Unknown User',
                avatarUrl: null
              }
            };
          }
        });
        
        setPublicPortfolios(transformedPortfolios);
      } catch (error) {
        console.error('Fatal error fetching portfolios:', error);
        toast.error('Failed to load portfolios. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPortfolios();
  }, []);

  const handleViewPortfolio = (portfolioId: string) => {
    navigate(`/portfolio/view/${portfolioId}`);
  };

  const handleSubscribeClick = () => {
    navigate('/portfolio-subscriptions');
  };

  const filteredPortfolios = () => {
    let filtered = [...publicPortfolios];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description?.toLowerCase().includes(query) ||
        p.creator?.displayName.toLowerCase().includes(query)
      );
    }
    
    // Apply tab filters
    if (activeTab === 'trending') {
      filtered = filtered.filter(p => Math.abs(p.lastDayChange) > 1);
      filtered.sort((a, b) => Math.abs(b.lastDayChange) - Math.abs(a.lastDayChange));
    } else if (activeTab === 'top') {
      filtered.sort((a, b) => b.totalValue - a.totalValue);
    } else if (activeTab === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    return filtered;
  };

  if (isLoading) {
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
            />
          </div>
          <Button 
            variant="outline" 
            className="ml-4"
            onClick={() => navigate('/portfolio-subscriptions')}
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
          >
            View Premium Options
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex justify-center space-x-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="trending">
            <TrendingUp className="h-4 w-4 mr-1" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="top">
            <Zap className="h-4 w-4 mr-1" />
            Top Value
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="h-4 w-4 mr-1" />
            Recently Updated
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="pt-4">
        {filteredPortfolios().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPortfolios().map(portfolio => (
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
                        {/* {portfolio.description || "No description available"} */}
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
                              ${parseFloat(portfolio.totalValue.toString()).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                        
                        {/* Add new performance metrics */}
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-500">1-Day Change:</span>
                          <span className={`font-medium ${portfolio.lastDayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {portfolio.lastDayChange >= 0 ? '+' : ''}{portfolio.lastDayChange.toFixed(2)}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-500">1-Month Change:</span>
                          <span className={`font-medium ${portfolio.lastMonthChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {portfolio.lastMonthChange >= 0 ? '+' : ''}{portfolio.lastMonthChange.toFixed(2)}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-500">1-Year Change:</span>
                          <span className={`font-medium ${portfolio.lastYearChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {portfolio.lastYearChange >= 0 ? '+' : ''}{portfolio.lastYearChange.toFixed(2)}%
                          </span>
                        </div>
                        
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
                <Button onClick={() => navigate('/portfolio')}>
                    Create Your Own Portfolio
                </Button>
                <Button variant="outline" onClick={() => navigate('/portfolio-subscriptions')}>
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