// src/components/payment/PortfolioSubscriptionPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Star, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SubscribablePortfolio, Creator } from '@/types/subscription';
import creatorSubscriptionApi from '@/services/creatorSubscriptionApi';
import portfolioApi from '@/services/portfolioApi';
import { profileAPI } from '@/services/profileApi';
import { PortfolioVisibility } from '@/constants/portfolioVisibility';
import { getUserData } from '@/services/auth.service';

const PortfolioSubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [subscribablePortfolios, setSubscribablePortfolios] = useState<SubscribablePortfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // In the useEffect where you fetch portfolios
useEffect(() => {
  const fetchSubscribablePortfolios = async () => {
    setIsLoading(true);
    try {
      // Fetch paid portfolios from your API
      console.log("Fetching paid portfolios...");
      const paidPortfolios = await portfolioApi.getPortfoliosByVisibility(PortfolioVisibility.PAID);
      
      // Get user's active subscriptions
      let subscribedPortfolioIds: string[] = [];
      try {
        subscribedPortfolioIds = await creatorSubscriptionApi.getMySubscribedPortfolios();
      } catch (error) {
        console.warn('Could not fetch subscriptions, assuming none:', error);
      }
      
      // Extract userIds from portfolios
      const userIds = paidPortfolios
        .filter(portfolio => portfolio && portfolio.userId)
        .map(portfolio => String(portfolio.userId))
        .filter(id => id && id !== 'undefined' && id !== 'null');
      
      // Fetch user profiles and build map
      const userDataMap = new Map();
      // ... (your existing user profile fetching code)
      
      // Transform portfolios and fetch pricing data for each
      const transformedPortfoliosPromises = paidPortfolios.map(async portfolio => {
        const userId = portfolio.userId ? String(portfolio.userId) : 'unknown';
        const userData = userDataMap.get(userId);
        const displayName = userData?.displayName || 
          (userId !== 'unknown' ? `User ${userId.substring(0, 8)}` : 'Unknown User');
        const isSubscribed = subscribedPortfolioIds.includes(portfolio.id);
        
        // Fetch real pricing data for this portfolio
        let pricing = {
          monthly: 9.99, // Default fallback values
          annual: 99.99,
          currency: 'USD',
          offerTrial: true,
          trialDays: 7
        };
        
        try {
          const priceData = await creatorSubscriptionApi.getPortfolioSubscriptionPrice(portfolio.id);
          if (priceData) {
            pricing = {
              monthly: priceData.monthlyPrice,
              annual: priceData.annualPrice,
              currency: priceData.currency || 'USD',
              offerTrial: priceData.offerTrial,
              trialDays: priceData.trialDays
            };
          }
        } catch (error) {
          console.warn(`Could not fetch pricing for portfolio ${portfolio.id}:`, error);
        }
        
        return {
          id: portfolio.id,
          name: portfolio.name || 'Unnamed Portfolio',
          description: portfolio.description || 'No description available',
          creator: {
            id: userId,
            displayName: displayName,
            avatarUrl: userData?.avatarUrl || null
          },
          price: pricing,
          isSubscribed: isSubscribed
        };
      });
      
      // Wait for all pricing data to be fetched
      const transformedPortfolios = await Promise.all(transformedPortfoliosPromises);
      
      console.log("Final transformed portfolios with real pricing:", transformedPortfolios);
      setSubscribablePortfolios(transformedPortfolios);
    } catch (error) {
      console.error('Error fetching subscribable portfolios:', error);
      toast.error('Failed to load premium portfolios');
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchSubscribablePortfolios();
}, []);

  const handleViewPortfolio = (portfolioId: string) => {
    navigate(`/portfolio/view/${portfolioId}`);
  };

  const filteredPortfolios = () => {
    let filtered = [...subscribablePortfolios];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.creator.displayName.toLowerCase().includes(query)
      );
    }
    
    // Apply tab filters
    if (activeTab === 'subscribed') {
      filtered = filtered.filter(p => p.isSubscribed);
    }
    
    return filtered;
  };

  // The rest of your component remains the same...
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-3">Loading premium portfolios...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Premium Portfolios</h1>
          <p className="text-gray-600">Subscribe to expert investment portfolios</p>
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
            onClick={() => navigate('/portfolios/public')}
          >
            Public Portfolios
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex justify-center space-x-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="subscribed">
            <Star className="h-4 w-4 mr-1" />
            My Subscriptions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="pt-4">
          {filteredPortfolios().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPortfolios().map(portfolio => (
                <Card key={portfolio.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                      {portfolio.isSubscribed && (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" /> Subscribed
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm">
                      by {portfolio.creator.displayName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm line-clamp-3 min-h-[60px]">
                      {portfolio.description}
                    </p>
                    
                    <div className="mt-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Monthly:</span>
                        <span className="font-medium">
                          ${parseFloat(portfolio.price.monthly.toString()).toFixed(2)}/month

                        </span>
                      </div>
                      
                      <div className="flex justify-between mt-1">
                        <span className="text-gray-500">Annual:</span>
                        <span className="font-medium">
                          ${parseFloat(portfolio.price.annual.toString()).toFixed(2)}/year
                        </span>
                      </div>
                      
                      {portfolio.price.offerTrial && (
                        <div className="mt-2 text-xs text-green-600">
                          Includes {portfolio.price.trialDays}-day free trial
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={() => handleViewPortfolio(portfolio.id)}
                    >
                      {portfolio.isSubscribed ? "View Portfolio" : "View Subscription Options"}
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
              ) : activeTab === 'subscribed' ? (
                <p className="text-gray-600 mb-4">
                  You haven't subscribed to any premium portfolios yet.
                </p>
              ) : (
                <p className="text-gray-600 mb-4">
                  There are no premium portfolios available right now.
                </p>
              )}
              <div className="flex flex-col items-center gap-3">
                <Button onClick={() => navigate('/portfolios/public')}>
                  Browse Public Portfolios
                </Button>
                <p className="text-sm text-gray-500">or</p>
                <Button variant="outline" onClick={() => navigate('/portfolio')}>
                  Create Your Own Portfolio
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioSubscriptionPage;