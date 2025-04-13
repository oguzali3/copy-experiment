/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/subscription/PortfolioPricingManager.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Disc, 
  DollarSign, 
  Info, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Eye,
  Lock
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  initializeSubscriptionSetup, 
  savePricingSettings,
  PricingSettings,
  PortfolioWithVisibility,
  fetchPortfoliosWithVisibility,
  fetchPortfolioPrices
} from '@/utils/portfolioSubscriptionUtils';
import { PortfolioVisibility } from '@/constants/portfolioVisibility';
import CreatorSubscriptionAPI from '@/services/creatorSubscriptionApi';
import SubscriptionAPI from '@/services/subscriptionApi';
import portfolioApi from '@/services/portfolioApi';
import StripeConnectService from '@/services/stripeConnectApi';

const PortfolioPricingManager = () => {
  const navigate = useNavigate();
  
  const [portfolios, setPortfolios] = useState<PortfolioWithVisibility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isStripeConnected, setIsStripeConnected] = useState(false);
  const [selectedTab, setSelectedTab] = useState('pricing');
  const [hasCreatorSubscription, setHasCreatorSubscription] = useState(false);
  const [currentSubscriptionTier, setCurrentSubscriptionTier] = useState<string | null>(null);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<Record<string, boolean>>({});
  const [visibilityUpdateStatus, setVisibilityUpdateStatus] = useState<Record<string, string>>({});
  const [portfolioPricing, setPortfolioPricing] = useState<Record<string, PricingSettings>>({});
  const [selectedPreviewPortfolio, setSelectedPreviewPortfolio] = useState<string | null>(null);

  // Pricing state
  const [pricing, setPricing] = useState<PricingSettings>({
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    offerDiscount: true,
    discountPercentage: 17,
    currency: 'USD',
    freeTrialDays: 7,
    enableFreeTrial: true,
    billingCycleDefault: 'monthly'
  });
  
  // Load current subscription and check for Creator tier
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        setIsCheckingSubscription(true);
        
        // Get the user's current subscription
        const currentSubscription = await SubscriptionAPI.getCurrentSubscription();
        
        // Check if they have a Creator tier subscription
        const isCreator = currentSubscription?.subscription?.tier === 'CREATOR';
        setHasCreatorSubscription(isCreator);
        setCurrentSubscriptionTier(currentSubscription?.subscription?.tier || null);
        
        console.log(`Current subscription tier: ${currentSubscription?.subscription?.tier || 'None'}`);
        console.log(`Has Creator subscription: ${isCreator}`);
      } catch (err) {
        console.error('Error checking subscription status:', err);
      } finally {
        setIsCheckingSubscription(false);
      }
    };
    
    checkSubscription();
  }, []);
  
  // Load subscription data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get Stripe connection status
        const stripeStatus = await StripeConnectService.getAccountStatus();
        setIsStripeConnected(stripeStatus.isConnected && stripeStatus.charges_enabled);
        
        // Get portfolios with visibility
        const fetchedPortfolios = await fetchPortfoliosWithVisibility();
        setPortfolios(fetchedPortfolios);
        
        // Initialize the preview with the first paid portfolio if there is one
        const firstPaidPortfolio = fetchedPortfolios.find(p => p.visibility === PortfolioVisibility.PAID);
        if (firstPaidPortfolio) {
          setSelectedPreviewPortfolio(firstPaidPortfolio.id);
        }

        // Get pricing for each portfolio
        const priceData = await fetchPortfolioPrices(fetchedPortfolios);
        const pricingSettings: Record<string, PricingSettings> = {};
        
        // Convert API price data to component pricing format
        Object.entries(priceData).forEach(([portfolioId, price]) => {
          pricingSettings[portfolioId] = {
            monthlyPrice: price.monthlyPrice,                   // Use our field name
            annualPrice: price.annualPrice,                     // Use our field name
            offerDiscount: true,
            discountPercentage: calculateDiscountPercentage(price.monthlyPrice, price.annualPrice),
            currency: price.currency,
            freeTrialDays: price.trialDays || 7,
            enableFreeTrial: price.offerTrial,
            billingCycleDefault: 'monthly'
          };
        });
        
        setPortfolioPricing(pricingSettings);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading subscription data:', err);
        setError('Failed to load your subscription settings. Please try again.');
        toast.error('Failed to load subscription settings');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Calculate annual price based on monthly price and discount
  useEffect(() => {
    if (pricing.offerDiscount) {
      const annualPrice = +(pricing.monthlyPrice * 12 * (1 - pricing.discountPercentage / 100)).toFixed(2);
      setPricing(prev => ({ ...prev, annual: annualPrice }));
    }
  }, [pricing.monthlyPrice, pricing.discountPercentage, pricing.offerDiscount]);
  
  // Clear success message after 3 seconds
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);
  
  const handlePricingChange = (field: string, value: any) => {
    setPricing(prev => ({ ...prev, [field]: value }));
  };
  
  const handlePortfolioInclusionChange = (portfolioId: string, included: boolean) => {
    setPortfolios(prevPortfolios => 
      prevPortfolios.map(portfolio => 
        portfolio.id === portfolioId 
          ? { ...portfolio, included } 
          : portfolio
      )
    );
  };
  
  // Helper function to determine the exact error message and action
  const getErrorDetails = (error: any) => {
    // Check for Creator subscription requirement
    if (error?.response?.data?.message === 'You need a CREATOR subscription to set portfolio prices') {
      return {
        title: 'Creator Subscription Required',
        message: 'You need a Creator subscription to monetize your portfolios. Please upgrade your subscription plan.',
        action: {
          label: 'Upgrade Subscription',
          handler: () => navigate('/subscriptions')
        }
      };
    }
    
    
    // Check for Stripe metadata error
    if (
      error?.response?.data?.message?.includes('metadata') || 
      error?.message?.includes('metadata') ||
      error?.response?.data?.message?.includes('expanded') ||
      error?.message?.includes('expanded')
    ) {
      return {
        title: 'Stripe Configuration Error',
        message: 'There was a technical issue with the Stripe integration. Our team has been notified. Please try again later.',
        action: null
      };
    }
    
    // Default error
    return {
      title: 'Error Saving Settings',
      message: error?.response?.data?.message || 'An unexpected error occurred. Please try again.',
      action: null
    };
  };
  // Add these state variables to your component
  const handlePortfolioPriceChange = (portfolioId: string, field: string, value: any) => {
    setPortfolioPricing(prev => {
      // Ensure we have an entry for this portfolio
      const portfolioSettings = prev[portfolioId] || {
        monthlyPrice: 9.99,
        annualPrice: 99.99,
        offerDiscount: true,
        discountPercentage: 17,
        currency: 'USD',
        freeTrialDays: 7,
        enableFreeTrial: true,
        billingCycleDefault: 'monthly'
      };
      
      // Create a new object rather than mutating the old one
      const updatedSettings = { ...portfolioSettings, [field]: value };
      
      // If monthly price changes and discount is enabled, recalculate annual price
      if (field === 'monthlyPrice' && updatedSettings.offerDiscount) {
        updatedSettings.annualPrice = +(updatedSettings.monthlyPrice * 12 * 
          (1 - updatedSettings.discountPercentage / 100)).toFixed(2);
      }
      
      // Return a new object to ensure React detects the state change
      return { ...prev, [portfolioId]: updatedSettings };
    });
  };
  const handleVisibilityChange = async (portfolioId: string, visibility: PortfolioVisibility) => {
    try {
      // Find the portfolio to update
      const portfolio = portfolios.find(p => p.id === portfolioId);
      if (!portfolio) return;
      
      // Update local state to show updating status
      setIsUpdatingVisibility(prev => ({ ...prev, [portfolioId]: true }));
      setVisibilityUpdateStatus(prev => ({ ...prev, [portfolioId]: 'Updating...' }));
      
      // First update local UI optimistically
      setPortfolios(prevPortfolios => 
        prevPortfolios.map(p => p.id === portfolioId ? { ...p, visibility } : p)
      );
      
      // Make the API request to update visibility
      await portfolioApi.updatePortfolio(portfolioId, {
        name: portfolio.name,
        visibility
      });
      
      // If changing to PAID, also update pricing if it exists
      if (visibility === PortfolioVisibility.PAID && !portfolioPricing[portfolioId]) {
        setPortfolioPricing(prev => ({
          ...prev,
          [portfolioId]: {
            monthlyPrice: 9.99,
            annualPrice: 99.99,
            offerDiscount: true,
            discountPercentage: 17,
            currency: 'USD',
            freeTrialDays: 7,
            enableFreeTrial: true,
            billingCycleDefault: 'monthly'
          }
        }));
      }
      
      // Make the API request to update visibility
      await portfolioApi.updatePortfolio(portfolioId, {
        name: portfolio.name,
        visibility
      });
      
      // Show success status
      setVisibilityUpdateStatus(prev => ({ ...prev, [portfolioId]: 'Successfully updated' }));
      
      // Clear the status after 3 seconds
      setTimeout(() => {
        setVisibilityUpdateStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[portfolioId];
          return newStatus;
        });
      }, 3000);
      
      // Refresh portfolios
      const updatedPortfolios = await fetchPortfoliosWithVisibility();
      setPortfolios(updatedPortfolios);
      
      // Refresh pricing data for the updated portfolio list
      if (visibility === PortfolioVisibility.PAID) {
        const priceData = await fetchPortfolioPrices([
          {id: portfolioId, name: portfolio.name, visibility, included: true}
        ]);
        
        if (Object.keys(priceData).length > 0) {
          setPortfolioPricing(prev => {
            const convertedPriceData: Record<string, PricingSettings> = {};
            
            // Convert each PortfolioSubscriptionPrice to PricingSettings
            Object.entries(priceData).forEach(([portfolioId, price]) => {
              convertedPriceData[portfolioId] = {
                monthlyPrice: price.monthlyPrice,
                annualPrice: price.annualPrice,
                offerDiscount: true,
                discountPercentage: calculateDiscountPercentage(price.monthlyPrice, price.annualPrice),
                currency: price.currency || 'USD',
                freeTrialDays: price.trialDays || 7,
                enableFreeTrial: price.offerTrial || false,
                billingCycleDefault: 'monthly'
              };
            });
            
            // Return a new state object with the converted data
            return {...prev, ...convertedPriceData};
          });
        }
      }
      
    } catch (error) {
      console.error('Error updating portfolio visibility:', error);
      
      // Revert the local state change
      setPortfolios(prevPortfolios => 
        prevPortfolios.map(p => {
          if (p.id === portfolioId) {
            const portfolio = portfolios.find(orig => orig.id === portfolioId);
            return portfolio || p;
          }
          return p;
        })
      );
      
      // Show error
      setVisibilityUpdateStatus(prev => ({ ...prev, [portfolioId]: 'Update failed' }));
      toast.error('Failed to update portfolio visibility');
      
    } finally {
      // Clear updating state
      setIsUpdatingVisibility(prev => {
        const newState = { ...prev };
        delete newState[portfolioId];
        return newState;
      });
      
      // Clear error status after delay
      setTimeout(() => {
        setVisibilityUpdateStatus(prev => {
          if (prev[portfolioId]) {
            const newStatus = { ...prev };
            delete newStatus[portfolioId];
            return newStatus;
          }
          return prev;
        });
      }, 3000);
    }
  };
  const handleSaveSettings = async () => {
    // Don't allow saving if they don't have Creator subscription
    if (!hasCreatorSubscription) {
      setError('You need a Creator subscription to monetize your portfolios.');
      toast.error('Creator subscription required');
      navigate('/subscriptions');
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      
      // Get only paid portfolios
      const paidPortfolios = portfolios.filter(p => 
        p.visibility === PortfolioVisibility.PAID && p.included
      );
      
      if (paidPortfolios.length === 0) {
        toast.info('No paid portfolios to update pricing for');
        setIsSaving(false);
        return;
      }
      
      const results = await savePricingSettings(paidPortfolios, portfolioPricing);

      
      // Save pricing for each portfolio
      for (const portfolio of paidPortfolios) {
        try {
          // Get pricing for this portfolio (use defaults if not set)
          const pricing = portfolioPricing[portfolio.id] || {
            monthlyPrice: 9.99,
            annualPrice: 99.99,
            offerDiscount: true,
            discountPercentage: 17,
            currency: 'USD',
            freeTrialDays: 7,
            enableFreeTrial: true,
            billingCycleDefault: 'monthly'
          };
          
          console.log(`Saving pricing for portfolio ${portfolio.id} (${portfolio.name}):`, pricing);
          
          // Make API call to save pricing settings for this portfolio
          const pricingDto = {
            monthlyPrice: pricing.monthlyPrice,
            annualPrice: pricing.annualPrice,
            currency: pricing.currency,
            isActive: true,
            offerTrial: pricing.enableFreeTrial,
            trialDays: pricing.freeTrialDays,
            description: `Subscription to ${portfolio.name}`
          };
          
          await CreatorSubscriptionAPI.setPortfolioSubscriptionPrice(
            portfolio.id,
            pricingDto
          );
          
          results.updatedPortfolios.push(portfolio.id);
        } catch (err) {
          console.error(`Failed to update pricing for portfolio ${portfolio.id}:`, err);
          results.failedPortfolios.push(portfolio.id);
          
          // If any portfolio fails, mark overall success as false
          results.success = false;
        }
      }
      
      if (results.success) {
        setShowSuccessMessage(true);
        toast.success('Subscription settings saved successfully');
      } else {
        // If any failed, show a warning
        if (results.failedPortfolios.length > 0) {
          toast.warning(`Failed to update ${results.failedPortfolios.length} portfolios`);
        }
        
        if (results.updatedPortfolios.length > 0) {
          toast.success(`Successfully updated ${results.updatedPortfolios.length} portfolios`);
        }
      }
      
      // Refresh the portfolio data
      const refreshedPortfolios = await fetchPortfoliosWithVisibility();
      setPortfolios(refreshedPortfolios);
      
      // Refresh pricing data
      const priceData = await fetchPortfolioPrices(refreshedPortfolios);
      const pricingSettings: Record<string, PricingSettings> = {};
      
      // Convert API price data to component pricing format
      Object.entries(priceData).forEach(([portfolioId, price]) => {
        pricingSettings[portfolioId] = {
          monthlyPrice: price.monthlyPrice,
          annualPrice: price.annualPrice,
          offerDiscount: true,
          discountPercentage: calculateDiscountPercentage(price.monthlyPrice, price.annualPrice),
          currency: price.currency,
          freeTrialDays: price.trialDays || 7,
          enableFreeTrial: price.offerTrial,
          billingCycleDefault: 'monthly'
        };
      });
      
      setPortfolioPricing(pricingSettings);
      
    } catch (err) {
      console.error('Error in save settings handler:', err);
      setError('An unexpected error occurred. Please try again.');
      toast.error('Failed to save subscription settings');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Helper to calculate discount percentage
  const calculateDiscountPercentage = (monthly: number, annual: number): number => {
    if (monthly <= 0) return 0;
    const annualCost = monthly * 12;
    const discountAmount = annualCost - annual;
    return Math.round((discountAmount / annualCost) * 100);
  };
  
  // Loading state
  if (isLoading || isCheckingSubscription) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
        <span>Loading subscription settings...</span>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
    <div className="flex-none space-y-4 mb-4">
      <div>
        <h2 className="text-xl font-bold mb-1">Subscription Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure how subscribers can access your premium portfolios
        </p>
      </div>
      
      {/* Creator Subscription Required Banner */}
      {!hasCreatorSubscription && (
        <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Creator Subscription Required</AlertTitle>
          <AlertDescription className="flex flex-col space-y-2">
            <p>You need a Creator subscription to monetize your portfolios. {currentSubscriptionTier ? `Your current plan (${currentSubscriptionTier}) does not include monetization features.` : 'Please upgrade to enable subscription features.'}</p>
            <Button 
              variant="outline" 
              className="self-start mt-2 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
              onClick={() => navigate('/subscriptions')}
            >
              Upgrade Subscription
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Stripe Connection Warning */}
      {hasCreatorSubscription && !isStripeConnected && (
        <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
          <Info className="h-4 w-4" />
          <AlertTitle>Connect payment processing</AlertTitle>
          <AlertDescription>
            You need to connect your Stripe account to enable subscription payments.
            <Button 
              variant="link" 
              className="px-0 text-yellow-800 dark:text-yellow-300"
              onClick={() => navigate('/creator/payments?tab=connect')}
            >
              Set up Stripe now
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Success Message */}
      {showSuccessMessage && (
        <Alert className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Settings saved successfully</AlertTitle>
          <AlertDescription>
            Your subscription settings have been updated.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="pricing" value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="portfolios">Portfolio Access</TabsTrigger>
          <TabsTrigger value="preview">Subscriber View</TabsTrigger>
        </TabsList>
        
        
        
       {/* Portfolio Access Tab */}
       <TabsContent value="portfolios" className="flex-grow flex flex-col">
       <Card className="flex flex-col flex-grow overflow-hidden">
          <CardHeader className="flex-none">
            <CardTitle>Portfolio Access Control</CardTitle>
            <CardDescription>
              Manage which portfolios are available to your subscribers
            </CardDescription>
          </CardHeader>
          <div className="relative">
          <CardContent className="flex-grow overflow-auto pb-0">

            <div className="space-y-2">
              <Label>Portfolio Visibility Settings</Label>
              <p className="text-sm text-gray-500">
                Choose which portfolios to make public, private, or available to paid subscribers
              </p>
            </div>
            
            {portfolios.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>No portfolios found. Create portfolios to start managing their visibility.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/portfolio')}
                >
                  Create Portfolio
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {portfolios.map((portfolio) => (
                  <div key={portfolio.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{portfolio.name}</h3>
                    
                    <Select
                      value={portfolio.visibility}
                      onValueChange={(value) => handleVisibilityChange(portfolio.id, value as PortfolioVisibility)}
                      disabled={isUpdatingVisibility[portfolio.id] || !hasCreatorSubscription}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PortfolioVisibility.PRIVATE}>
                          <div className="flex items-center">
                            <Lock className="h-4 w-4 mr-2" />
                            <span>Private</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={PortfolioVisibility.PUBLIC}>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-2" />
                            <span>Public</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={PortfolioVisibility.PAID}>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            <span>Paid Subscription</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Description of current visibility setting */}
                  <div className="text-sm text-gray-500">
                    {portfolio.visibility === PortfolioVisibility.PRIVATE && "Only you can view this portfolio"}
                    {portfolio.visibility === PortfolioVisibility.PUBLIC && "Anyone can view this portfolio for free"}
                    {portfolio.visibility === PortfolioVisibility.PAID && "Subscribers who pay will have access to this portfolio"}
                  </div>
                  
                  {/* Pricing configuration - only shown for PAID portfolios */}
                  {portfolio.visibility === PortfolioVisibility.PAID && (
                    <div className="mt-4 pt-4 border-t dark:border-gray-700">
                      <h4 className="font-medium mb-3">Subscription Pricing</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Monthly pricing */}
                        <div className="space-y-2">
                          <Label htmlFor={`monthly-${portfolio.id}`}>Monthly Price</Label>
                          <div className="flex">
                            <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                              <DollarSign className="h-4 w-4 text-gray-500" />
                            </div>
                            <Input
                              id={`monthly-${portfolio.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              className="rounded-l-none"
                              value={portfolioPricing[portfolio.id]?.monthlyPrice || 9.99}
                              onChange={(e) => {
                                const newMonthlyPrice = parseFloat(e.target.value) || 0;
                                handlePortfolioPriceChange(portfolio.id, 'monthlyPrice', newMonthlyPrice);
                                
                                // Auto-calculate annual price based on discount
                                if (portfolioPricing[portfolio.id]?.offerDiscount) {
                                  const discountPercentage = portfolioPricing[portfolio.id]?.discountPercentage || 17;
                                  const newAnnualPrice = +(newMonthlyPrice * 12 * (1 - discountPercentage / 100)).toFixed(2);
                                  handlePortfolioPriceChange(portfolio.id, 'annualPrice', newAnnualPrice);
                                }
                              }}
                              disabled={!hasCreatorSubscription}
                            />
                          </div>
                        </div>
                        
                        {/* Annual pricing */}
                        <div className="space-y-2">
                          <Label htmlFor={`annual-${portfolio.id}`}>Annual Price</Label>
                          <div className="flex">
                            <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                              <DollarSign className="h-4 w-4 text-gray-500" />
                            </div>
                            <Input
                              id={`annual-${portfolio.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              className="rounded-l-none"
                              value={portfolioPricing[portfolio.id]?.annualPrice || 99.99}
                              onChange={(e) => handlePortfolioPriceChange(portfolio.id, 'annualPrice', parseFloat(e.target.value) || 0)}
                              disabled={!hasCreatorSubscription}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Annual discount control */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor={`discount-${portfolio.id}`}>Annual Discount</Label>
                            <div className="text-xs text-gray-500">Set discount percentage for annual plans</div>
                          </div>
                          <Switch
                            id={`discount-${portfolio.id}`}
                            checked={portfolioPricing[portfolio.id]?.offerDiscount || false}
                            onCheckedChange={(checked) => {
                              handlePortfolioPriceChange(portfolio.id, 'offerDiscount', checked);
                              
                              // If enabling discount, calculate annual price based on discount percentage
                              if (checked) {
                                const monthlyPrice = portfolioPricing[portfolio.id]?.monthlyPrice || 9.99;
                                const discountPercentage = portfolioPricing[portfolio.id]?.discountPercentage || 17;
                                const newAnnualPrice = +(monthlyPrice * 12 * (1 - discountPercentage / 100)).toFixed(2);
                                handlePortfolioPriceChange(portfolio.id, 'annualPrice', newAnnualPrice);
                              }
                            }}
                            disabled={!hasCreatorSubscription}
                          />
                        </div>
                        
                        {/* Discount percentage slider - only show if discount is enabled */}
                        {portfolioPricing[portfolio.id]?.offerDiscount && (
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor={`discount-percentage-${portfolio.id}`}>Discount: {portfolioPricing[portfolio.id]?.discountPercentage || 17}%</Label>
                              <span className="text-sm text-gray-500">
                                Save ${((portfolioPricing[portfolio.id]?.monthlyPrice || 9.99) * 12 - (portfolioPricing[portfolio.id]?.annualPrice || 99.99)).toFixed(2)}/year
                              </span>
                            </div>
                            
                            <Input
                              id={`discount-percentage-${portfolio.id}`}
                              type="range"
                              min="1"
                              max="50"
                              step="1"
                              value={portfolioPricing[portfolio.id]?.discountPercentage || 17}
                              onChange={(e) => {
                                const newDiscountPercentage = parseInt(e.target.value);
                                handlePortfolioPriceChange(portfolio.id, 'discountPercentage', newDiscountPercentage);
                                
                                // Update annual price based on new discount
                                const monthlyPrice = portfolioPricing[portfolio.id]?.monthlyPrice || 9.99;
                                const newAnnualPrice = +(monthlyPrice * 12 * (1 - newDiscountPercentage / 100)).toFixed(2);
                                handlePortfolioPriceChange(portfolio.id, 'annualPrice', newAnnualPrice);
                              }}
                              disabled={!hasCreatorSubscription}
                              className="cursor-pointer"
                            />
                            
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>1%</span>
                              <span>25%</span>
                              <span>50%</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Free Trial toggle */}
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <Label htmlFor={`trial-${portfolio.id}`}>Free Trial</Label>
                        </div>
                        <Switch
                          id={`trial-${portfolio.id}`}
                          checked={portfolioPricing[portfolio.id]?.enableFreeTrial || false}
                          onCheckedChange={(checked) => handlePortfolioPriceChange(portfolio.id, 'enableFreeTrial', checked)}
                          disabled={!hasCreatorSubscription}
                        />
                      </div>
                      
                      {/* Trial days - conditional */}
                      {portfolioPricing[portfolio.id]?.enableFreeTrial && (
                        <div className="mt-2">
                          <Label htmlFor={`trial-days-${portfolio.id}`}>Trial Days</Label>
                          <Input
                            id={`trial-days-${portfolio.id}`}
                            type="number"
                            min="1"
                            max="30"
                            className="w-24 mt-1"
                            value={portfolioPricing[portfolio.id]?.freeTrialDays || 7}
                            onChange={(e) => handlePortfolioPriceChange(portfolio.id, 'freeTrialDays', parseInt(e.target.value) || 7)}
                            disabled={!hasCreatorSubscription}
                          />
                        </div>
                      )}
                      
                      {/* Currency selection */}
                      <div className="mt-4">
                        <Label htmlFor={`currency-${portfolio.id}`}>Currency</Label>
                        <Select
                          value={portfolioPricing[portfolio.id]?.currency || 'USD'}
                          onValueChange={(value) => handlePortfolioPriceChange(portfolio.id, 'currency', value)}
                          disabled={!hasCreatorSubscription}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                            <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
                ))}
              </div>
            )}
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-sm text-green-800 dark:text-green-300">
              <CheckCircle className="h-4 w-4 inline mr-1" />
              <span className="font-medium">Pro Tip:</span>
              <p className="mt-1">
                Make a few portfolios public to showcase your expertise, then offer your best-performing portfolios as premium paid content.
              </p>
            </div>
          </CardContent>
          </div>
          <CardFooter className="flex-none justify-between mt-4 pt-4 border-t">
            <Button 
              variant="outline"
              onClick={() => navigate('/portfolio-subscriptions')}
            >
              Manage Portfolio Visibility
            </Button>
            <Button 
              onClick={handleSaveSettings} 
              disabled={isSaving || !isStripeConnected || !hasCreatorSubscription}
            >
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {isSaving ? 'Saving...' : 'Save All Pricing Settings'}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
        
        {/* Subscriber View Tab */}
        <TabsContent value="preview" className="flex-grow flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle>Subscriber Preview</CardTitle>
              <CardDescription>
                View how your subscription will appear to potential subscribers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Portfolio selector - only show if there are paid portfolios */}
              {portfolios.filter(p => p.visibility === PortfolioVisibility.PAID).length > 0 ? (
                <div className="mb-6">
                  <Label htmlFor="portfolio-preview-selector">Select portfolio to preview</Label>
                  <Select 
                    onValueChange={(value) => setSelectedPreviewPortfolio(value)}
                    defaultValue={portfolios.find(p => p.visibility === PortfolioVisibility.PAID)?.id}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a portfolio" />
                    </SelectTrigger>
                    <SelectContent>
                      {portfolios
                        .filter(p => p.visibility === PortfolioVisibility.PAID)
                        .map(portfolio => (
                          <SelectItem key={portfolio.id} value={portfolio.id}>
                            {portfolio.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No paid portfolios</AlertTitle>
                  <AlertDescription>
                    You don't have any portfolios set to paid subscription. Set a portfolio to "Paid Subscription" in the Portfolio Access tab to preview it here.
                  </AlertDescription>
                </Alert>
              )}

              {/* Preview card - only show if a portfolio is selected */}
              {selectedPreviewPortfolio && (
                <div className="border rounded-lg p-6 max-w-md mx-auto">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold">
                      {portfolios.find(p => p.id === selectedPreviewPortfolio)?.name || 'Premium Portfolio'}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Exclusive access to professional trading strategies</p>
                  </div>
                  
                  <div className="flex justify-center mb-6">
                    <div className="text-center px-4">
                      <div className="text-3xl font-bold mb-1">
                        ${portfolioPricing[selectedPreviewPortfolio]?.monthlyPrice || pricing.monthlyPrice}
                      </div>
                      <div className="text-gray-500 text-sm">per month</div>
                    </div>
                    
                    {(portfolioPricing[selectedPreviewPortfolio]?.offerDiscount || pricing.offerDiscount) && (
                      <div className="text-center px-4 border-l">
                        <div className="text-3xl font-bold mb-1">
                          ${portfolioPricing[selectedPreviewPortfolio]?.annualPrice || pricing.annualPrice}
                        </div>
                        <div className="text-gray-500 text-sm">per year</div>
                        <Badge className="mt-1 bg-green-100 text-green-800">
                          Save {portfolioPricing[selectedPreviewPortfolio]?.discountPercentage || pricing.discountPercentage}%
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Access to {portfolios.find(p => p.id === selectedPreviewPortfolio)?.name}</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Real-time updates on portfolio changes</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Performance analysis and insights</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Direct access to creator's investing strategy</span>
                    </div>
                  </div>
                  
                  {(portfolioPricing[selectedPreviewPortfolio]?.enableFreeTrial || pricing.enableFreeTrial) && (
                    <div className="text-center text-sm text-gray-500 mb-4">
                      {portfolioPricing[selectedPreviewPortfolio]?.freeTrialDays || pricing.freeTrialDays}-day free trial available
                    </div>
                  )}
                  
                  <Button className="w-full">Subscribe Now</Button>
                </div>
              )}
              
              <div className="text-sm text-gray-500 text-center mt-4">
                This is a preview of how your subscription offering will appear to potential subscribers.
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div></div>
              {!hasCreatorSubscription && (
                <Alert className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
                  <Button 
                    onClick={() => navigate('/subscriptions')}
                    className="gap-2"
                  >
                    Upgrade to Creator
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Alert>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
};

export default PortfolioPricingManager;