import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/loaders";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle } from "lucide-react";

// Mock subscription data based on your product catalog
const SUBSCRIPTION_PLANS = [
  {
    id: "basic",
    name: "Basic Plan",
    tier: "FREE",
    price: 0.01,
    currency: "USD",
    billingPeriod: "month",
    stripePriceId: "price_basic",
    features: [
      "View public portfolios",
      "Create 1 portfolio",
      "Basic market data",
      "Email support"
    ]
  },
  {
    id: "premium",
    name: "Premium Plan",
    tier: "PREMIUM",
    price: 0.10,
    currency: "USD",
    billingPeriod: "month",
    stripePriceId: "price_premium",
    features: [
      "View public portfolios",
      "Create up to 5 portfolios",
      "Advanced analytics",
      "Performance tracking",
      "Real-time market data",
      "Priority support"
    ]
  },
  {
    id: "creator",
    name: "Creator Plan",
    tier: "CREATOR",
    price: 0.02,
    currency: "USD",
    billingPeriod: "month",
    stripePriceId: "price_creator",
    features: [
      "View public portfolios",
      "Unlimited portfolios",
      "Advanced analytics",
      "Performance tracking",
      "Real-time market data",
      "Monetize your portfolios",
      "Access to follower insights",
      "Priority support",
      "Custom analysis tools"
    ]
  }
];

const SubscriptionPlansPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentSubscription, setCurrentSubscription] = useState<any | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Load subscription data on component mount
  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoading(true);
        // In a real implementation, fetch subscription data from API
        // Simulate API call
        setTimeout(() => {
          // For demo purposes only
          setCurrentSubscription(null); // Assuming no active subscription
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading subscription data:', error);
        toast.error('Failed to load subscription information');
        setIsLoading(false);
      }
    };

    if (isAuthenticated && !authLoading) {
      loadSubscriptionData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  // Handle authentication redirection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/signin');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      toast.error('Please select a subscription plan');
      return;
    }
  
    try {
      setProcessingPayment(true);
      
      // In a real implementation, redirect to payment page
      toast.success(`Selected plan: ${selectedPlan}`);
      
      // Redirect to payment page with selected plan ID
      navigate(`/payment?planId=${selectedPlan}`);
    } catch (error) {
      console.error('Error initiating subscription:', error);
      toast.error('Failed to process subscription');
      setProcessingPayment(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Spinner size="lg" label="Loading subscription plans..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Subscription Plans</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the plan that best fits your needs. All plans include access to our core features.
          </p>
        </div>

        {currentSubscription && (
          <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-4 rounded-lg max-w-3xl mx-auto mb-8">
            <p className="font-semibold">
              Your current subscription: {currentSubscription.name || 'Unknown Plan'}
            </p>
            <p className="text-sm mt-1">
              {currentSubscription.cancelAtPeriodEnd 
                ? `Your subscription will end on ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}`
                : `Your next billing date is ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}`
              }
            </p>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${selectedPlan === plan.id ? 'border-blue-500 ring-2 ring-blue-500' : ''} 
                ${plan.tier === 'PREMIUM' ? 'shadow-lg' : ''}`}
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
                {currentSubscription && currentSubscription.tier === plan.tier ? (
                  <Button className="w-full" variant="outline" disabled>
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

        <div className="mt-12 text-center">
          <Button 
            onClick={handleSubscribe} 
            disabled={!selectedPlan || processingPayment}
            className="min-w-[200px]"
            size="lg"
          >
            {processingPayment ? <Spinner size="sm" /> : 'Continue to Payment'}
          </Button>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            All plans come with a 7-day money-back guarantee. No commitments.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansPage;