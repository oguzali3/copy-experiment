/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/PaymentPage.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SocialHeader } from "@/components/social/SocialHeader";
import { SocialSidebar } from "@/components/social/SocialSidebar";
import { Spinner } from "@/components/ui/loaders";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardElement, useStripe, useElements, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import SubscriptionAPI from "@/services/subscriptionApi";
import PaymentAPI from "@/services/paymentApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CreditCard } from "lucide-react";

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
}

interface SavedPaymentMethod {
  id: string;
  type: string;
  brand: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

const StripePaymentForm = ({ planId, onSuccess, savedPaymentMethods }: { 
    planId: string; 
    onSuccess: () => void;
    savedPaymentMethods: SavedPaymentMethod[];
  }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
    const [clientToken, setClientToken] = useState<string | null>(null);
    const [debug, setDebug] = useState<any>(null);
  
    // Log important info for debugging
    useEffect(() => {
      console.log("StripePaymentForm initialized with:", {
        planId,
        userAvailable: !!user,
        userId: user?.id,
        savedPaymentMethods: savedPaymentMethods.length
      });
    }, [planId, user, savedPaymentMethods]);
  
    // Get Stripe setup intent when component mounts
    useEffect(() => {
      const getClientToken = async () => {
        try {
          // First get or create a Stripe customer ID
          const { stripeCustomerId } = await PaymentAPI.getOrCreateStripeCustomer();
          console.log('Using Stripe customer ID:', stripeCustomerId);
          
          // Then get client token with customer ID
          const response = await PaymentAPI.getClientToken(stripeCustomerId);
          setClientToken(response.clientToken);
          console.log('Got client token successfully');
        } catch (error) {
          console.error('Error getting client token:', error);
          setError('Failed to initialize payment form. Please try again.');
          setDebug(error);
        }
      };
  
      getClientToken();
    }, []);
  
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
      
        if (!stripe || !elements) {
          setError('Stripe is not initialized. Please refresh the page and try again.');
          return;
        }
      
        if (!planId) {
          setError('No subscription plan selected. Please go back and select a plan.');
          return;
        }
      
        // Check if user ID is available
        if (!user?.id) {
          setError('User information is missing. Please try logging in again.');
          return;
        }
      
        setProcessing(true);
        setError(null);
      
        try {
          console.log('Starting subscription process for plan:', planId);
          
          // Get customer ID first (might be needed)
          const { stripeCustomerId } = await PaymentAPI.getOrCreateStripeCustomer();
          console.log('Using Stripe customer ID:', stripeCustomerId);
      
          if (selectedPaymentMethod) {
            // Use existing payment method
            console.log('Using existing payment method:', selectedPaymentMethod);
            
            const subscribeData = {
              subscriptionId: planId,
              paymentMethodId: selectedPaymentMethod,
              stripeCustomerId: stripeCustomerId,
              userId: user.id // Explicitly include the user ID from the auth context
            };
            
            console.log('Subscription request data:', subscribeData);
            await SubscriptionAPI.subscribeUser(subscribeData);
            
            toast.success('Subscription successful!');
            onSuccess();
          } else {
            // Create new payment method with Card Element
            console.log('Creating new payment method with card element');
            const cardElement = elements.getElement(CardElement);
            
            if (!cardElement) {
              throw new Error('Card element not found');
            }
      
            const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
              type: 'card',
              card: cardElement,
            });
      
            if (stripeError) {
              console.error('Stripe error creating payment method:', stripeError);
              throw new Error(stripeError.message);
            }
      
            console.log('Payment method created:', paymentMethod.id);
      
            // Optionally save this payment method for future use
            try {
              await PaymentAPI.addPaymentMethod({
                paymentToken: paymentMethod.id,
                type: 'CREDIT_CARD',
                stripeCustomerId: stripeCustomerId,
                userId: user.id // Explicitly include the user ID
              });
              console.log('Payment method saved for future use');
            } catch (err) {
              console.warn('Failed to save payment method, continuing with subscription', err);
              // Continue even if saving the payment method fails
            }
      
            // Subscribe with new payment method
            const subscribeData = {
              subscriptionId: planId,
              paymentMethodId: paymentMethod.id,
              stripeCustomerId: stripeCustomerId,
              userId: user.id // Explicitly include the user ID
            };
            
            console.log('Subscription request data:', subscribeData);
            await SubscriptionAPI.subscribeUser(subscribeData);
            
            toast.success('Subscription successful!');
            onSuccess();
          }
        } catch (err: any) {
          console.error('Payment error:', err);
          if (err.response) {
            console.error('Error response:', err.response.data);
            setDebug(err.response.data);
          }
          
          let errorMessage = 'An error occurred during payment processing';
          
          if (err.response?.data?.message) {
            errorMessage = Array.isArray(err.response.data.message) 
              ? err.response.data.message.join(', ') 
              : err.response.data.message;
          } else if (err.message) {
            errorMessage = err.message;
          }
          
          setError(errorMessage);
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
        
        {debug && process.env.NODE_ENV !== 'production' && (
          <div className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
            <pre>{JSON.stringify(debug, null, 2)}</pre>
          </div>
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

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([]);

  // Get plan ID from URL query params
  const queryParams = new URLSearchParams(location.search);
  const planId = queryParams.get('planId');

  // Load plan details and payment methods on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || !planId) return;
      
      try {
        setIsLoading(true);
        
        // Fetch the specific plan details
        const plans = await SubscriptionAPI.getAvailableSubscriptions();
        const selectedPlan = plans.find(p => p.id === planId);
        
        if (!selectedPlan) {
          toast.error('Subscription plan not found');
          navigate('/subscriptions');
          return;
        }
        
        setPlan(selectedPlan);
        
        // Fetch saved payment methods
        const methods = await PaymentAPI.getPaymentMethods();
        setPaymentMethods(methods);
        
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
            <div className="px-6 py-8 max-w-md mx-auto">
              <Button 
                variant="ghost" 
                className="mb-6 pl-0 flex items-center"
                onClick={() => navigate('/subscriptions')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Plans
              </Button>
              
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
                </Card>
              )}
              
              <Tabs defaultValue="card" className="w-full">
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="card" className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Credit Card
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="card" className="mt-6">
                  {plan && (
                    <Elements stripe={stripePromise}>
                      <StripePaymentForm 
                        planId={plan.id} 
                        onSuccess={handlePaymentSuccess}
                        savedPaymentMethods={paymentMethods}
                      />
                    </Elements>
                  )}
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 text-sm text-gray-500 text-center">
                Your payment is secured by Stripe. We do not store your full card details.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;