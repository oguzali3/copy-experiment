// src/pages/SubscriptionPage.tsx
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
import { Check, Info, AlertCircle, ArrowUp, ArrowDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import SubscriptionAPI from "@/services/subscriptionApi";
import PaymentAPI from "@/services/paymentApi";
import SwitchPlanDialog from "./SwitchPlanDialog";

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripeKey) {
  console.error("⚠️ Stripe publishable key is missing! Check your .env file.");
  // You might want to handle this case in your UI
}

// Only initialize Stripe if we have a key
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

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

interface PaymentMethod {
  id: string;
  type: string;
  brand: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

interface UserSubscription {
  id: string;
  subscriptionId: string;
  subscription: {
    id: string;
    tier: string;
    price: number;
  };
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string;
}

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [planCompareDialogOpen, setPlanCompareDialogOpen] = useState(false);
  const [switchPlanDialogOpen, setSwitchPlanDialogOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // For tracking the tier levels for comparison
  const tierLevels = {
    'FREE': 0,
    'PREMIUM': 1,
    'CREATOR': 2
  };

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
        
        // If user has an active subscription, pre-select it
        if (userSubscription) {
          setSelectedPlan(userSubscription.subscriptionId);
          
          // Fetch payment methods for switch plan functionality
          const methods = await PaymentAPI.getPaymentMethods();
          setPaymentMethods(methods);
        }
        
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
      
      // If user already has a subscription and is selecting a different plan, open switch plan dialog
      if (currentSubscription && currentSubscription.subscriptionId !== selectedPlan) {
        setSwitchPlanDialogOpen(true);
        setProcessingAction(false);
        return;
      }
      
      // Redirect to payment page with selected plan ID for new subscription
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
  
  const handleSwitchPlanSuccess = () => {
    setSwitchPlanDialogOpen(false);
    
    // Reload subscription data
    const loadSubscriptionData = async () => {
      try {
        const userSubscription = await SubscriptionAPI.getCurrentSubscription();
        setCurrentSubscription(userSubscription);
        
        if (userSubscription) {
          setSelectedPlan(userSubscription.subscriptionId);
        }
        
        toast.success('Your subscription plan has been updated successfully');
      } catch (error) {
        console.error('Error reloading subscription data:', error);
      }
    };
    
    loadSubscriptionData();
  };
  
  // Function to check if a plan is an upgrade, downgrade, or same level
  const getPlanComparisonType = (planTier: string): 'upgrade' | 'downgrade' | 'same' | null => {
    if (!currentSubscription) return null;
    
    const currentTierLevel = tierLevels[currentSubscription.subscription.tier as keyof typeof tierLevels] || 0;
    const newTierLevel = tierLevels[planTier as keyof typeof tierLevels] || 0;
    
    if (newTierLevel > currentTierLevel) return 'upgrade';
    if (newTierLevel < currentTierLevel) return 'downgrade';
    return 'same';
  };
  
  // Function to get pricing difference for display
  const getPriceDifference = (planPrice: number): number => {
    if (!currentSubscription) return 0;
    return planPrice - currentSubscription.subscription.price;
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
                
                {/* Compare plans button */}
                {currentSubscription && (
                  <div className="flex justify-end">
                    <Button 
                      variant="ghost" 
                      className="text-sm flex items-center gap-1"
                      onClick={() => setPlanCompareDialogOpen(true)}
                    >
                      <Info className="h-4 w-4" /> Compare plans
                    </Button>
                  </div>
                )}
                
                {/* Explanation text for users */}
                <p className="text-gray-600 dark:text-gray-400">
                  Choose the plan that best fits your needs. All plans include access to our core features.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => {
                  // Determine if this is an upgrade/downgrade for current user
                  const comparisonType = getPlanComparisonType(plan.tier);
                  const priceDiff = getPriceDifference(plan.price);
                  
                  return (
                    <Card 
                      key={plan.id} 
                      className={`relative ${selectedPlan === plan.id ? 'border-blue-500 ring-2 ring-blue-500' : ''} ${
                        currentSubscription && currentSubscription.subscriptionId === plan.id 
                          ? 'bg-blue-50 dark:bg-blue-900/10' 
                          : ''
                      }`}
                    >
                      {plan.tier === 'PREMIUM' && (
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600">
                          Popular
                        </Badge>
                      )}
                      
                      {/* Show upgrade/downgrade badge if user has a subscription */}
                      {comparisonType && comparisonType !== 'same' && (
                        <Badge 
                          className={`absolute top-4 left-4 ${
                            comparisonType === 'upgrade' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                          }`}
                        >
                          {comparisonType === 'upgrade' ? (
                            <span className="flex items-center gap-1">
                              <ArrowUp className="h-3 w-3" /> Upgrade
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <ArrowDown className="h-3 w-3" /> Downgrade
                            </span>
                          )}
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
                          
                          {/* Show price difference if this is an upgrade/downgrade */}
                          {comparisonType && comparisonType !== 'same' && (
                            <div className={`text-sm mt-1 ${
                              priceDiff > 0 ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(2)} {plan.currency}/mo
                            </div>
                          )}
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
                        {currentSubscription && currentSubscription.subscriptionId === plan.id ? (
                          <Button className="w-full" variant="outline" disabled>
                            Current Plan
                          </Button>
                        ) : (
                          <Button 
                            className="w-full" 
                            variant={selectedPlan === plan.id ? "default" : "outline"}
                            onClick={() => handleSelectPlan(plan.id)}
                          >
                            {selectedPlan === plan.id ? 'Selected' : (
                              comparisonType === 'upgrade' ? 'Upgrade to this Plan' : 
                              comparisonType === 'downgrade' ? 'Downgrade to this Plan' : 
                              'Select Plan'
                            )}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
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
                    {processingAction ? <Spinner size="sm" /> : (
                      currentSubscription ? 
                        (selectedPlan !== currentSubscription.subscriptionId ? 
                          'Continue to Change Plan' : 
                          'Continue to Payment') :
                        'Continue to Payment'
                    )}
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
      
      {/* Plan Comparison Modal */}
      <Dialog open={planCompareDialogOpen} onOpenChange={setPlanCompareDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Plan Comparison</DialogTitle>
            <DialogDescription>
              Compare features across our different subscription plans
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b"></th>
                  {plans.map(plan => (
                    <th key={plan.id} className={`p-2 border-b ${
                      currentSubscription && currentSubscription.subscriptionId === plan.id
                        ? 'bg-blue-50 dark:bg-blue-900/10'
                        : ''
                    }`}>
                      <div className="font-bold">{plan.name}</div>
                      <div className="text-sm text-gray-500">${plan.price}/{plan.billingPeriod}</div>
                      {currentSubscription && currentSubscription.subscriptionId === plan.id && (
                        <Badge className="mt-1">Current Plan</Badge>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Combine all possible features */}
                {Array.from(new Set(plans.flatMap(plan => plan.features))).map((feature, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}>
                    <td className="p-2 border-b">{feature}</td>
                    {plans.map(plan => (
                      <td key={plan.id} className={`p-2 border-b text-center ${
                        currentSubscription && currentSubscription.subscriptionId === plan.id
                          ? 'bg-blue-50 dark:bg-blue-900/10'
                          : ''
                      }`}>
                        {plan.features.includes(feature) ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setPlanCompareDialogOpen(false)}>
              Close
            </Button>
            {currentSubscription && selectedPlan && selectedPlan !== currentSubscription.subscriptionId && (
              <Button onClick={handleSubscribe}>
                Continue with {plans.find(p => p.id === selectedPlan)?.name}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Switch Plan Dialog */}
      {currentSubscription && (
        <Elements stripe={stripePromise}>
          <SwitchPlanDialog
            open={switchPlanDialogOpen}
            onOpenChange={setSwitchPlanDialogOpen}
            currentSubscription={currentSubscription}
            paymentMethods={paymentMethods}
            onSuccess={handleSwitchPlanSuccess}
          />
        </Elements>
      )}
    </div>
  );
};

export default SubscriptionPage;