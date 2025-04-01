import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/loaders";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardElement, useStripe, useElements, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ArrowLeft, CreditCard, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Mock subscription plans
const SUBSCRIPTION_PLANS = {
  "basic": {
    id: "basic",
    name: "Basic Plan",
    tier: "FREE",
    price: 0.01,
    currency: "USD",
    billingPeriod: "month",
    stripePriceId: "price_basic"
  },
  "premium": {
    id: "premium",
    name: "Premium Plan",
    tier: "PREMIUM",
    price: 0.10,
    currency: "USD",
    billingPeriod: "month",
    stripePriceId: "price_premium"
  },
  "creator": {
    id: "creator",
    name: "Creator Plan",
    tier: "CREATOR",
    price: 0.02,
    currency: "USD",
    billingPeriod: "month",
    stripePriceId: "price_creator"
  }
};

// Initialize Stripe with your publishable key (use your actual key in production)
const stripePromise = loadStripe('pk_test_your_key_here');

// Mock payment methods
const MOCK_PAYMENT_METHODS = [
  {
    id: "pm_123",
    type: "card",
    brand: "Visa",
    last4: "4242",
    expiryMonth: "12",
    expiryYear: "2025",
    isDefault: true
  },
  {
    id: "pm_456",
    type: "card",
    brand: "Mastercard",
    last4: "5555",
    expiryMonth: "10",
    expiryYear: "2024",
    isDefault: false
  }
];

