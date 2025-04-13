import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/loaders';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  DollarSign, 
  Eye, 
  EyeOff,
  Lock,
  ArrowRight,
  Info,
  AlertCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import portfolioApi from '@/services/portfolioApi';
import CreatorSubscriptionAPI from '@/services/creatorSubscriptionApi';
import StripeConnectService from '@/services/stripeConnectApi';
import { PortfolioVisibility } from '@/constants/portfolioVisibility';
import { 
  initializeSubscriptionSetup,
  PortfolioWithVisibility 
} from '@/utils/portfolioSubscriptionUtils';

const PortfolioSubscriptionManager = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [portfolios, setPortfolios] = useState<PortfolioWithVisibility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStripeConnected, setIsStripeConnected] = useState(false);
  const [stripeConnectionStatus, setStripeConnectionStatus] = useState({
    needsOnboarding: true,
    isActive: false
  });
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<Record<string, boolean>>({});
  const [visibilityUpdateStatus, setVisibilityUpdateStatus] = useState<Record<string, string>>({});


  // Load portfolios and Stripe status on component mount
  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Use the utility function to get all necessary data
        const setup = await initializeSubscriptionSetup();
        
        setIsStripeConnected(setup.isStripeConnected);
        setStripeConnectionStatus(setup.stripeConnectionStatus);
        setPortfolios(setup.portfolios);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error in portfolio fetch process:', err);
        setError('Failed to load your portfolios. Please try again.');
        toast.error('Failed to load portfolios');
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadSubscriptionData();
    }
  }, [isAuthenticated]);

  // Handle visibility change
  const handleVisibilityChange = async (portfolioId: string, visibility: PortfolioVisibility) => {
    try {
      // Find the portfolio to update
      const portfolio = portfolios.find(p => p.id === portfolioId);
      if (!portfolio) return;
      
      // Update local state to show updating status
      setIsUpdatingVisibility(prev => ({ ...prev, [portfolioId]: true }));
      setVisibilityUpdateStatus(prev => ({ ...prev, [portfolioId]: 'Updating visibility...' }));
      
      // First update local UI optimistically
      setPortfolios(prevPortfolios => 
        prevPortfolios.map(p => p.id === portfolioId ? { ...p, visibility } : p)
      );
      
      // Make the API request
      await portfolioApi.updatePortfolio(portfolioId, {
        name: portfolio.name,
        visibility
      });
      
      // Show success status
      setVisibilityUpdateStatus(prev => ({ ...prev, [portfolioId]: 'Successfully updated' }));
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setVisibilityUpdateStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[portfolioId];
          return newStatus;
        });
      }, 3000);
      
      // Refresh all portfolios to ensure consistency
      const updatedPortfolios = await portfolioApi.getPortfolios({ skipRefresh: true });
      
      // Process the updated portfolios to match your state structure
      const processedPortfolios = updatedPortfolios.map(portfolio => {
        let visibility = PortfolioVisibility.PRIVATE;
        
        if (portfolio.visibility !== undefined) {
          if (typeof portfolio.visibility === 'string') {
            switch (portfolio.visibility.toLowerCase()) {
              case 'paid':
                visibility = PortfolioVisibility.PAID;
                break;
              case 'public':
                visibility = PortfolioVisibility.PUBLIC;
                break;
              case 'private':
              default:
                visibility = PortfolioVisibility.PRIVATE;
            }
          } else if (typeof portfolio.visibility === 'number') {
            visibility = portfolio.visibility;
          }
        }
        
        return {
          id: portfolio.id,
          name: portfolio.name,
          description: portfolio.description || '',
          visibility: visibility,
          included: visibility === PortfolioVisibility.PAID
        };
      });
      
      setPortfolios(processedPortfolios);
      
    } catch (error) {
      console.error('Error updating portfolio visibility:', error);
      
      // Revert the local state change
      setPortfolios(prevPortfolios => 
        prevPortfolios.map(p => {
          if (p.id === portfolioId) {
            const portfolio = portfolios.find(orig => orig.id === portfolioId);
            return portfolio || p; // Revert to original or keep current if not found
          }
          return p;
        })
      );
      
      // Show error status
      setVisibilityUpdateStatus(prev => ({ ...prev, [portfolioId]: 'Update failed' }));
      toast.error('Failed to update portfolio visibility');
      
    } finally {
      // Clear updating state
      setIsUpdatingVisibility(prev => {
        const newState = { ...prev };
        delete newState[portfolioId];
        return newState;
      });
      
      // Clear error status after 3 seconds
      if (visibilityUpdateStatus[portfolioId] === 'Update failed') {
        setTimeout(() => {
          setVisibilityUpdateStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[portfolioId];
            return newStatus;
          });
        }, 3000);
      }
    }
  };

  // Handle navigation to next step
  const handleNext = () => {
    const hasPaidPortfolios = portfolios.some(p => p.visibility === 'paid');
    
    if (hasPaidPortfolios) {
      // Save portfolio visibility changes to local storage for persistence
      try {
        localStorage.setItem('paidPortfolios', JSON.stringify(
          portfolios.filter(p => p.visibility === 'paid').map(p => p.id)
        ));
      } catch (e) {
        console.error('Could not save to localStorage', e);
      }
      
      // Navigate to either connect Stripe or configure pricing
      if (isStripeConnected) {
        navigate('/portfolio-pricing');
      } else {
        navigate('/creator/payments?tab=connect');
      }
    } else {
      toast.success('Settings saved successfully');
      navigate('/profile');
    }
  };

  // Handle Stripe connection
  const handleConnectStripe = async () => {
    try {
      // Build return URL
      const currentUrl = window.location.origin;
      const returnUrl = `${currentUrl}/portfolio-subscriptions`;
      
      // Get onboarding link from API
      const { url } = await StripeConnectService.getOnboardingLink(user?.id || '', returnUrl);
      
      // Redirect to Stripe's onboarding flow
      window.location.href = url;
    } catch (err) {
      console.error('Error starting Stripe Connect onboarding:', err);
      toast.error("Couldn't start Stripe Connect onboarding. Please try again.");
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner size="lg" label="Loading portfolios..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Portfolio Subscription Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Control which portfolios are public, private, or available to paid subscribers
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Stripe Connection Alert */}
      {portfolios.some(p => p.visibility === 'paid') && !isStripeConnected && (
        <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connect payment processing</AlertTitle>
          <AlertDescription className="flex flex-col space-y-2">
            <p>You need to connect your Stripe account to enable subscription payments.</p>
            <Button 
              variant="outline" 
              className="self-start mt-2 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
              onClick={handleConnectStripe}
            >
              Connect with Stripe
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {error ? (
        <Card className="mb-6">
          <CardContent className="py-8">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500 font-medium mb-2">Error loading portfolios</p>
              <p className="mb-4">{error}</p>
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
                <Button onClick={() => navigate('/portfolio')}>
                  Go to Portfolios
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : portfolios.length === 0 ? (
        <Card className="mb-6">
          <CardContent className="py-8">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="mb-4">You don't have any portfolios yet.</p>
              <Button onClick={() => navigate('/portfolio')}>Create your first portfolio</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 mb-8">
          {portfolios.map((portfolio) => (
            <Card key={portfolio.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{portfolio.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select
                      value={portfolio.visibility}
                      onValueChange={(value: PortfolioVisibility.PUBLIC | PortfolioVisibility.PAID | PortfolioVisibility.PRIVATE) => 
                        handleVisibilityChange(portfolio.id, value)
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">
                          <div className="flex items-center">
                            <Lock className="h-4 w-4 mr-2" /> Private
                          </div>
                        </SelectItem>
                        <SelectItem value="public">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-2" /> Public
                          </div>
                        </SelectItem>
                        <SelectItem value="paid">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" /> Paid
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <CardDescription>
                  {portfolio.description || 'No description provided'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={portfolio.visibility}
                  onValueChange={(value: PortfolioVisibility.PUBLIC | PortfolioVisibility.PAID | PortfolioVisibility.PRIVATE) => 
                    handleVisibilityChange(portfolio.id, value)
                  }
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id={`private-${portfolio.id}`} />
                    <Label htmlFor={`private-${portfolio.id}`} className="font-medium flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-gray-500" />
                      Private - Only you can see this portfolio
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id={`public-${portfolio.id}`} />
                    <Label htmlFor={`public-${portfolio.id}`} className="font-medium flex items-center">
                      <Eye className="h-4 w-4 mr-2 text-blue-500" />
                      Public - Anyone can view this portfolio for free
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paid" id={`paid-${portfolio.id}`} />
                    <Label htmlFor={`paid-${portfolio.id}`} className="font-medium flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                      Paid - Only paid subscribers can access this portfolio
                    </Label>
                  </div>
                </RadioGroup>
                
                {portfolio.visibility === 'paid' && (
                  <div className="mt-4 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg">
                    <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                      <Info className="h-4 w-4 inline-block mr-1" />
                      <span className="font-medium">Setting up paid access:</span>
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
                      After marking portfolios as paid, you'll need to:
                    </p>
                    <ol className="mt-2 text-yellow-700 dark:text-yellow-400 text-sm list-decimal pl-5 space-y-1">
                      <li>Connect your Stripe account to process payments</li>
                      <li>Set up pricing in the Portfolio Pricing Manager</li>
                      <li>Configure backend access control to protect paid content</li>
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {portfolios.some(p => p.visibility === 'paid') && (
        <Alert className="mb-6 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
          <Info className="h-4 w-4" />
          <AlertTitle>Pricing setup required</AlertTitle>
          <AlertDescription>
            You've marked portfolios as paid. Next, you'll need to set up pricing for your subscription.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/profile')}
        >
          Cancel
        </Button>
        <Button onClick={handleNext} className="gap-2">
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PortfolioSubscriptionManager;