import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Lock, 
  Unlock, 
  CreditCard,
  Calendar,
  User,
  CheckCircle
} from 'lucide-react';

const PortfolioSubscription = () => {
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Portfolio info - In a real implementation, this would come from props or API
  const portfolio = {
    id: 'portfolio-123',
    name: 'Growth Tech Portfolio',
    creator: 'Jane Smith',
    description: 'A curated selection of high-growth technology stocks and ETFs focused on innovation.',
    isPublic: false,
    isPaid: true,
    pricing: {
      monthly: 9.99,
      annual: 99.99
    },
    stats: {
      returns: '+18.7%',
      timeframe: '1 year',
      holdings: 14
    }
  };
  
  const subscriptionFeatures = [
    'Exclusive access to all portfolio holdings',
    'Real-time updates on buys and sells',
    'Detailed analysis on each position',
    'Monthly performance reports',
    'Priority support'
  ];
  
  const handleSubscribe = async () => {
    setIsProcessing(true);
    
    try {
      // In a real app, this would call your backend API to process the subscription
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful subscription
      setIsSubscribed(true);
      setShowSubscribeModal(false);
    } catch (error) {
      console.error('Subscription error:', error);
      // Handle error 
    } finally {
      setIsProcessing(false);
    }
  };
  
  const renderSubscriptionOptions = () => {
    return (
      <Tabs defaultValue="monthly" value={selectedCycle} onValueChange={setSelectedCycle} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="annual">Annual</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly" className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold">${portfolio.pricing.monthly}</div>
            <div className="text-gray-500 dark:text-gray-400">per month</div>
          </div>
          
          <ul className="space-y-2">
            {subscriptionFeatures.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          <div className="text-sm text-gray-500">
            Cancel anytime. No long-term commitment.
          </div>
        </TabsContent>
        
        <TabsContent value="annual" className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold">${portfolio.pricing.annual}</div>
            <div className="text-gray-500 dark:text-gray-400">per year</div>
            <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              Save ${Math.round((portfolio.pricing.monthly * 12) - portfolio.pricing.annual)}
            </Badge>
          </div>
          
          <ul className="space-y-2">
            {subscriptionFeatures.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          <div className="text-sm text-gray-500">
            Cancel anytime. Full refund available within 7 days.
          </div>
        </TabsContent>
      </Tabs>
    );
  };
  
  return (
    <>
      <div className="space-y-6">
        {/* Portfolio Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{portfolio.name}</CardTitle>
                <CardDescription>By {portfolio.creator}</CardDescription>
              </div>
              {portfolio.isPaid && !isSubscribed && (
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Premium
                </Badge>
              )}
              {isSubscribed && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Subscribed
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{portfolio.description}</p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-green-600">{portfolio.stats.returns}</div>
                <div className="text-xs text-gray-500">{portfolio.stats.timeframe} returns</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                <div className="text-lg font-bold">{portfolio.stats.holdings}</div>
                <div className="text-xs text-gray-500">Holdings</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                <div className="text-lg font-bold">
                  {portfolio.isPublic ? (
                    <Unlock className="h-5 w-5 text-green-600 mx-auto" />
                  ) : (
                    <Lock className="h-5 w-5 text-orange-600 mx-auto" />
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {portfolio.isPublic ? 'Public' : 'Private'}
                </div>
              </div>
            </div>
            
            {/* Access Message */}
            {portfolio.isPaid && !isSubscribed ? (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                <Lock className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                <h3 className="font-medium mb-1">Premium Portfolio</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Subscribe to access this exclusive portfolio with detailed analysis and real-time updates.
                </p>
                <Button onClick={() => setShowSubscribeModal(true)}>
                  Subscribe Now
                </Button>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <h3 className="font-medium mb-1 text-green-800 dark:text-green-300">
                  {isSubscribed ? 'You have access to this portfolio' : 'Public Portfolio'}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400 mb-4">
                  {isSubscribed 
                    ? 'You can view all holdings, analysis, and updates for this portfolio.' 
                    : 'This portfolio is publicly available to all users.'}
                </p>
                <Button variant="outline">
                  View Portfolio
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Subscription Details (Shown for subscribed users) */}
        {isSubscribed && (
          <Card>
            <CardHeader>
              <CardTitle>Your Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 pb-4 border-b dark:border-gray-700">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                  <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-medium">Current Plan</div>
                  <div className="text-sm text-gray-500">
                    {selectedCycle === 'monthly' ? 'Monthly' : 'Annual'} - ${selectedCycle === 'monthly' ? portfolio.pricing.monthly : portfolio.pricing.annual}/{selectedCycle === 'monthly' ? 'month' : 'year'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 pb-4 border-b dark:border-gray-700">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-medium">Next Billing Date</div>
                  <div className="text-sm text-gray-500">
                    {new Date(Date.now() + 2592000000).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                  <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="font-medium">Subscription Status</div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Active
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 items-start">
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20">
                Cancel Subscription
              </Button>
              <div className="text-xs text-gray-500">
                Your subscription will continue until the end of the current billing period.
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
      
      {/* Subscribe Modal */}
      <Dialog open={showSubscribeModal} onOpenChange={setShowSubscribeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subscribe to {portfolio.name}</DialogTitle>
            <DialogDescription>
              Choose your subscription plan to access this premium portfolio.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {renderSubscriptionOptions()}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscribeModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubscribe} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : `Subscribe for $${selectedCycle === 'monthly' ? portfolio.pricing.monthly : portfolio.pricing.annual}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PortfolioSubscription;