// Stripe payment form component
const StripePaymentForm = ({ 
  planId, 
  onSuccess, 
  savedPaymentMethods 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  // Log important info for debugging
  useEffect(() => {
    console.log("StripePaymentForm initialized with:", {
      planId,
      userAvailable: !!user,
      userId: user?.id,
      savedPaymentMethods: savedPaymentMethods.length
    });
  }, [planId, user, savedPaymentMethods]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe is not initialized. Please refresh the page and try again.');
      return;
    }

    if (!planId) {
      setError('No subscription plan selected. Please go back and select a plan.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      console.log('Starting subscription process for plan:', planId);
      
      // Simulate getting customer ID
      console.log('Using Stripe customer ID: mock_cus_123');

      if (selectedPaymentMethod) {
        // Use existing payment method
        console.log('Using existing payment method:', selectedPaymentMethod);
        
        // Simulate subscription API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast.success('Subscription successful!');
        onSuccess();
      } else {
        // Create new payment method with Card Element
        console.log('Creating new payment method with card element');
        const cardElement = elements.getElement(CardElement);
        
        if (!cardElement) {
          throw new Error('Card element not found');
        }

        // Simulate Stripe API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast.success('Subscription successful!');
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      
      setError(err.message || 'An error occurred during payment processing');
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Subscription confirmation</h3>
        <p className="text-sm text-gray-600">
          You're subscribing to our premium plan. Your card will be charged immediately.
        </p>
        
        <div className="bg-blue-50 rounded p-3 text-sm text-blue-800">
          <p>By subscribing, you agree to our terms of service and privacy policy.</p>
          <p>You can cancel your subscription anytime from your account settings.</p>
        </div>
      </div>

      {savedPaymentMethods.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Your saved payment methods</h3>
          <div className="space-y-2">
            {savedPaymentMethods.map((method) => (
              <div 
                key={method.id}
                className={`p-4 border rounded-lg cursor-pointer flex items-center ${
                  selectedPaymentMethod === method.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => setSelectedPaymentMethod(method.id)}
              >
                <div className="flex-1">
                  <div className="font-medium">{method.brand} •••• {method.last4}</div>
                  <div className="text-sm text-gray-500">Expires {method.expiryMonth}/{method.expiryYear}</div>
                </div>
                <div>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    checked={selectedPaymentMethod === method.id}
                    onChange={() => setSelectedPaymentMethod(method.id)}
                    className="h-4 w-4 text-blue-600"
                  />
                </div>
              </div>
            ))}
            
            <div 
              className={`p-4 border rounded-lg cursor-pointer flex items-center ${
                selectedPaymentMethod === null ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onClick={() => setSelectedPaymentMethod(null)}
            >
              <div className="flex-1">
                <div className="font-medium">Use a new card</div>
              </div>
              <div>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  checked={selectedPaymentMethod === null}
                  onChange={() => setSelectedPaymentMethod(null)}
                  className="h-4 w-4 text-blue-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPaymentMethod === null && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Card details</h3>
          <div className="p-4 border rounded-lg">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <Button 
        type="submit" 
        disabled={!stripe || processing} 
        className="w-full"
      >
        {processing ? <Spinner size="sm" /> : 'Subscribe Now'}
      </Button>
    </form>
  );
};

const PaymentCheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get plan ID from URL query params
  const queryParams = new URLSearchParams(location.search);
  const planId = queryParams.get('planId');

  // Load plan details and payment methods
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || !planId) return;
      
      try {
        setIsLoading(true);
        
        // Fetch the specific plan details (using mock data for demo)
        const selectedPlan = SUBSCRIPTION_PLANS[planId];
        
        if (!selectedPlan) {
          toast.error('Subscription plan not found');
          navigate('/subscriptions');
          return;
        }
        
        setPlan(selectedPlan);
        
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading payment data:', error);
        toast.error('Failed to load payment information');
        setIsLoading(false);
      }
    };

    if (isAuthenticated && !authLoading) {
      loadData();
    }
  }, [isAuthenticated, authLoading, planId, navigate]);

  // Handle authentication redirection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/signin');
    }
    
    if (!planId && !authLoading) {
      navigate('/subscriptions');
    }
  }, [authLoading, isAuthenticated, planId, navigate]);

  const handlePaymentSuccess = () => {
    // Redirect to success page or dashboard
    navigate('/subscription-success');
  };

  // Show loading state while data is loading
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Spinner size="lg" label="Loading payment information..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container max-w-md mx-auto px-4 py-12">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="pl-0 flex items-center"
            onClick={() => navigate('/subscriptions')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plans
          </Button>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Complete Your Subscription</h1>
        
        {plan && (
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">{plan.name}</h3>
              <div className="text-xl font-bold">${plan.price}/{plan.billingPeriod}</div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              You will be charged ${plan.price} {plan.billingPeriod === 'month' ? 'monthly' : 'annually'}.
              You can cancel anytime.
            </div>
            
            <div className="mt-4 flex items-center text-sm text-blue-600">
              <Info className="h-4 w-4 mr-1" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="underline cursor-help">
                    What's included in this plan?
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="w-64 p-2">
                      <p className="font-bold mb-2">{plan.name} Includes:</p>
                      <ul className="text-xs space-y-1">
                        {plan.id === 'basic' && (
                          <>
                            <li>• View public portfolios</li>
                            <li>• Create 1 portfolio</li>
                            <li>• Basic market data</li>
                          </>
                        )}
                        {plan.id === 'premium' && (
                          <>
                            <li>• Create up to 5 portfolios</li>
                            <li>• Advanced analytics</li>
                            <li>• Performance tracking</li>
                            <li>• Real-time market data</li>
                          </>
                        )}
                        {plan.id === 'creator' && (
                          <>
                            <li>• Unlimited portfolios</li>
                            <li>• Advanced analytics</li>
                            <li>• Performance tracking</li>
                            <li>• Monetize your portfolios</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </Card>
        )}
        
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Payment Method
          </h2>
          
          {plan && (
            <Elements stripe={stripePromise}>
              <StripePaymentForm 
                planId={plan.id} 
                onSuccess={handlePaymentSuccess}
                savedPaymentMethods={MOCK_PAYMENT_METHODS}
              />
            </Elements>
          )}
          
          <div className="mt-6 text-sm text-gray-500 text-center">
            Your payment is secured by Stripe. We do not store your full card details.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCheckoutPage;