// src/components/subscription/SwitchPlanDialog.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/loaders";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check, RefreshCw, AlertCircle, CreditCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import SubscriptionAPI from "@/services/subscriptionApi";
import PaymentAPI from "@/services/paymentApi";

interface Subscription {
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
  // other properties...
}

interface SwitchPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSubscription: UserSubscription | null;
  paymentMethods: PaymentMethod[];
  onSuccess: () => void;
}

export const SwitchPlanDialog = ({
  open,
  onOpenChange,
  currentSubscription,
  paymentMethods,
  onSuccess,
}: SwitchPlanDialogProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [useNewPaymentMethod, setUseNewPaymentMethod] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [prorate, setProrate] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get available subscription plans
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load available plans
        const availablePlans = await SubscriptionAPI.getAvailableSubscriptions();
        
        // Filter out the current subscription plan
        const filteredPlans = currentSubscription 
          ? availablePlans.filter(plan => plan.id !== currentSubscription.subscriptionId)
          : availablePlans;
        
        setSubscriptions(filteredPlans);
        
        // Select a default payment method if available
        const defaultMethod = paymentMethods.find(method => method.isDefault);
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod.id);
        } else if (paymentMethods.length > 0) {
          setSelectedPaymentMethod(paymentMethods[0].id);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading subscription plans:', err);
        setError('Failed to load subscription plans. Please try again.');
        setIsLoading(false);
      }
    };
    
    if (open) {
      loadPlans();
    }
  }, [open, currentSubscription, paymentMethods]);
  
  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };
  
  // Updated SwitchPlanDialog method to properly handle payment methods
// This adds debugging and ensures we send the correct payment method ID to Stripe

async function handleSwitchPlan() {
    if (!selectedPlan) {
      toast.error('Please select a subscription plan');
      return;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // Get current subscription for reference
      const currentSub = await SubscriptionAPI.getCurrentSubscription();
      if (!currentSub) {
        throw new Error('No active subscription found to switch from');
      }
      
      // Step 1: Cancel the existing subscription (but continue to end of billing period)
      console.log(`Cancelling existing subscription: ${currentSub.id}`);
      await SubscriptionAPI.cancelSubscription(currentSub.id);
      
      console.log('Current subscription cancelled successfully');
      
      // Step 2: Get a valid payment method
      let stripePaymentMethodId;
      
      // If using a new payment method
      if (useNewPaymentMethod && stripe && elements) {
        const cardElement = elements.getElement(CardElement);
        
        if (!cardElement) {
          throw new Error('Card element not found');
        }
        
        // Get Stripe customer ID
        const { stripeCustomerId } = await PaymentAPI.getOrCreateStripeCustomer();
        console.log('Using Stripe customer ID:', stripeCustomerId);
        
        // Create new payment method directly with Stripe
        const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });
        
        if (stripeError) {
          throw new Error(stripeError.message);
        }
        
        console.log('Created new Stripe payment method:', paymentMethod.id);
        stripePaymentMethodId = paymentMethod.id;
        
        // Save this payment method for future use
        await PaymentAPI.addPaymentMethod({
          paymentToken: paymentMethod.id,
          type: 'CREDIT_CARD',
          stripeCustomerId: stripeCustomerId,
          userId: user?.id
        });
      } 
      // If using an existing payment method - use a simpler approach
      else if (selectedPaymentMethod) {
        // For now, let's use a new card payment instead of trying to use existing payment methods
        // This is the safest approach given the current error
        toast.info('Creating a new card payment method is recommended');
        setUseNewPaymentMethod(true);
        
        // Return early and let the user try again with a new card
        setIsProcessing(false);
        setError('Please add a new payment method to continue');
        return;
      } else {
        // No payment method selected and not creating a new one
        throw new Error('Please select a payment method or add a new one');
      }
      
      console.log('Using Stripe payment method ID:', stripePaymentMethodId);
      
      // Step 3: Create a new subscription with the new plan
      const subscribeData = {
        subscriptionId: selectedPlan,
        paymentMethodId: stripePaymentMethodId,
        userId: user?.id, // Get from Auth context
        stripeCustomerId: currentSub.stripeCustomerId
      };
      
      console.log('Creating new subscription with data:', subscribeData);
      await SubscriptionAPI.subscribeUser(subscribeData);
      
      console.log('New subscription created successfully');
      toast.success('Subscription plan switched successfully');
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Error switching plan:', err);
      setError(err.message || 'An error occurred while switching plans');
      toast.error('Failed to switch plans');
    } finally {
      setIsProcessing(false);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Switch Subscription Plan</DialogTitle>
          <DialogDescription>
            Choose a new plan for your subscription. Your billing will be adjusted accordingly.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Spinner size="lg" label="Loading plans..." />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex items-start gap-3 text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error Loading Plans</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Select a New Plan</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {subscriptions.map((plan) => (
                    <Card 
                      key={plan.id} 
                      className={`cursor-pointer p-4 ${
                        selectedPlan === plan.id ? 'border-blue-500 ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{plan.name}</h4>
                        <Badge variant={plan.tier === 'PREMIUM' ? 'default' : 'outline'}>
                          {plan.tier}
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-2xl font-bold">${plan.price}</span>
                        <span className="text-sm text-gray-500">/{plan.billingPeriod}</span>
                      </div>
                      
                      <ul className="space-y-1 text-sm">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {plan.features.length > 3 && (
                          <li className="text-sm text-blue-600 mt-1 hover:underline cursor-pointer">
                            + {plan.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Payment Options</h3>
                
                {paymentMethods.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="useExistingPayment">Use existing payment method</Label>
                      <Switch 
                        id="useExistingPayment" 
                        checked={!useNewPaymentMethod} 
                        onCheckedChange={(checked) => setUseNewPaymentMethod(!checked)} 
                      />
                    </div>
                    
                    {!useNewPaymentMethod && (
                      <div className="space-y-2 mt-2">
                        {paymentMethods.map((method) => (
                          <div 
                            key={method.id}
                            className={`p-3 border rounded-lg cursor-pointer flex items-center ${
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
                      </div>
                    )}
                  </div>
                )}
                
                {(useNewPaymentMethod || paymentMethods.length === 0) && (
                  <div className="space-y-2">
                    <Label htmlFor="cardElement">New payment method</Label>
                    <div className="p-3 border rounded-lg" id="cardElement">
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
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="prorateSwitch" className="font-medium">Prorate Charges</Label>
                    <p className="text-sm text-gray-500">
                      Adjust charges for the remainder of the current billing period
                    </p>
                  </div>
                  <Switch 
                    id="prorateSwitch" 
                    checked={prorate} 
                    onCheckedChange={setProrate} 
                  />
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded text-sm text-red-600 dark:text-red-300">
                  {error}
                </div>
              )}
            </div>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
                Cancel
              </Button>
              <Button 
                onClick={handleSwitchPlan} 
                disabled={!selectedPlan || isProcessing}
                className="gap-2"
              >
                {isProcessing ? <Spinner size="sm" /> : <RefreshCw className="h-4 w-4" />}
                Switch Plan
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SwitchPlanDialog;