import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SocialHeader } from "@/components/social/SocialHeader";
import { SocialSidebar } from "@/components/social/SocialSidebar";
import { Spinner } from "@/components/ui/loaders";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Info, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import SubscriptionAPI from "@/services/subscriptionApi";

interface SubscriptionPlan {
  id: string;
  name: string;
  tier: string;
  price: number;
  currency: string;
  billingPeriod: string;
  stripePriceId: string;
  features: string[];
}

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentSubscription, setCurrentSubscription] = useState<any | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  // Load subscription plans on component mount
  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoading(true);
        setLoadingError(null);
        
        // Fetch available subscription plans
        console.log('Fetching available subscription plans...');
        const availablePlans = await SubscriptionAPI.getAvailableSubscriptions();
        setPlans(availablePlans);
        console.log(`Fetched ${availablePlans.length} subscription plans`);
        
        // Fetch user's current subscription
        console.log('Fetching current subscription...');
        const userSubscription = await SubscriptionAPI.getCurrentSubscription();
        setCurrentSubscription(userSubscription);
        console.log('Current subscription:', userSubscription ? 'Active' : 'None');
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading subscription data:', error);
        setLoadingError('Failed to load subscription information. Please try refreshing the page.');
        toast.error('Failed to load subscription information');
        setIsLoading(false);
      }
    };

    if (isAuthenticated && !authLoading) {
      loadSubscriptionData();
    }
  }, [isAuthenticated, authLoading]);

  // Handle authentication redirection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to signin');
      navigate('/signin');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleSelectPlan = (planId: string) => {
    console.log(`Selected plan: ${planId}`);
    setSelectedPlan(planId);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      toast.error('Please select a subscription plan');
      return;
    }
  
    try {
      setProcessingAction(true);
      
      // Find the selected plan to display in toast
      const selectedPlanDetails = plans.find(p => p.id === selectedPlan);
      toast.info(`Processing ${selectedPlanDetails?.name || 'subscription'} plan...`);
      
      // Redirect to payment page with selected plan ID
      console.log(`Redirecting to payment page with planId=${selectedPlan}`);
      navigate(`/payment?planId=${selectedPlan}`);
    } catch (error) {
      console.error('Error initiating subscription:', error);
      toast.error('Failed to process subscription');
      setProcessingAction(false);
    }
  };
  
  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;
    
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access at the end of your billing period.')) {
      return;
    }

    try {
      setProcessingAction(true);
      toast.info('Processing cancellation...');
      
      await SubscriptionAPI.cancelSubscription(currentSubscription.id);
      toast.success('Your subscription has been canceled');
      
      // Refresh subscription data
      const userSubscription = await SubscriptionAPI.getCurrentSubscription();
      setCurrentSubscription(userSubscription);
      setProcessingAction(false);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
      setProcessingAction(false);
    }
  };

  // Show loading state while data is loading
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Spinner size="lg" label="Loading subscription plans..." />
      </div>
    );
  }

  // Show error state if loading failed
  if (loadingError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Error Loading Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{loadingError}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Get the currently active subscription plan if available
  const activePlan = currentSubscription ? plans.find(plan => plan.id === currentSubscription.subscriptionId) : null;

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
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-8">
              <div className="space-y-4 mb-8">
                <h1 className="text-2xl font-bold">Subscription Plans</h1>
                
                {currentSubscription && (
                  <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-4 rounded-lg">
                    <div className="font-semibold flex items-center">
                      <div className="mr-2">Your current subscription: {activePlan?.name || 'Unknown Plan'}</div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Your subscription information</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-sm mt-1">
                      {currentSubscription.cancelAtPeriodEnd 
                        ? `Your subscription will end on ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}`
                        : `Your next billing date is ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}`
                      }
                    </p>
                  </div>
                )}
                
                {/* Explanation text for users */}
                <p className="text-gray-600 dark:text-gray-400">
                  Choose the plan that best fits your needs. All plans include access to our core features.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                  <Card 
                    key={plan.id} 
                    className={`relative ${selectedPlan === plan.id ? 'border-blue-500 ring-2 ring-blue-500' : ''} ${
                      currentSubscription && currentSubscription.subscription?.tier === plan.tier 
                        ? 'bg-blue-50 dark:bg-blue-900/10' 
                        : ''
                    }`}
                  >
                    {plan.tier === 'PREMIUM' && (
                      <Badge className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600">
                        Popular
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>
                        {plan.tier === 'FREE' ? 'Basic Access' : plan.tier === 'PREMIUM' ? 'Enhanced Access' : 'Full Access'}
                      </CardDescription>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">/{plan.billingPeriod}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      {currentSubscription && currentSubscription.subscription?.tier === plan.tier ? (
                        <Button className="w-full bg-blue-600" variant="outline" disabled>
                          Current Plan
                        </Button>
                      ) : (
                        <Button 
                          className="w-full" 
                          variant={selectedPlan === plan.id ? "default" : "outline"}
                          onClick={() => handleSelectPlan(plan.id)}
                        >
                          {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <div className="mt-8 flex justify-center gap-4">
                {currentSubscription && !currentSubscription.cancelAtPeriodEnd ? (
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelSubscription}
                    disabled={processingAction}
                  >
                    {processingAction ? 'Processing...' : 'Cancel Subscription'}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubscribe} 
                    disabled={!selectedPlan || processingAction}
                    className="min-w-[200px]"
                  >
                    {processingAction ? <Spinner size="sm" /> : 'Continue to Payment'}
                  </Button>
                )}
              </div>
              
              <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {currentSubscription ? (
                  <p>
                    Need help with your subscription? <a href="#" className="text-blue-600 hover:underline">Contact support</a>
                  </p>
                ) : (
                  <p>
                    All plans come with a 7-day money-back guarantee. No commitments.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;