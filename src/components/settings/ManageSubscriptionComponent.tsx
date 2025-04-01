// src/components/settings/ManageSubscriptionComponent.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loaders";
import { AlertCircle, CreditCard, Calendar, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import SubscriptionAPI from "@/services/subscriptionApi";
import PaymentAPI from "@/services/paymentApi";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CardElement, useStripe, useElements, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "@/contexts/AuthContext";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51R7ffjP03K9QaBZcwxbAeRRzovFMa6kq1MlOZSDRSX76mPfadRRKvGxTIlPMx0AokZUDcq2tFa4tgGS2fSVbdgee00oedNBEHg');

interface PaymentMethod {
  id: string;
  type: string;
  brand: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  subscription: {
    id: string;
    name: string;
    tier: string;
    price: number;
    currency: string;
    billingPeriod: string;
  };
}


const AddPaymentMethodForm = ({ onSuccess, user }: { 
    onSuccess: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?: any;
  }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
  
    // Add debug logging
    console.log('Stripe object loaded:', !!stripe);
    console.log('Card Element rendered');
    console.log('Current user:', user);
  
    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
    
      if (!stripe || !elements) {
        console.log('Stripe not initialized properly');
        setError('Stripe is not initialized properly');
        return;
      }
    
      setProcessing(true);
      setError(null);
    
      try {
        // Create the payment method with Stripe
        const cardElement = elements.getElement(CardElement);
        
        if (!cardElement) {
          throw new Error('Card element not found');
        }
    
        console.log('Creating payment method...');
        const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });
    
        if (stripeError) {
          console.error('Stripe error creating payment method:', stripeError);
          throw new Error(stripeError.message);
        }
    
        console.log('Payment method created:', paymentMethod);
        
        // Get or create a Stripe customer ID
        const { stripeCustomerId } = await PaymentAPI.getOrCreateStripeCustomer();
        
        // Add payment method with the customer ID
        const response = await PaymentAPI.addPaymentMethod({
          paymentToken: paymentMethod.id,
          type: 'CREDIT_CARD',
          stripeCustomerId: stripeCustomerId,
          userId: user?.id // Include userId explicitly
        });
        
        console.log('Payment method added successfully:', response);
        toast.success('Payment method added successfully');
        onSuccess();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Error adding payment method:', err);
        setError(err.message || 'An error occurred while adding your payment method');
        toast.error('Failed to add payment method');
      } finally {
        setProcessing(false);
      }
    };
  
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 border rounded-lg" style={{ minHeight: '60px' }}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  fontFamily: 'Arial, sans-serif',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                  ':-webkit-autofill': {
                    color: '#424770',
                  },
                  padding: '10px',
                },
                invalid: {
                  color: '#9e2146',
                },
              },
              hidePostalCode: true,
            }}
            onChange={(e) => {
              console.log('Card element change:', e);
              if (e.error) console.error('Card element error:', e.error);
            }}
            onFocus={() => console.log('Card element focus')}
            onBlur={() => console.log('Card element blur')}
            onReady={() => console.log('Card element ready')}
          />
        </div>
  
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
  
        <Button 
          type="submit" 
          disabled={!stripe || processing} 
          className="w-full"
        >
          {processing ? <Spinner size="sm" /> : 'Add Payment Method'}
        </Button>
      </form>
    );
  };

const ManageSubscriptionComponent = () => {
  const navigate = useNavigate();
  // Get user from AuthContext
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false);

  // Log current user
  useEffect(() => {
    console.log('Current user:', user);
  }, [user]);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Load current subscription
      const currentSubscription = await SubscriptionAPI.getCurrentSubscription();
      setSubscription(currentSubscription);
      
      // Load payment methods
      const methods = await PaymentAPI.getPaymentMethods();
      setPaymentMethods(methods);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast.error('Failed to load subscription information');
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access at the end of your billing period.')) {
      return;
    }

    try {
      setProcessingAction(true);
      await SubscriptionAPI.cancelSubscription(subscription.id);
      toast.success('Your subscription has been canceled');
      
      // Refresh subscription data
      await loadSubscriptionData();
      setProcessingAction(false);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
      setProcessingAction(false);
    }
  };

  const handleResumeSubscription = async () => {
    if (!subscription) return;

    try {
      setProcessingAction(true);
      await SubscriptionAPI.resumeSubscription(subscription.id);
      toast.success('Your subscription has been resumed');
      
      // Refresh subscription data
      await loadSubscriptionData();
      setProcessingAction(false);
    } catch (error) {
      console.error('Error resuming subscription:', error);
      toast.error('Failed to resume subscription');
      setProcessingAction(false);
    }
  };

  const handleSetDefaultPaymentMethod = async (methodId: string) => {
    try {
      setProcessingAction(true);
      await PaymentAPI.setDefaultPaymentMethod(methodId);
      toast.success('Default payment method updated');
      
      // Refresh payment methods
      const methods = await PaymentAPI.getPaymentMethods();
      setPaymentMethods(methods);
      setProcessingAction(false);
    } catch (error) {
      console.error('Error updating default payment method:', error);
      toast.error('Failed to update default payment method');
      setProcessingAction(false);
    }
  };

  const handleRemovePaymentMethod = async (methodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    try {
      setProcessingAction(true);
      await PaymentAPI.removePaymentMethod(methodId);
      toast.success('Payment method removed');
      
      // Refresh payment methods
      const methods = await PaymentAPI.getPaymentMethods();
      setPaymentMethods(methods);
      setProcessingAction(false);
    } catch (error) {
      console.error('Error removing payment method:', error);
      toast.error('Failed to remove payment method');
      setProcessingAction(false);
    }
  };

  const handleAddPaymentMethodSuccess = () => {
    setAddPaymentDialogOpen(false);
    loadSubscriptionData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner size="lg" label="Loading subscription data..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Manage Subscription</h2>

      {/* Subscription Details */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-medium">{subscription.subscription.name}</div>
                  <div className="text-sm text-gray-500">${subscription.subscription.price}/{subscription.subscription.billingPeriod}</div>
                </div>
                <div className="flex items-center">
                  {subscription.status === 'ACTIVE' ? (
                    <div className="flex items-center text-green-500">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">Active</span>
                    </div>
                  ) : subscription.status === 'CANCELED' ? (
                    <div className="flex items-center text-red-500">
                      <XCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">Canceled</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-500">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">{subscription.status}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-start space-x-4">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Billing Period</div>
                    <div className="text-sm text-gray-500">
                      {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </div>
                    {subscription.cancelAtPeriodEnd && (
                      <div className="text-sm text-red-500 mt-1">
                        Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {subscription.cancelAtPeriodEnd ? (
                  <Button onClick={handleResumeSubscription} disabled={processingAction}>
                    {processingAction ? <Spinner size="sm" /> : 'Resume Subscription'}
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={handleCancelSubscription} disabled={processingAction}>
                    {processingAction ? <Spinner size="sm" /> : 'Cancel Subscription'}
                  </Button>
                )}
                
                <Button variant="outline" onClick={() => navigate('/subscriptions')}>
                  Change Plan
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4 text-gray-500">You don't have an active subscription</div>
              <Button onClick={() => navigate('/subscriptions')}>View Subscription Plans</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <div className="mb-4 text-gray-500">No payment methods found</div>
                <Dialog open={addPaymentDialogOpen} onOpenChange={setAddPaymentDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Add Payment Method</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                        <DialogDescription>
                            Enter your card details to add a new payment method.
                        </DialogDescription>
                        </DialogHeader>
                        {/* Remove all options, just use the basic setup */}
                        <Elements stripe={stripePromise}>
                        <AddPaymentMethodForm 
                            onSuccess={handleAddPaymentMethodSuccess} 
                            user={user}
                        />
                        </Elements>
                    </DialogContent>
                    </Dialog>

              </div>
            ) : (
              <>
                <div className="grid gap-4">
                  {paymentMethods.map((method) => (
                    <div 
                      key={method.id}
                      className="p-4 border rounded-lg flex items-center justify-between group"
                    >
                      <div className="flex items-center">
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full mr-4">
                          <CreditCard className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center">
                            {method.brand} •••• {method.last4}
                            {method.isDefault && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">Expires {method.expiryMonth}/{method.expiryYear}</div>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                        {!method.isDefault && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSetDefaultPaymentMethod(method.id)}
                            disabled={processingAction}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemovePaymentMethod(method.id)}
                          disabled={processingAction || method.isDefault}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Dialog open={addPaymentDialogOpen} onOpenChange={setAddPaymentDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="mt-4">
                        Add New Payment Method
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                        <DialogDescription>
                            Enter your card details to add a new payment method.
                        </DialogDescription>
                        </DialogHeader>
                        {/* Remove all options, just use the basic setup */}
                        <Elements stripe={stripePromise}>
                        <AddPaymentMethodForm 
                            onSuccess={handleAddPaymentMethodSuccess} 
                            user={user}
                        />
                        </Elements>
                    </DialogContent>
                    </Dialog>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4 text-gray-500">
              View your complete billing history in the customer portal
            </div>
            <Button variant="outline" className="flex items-center" onClick={() => window.open('#', '_blank')}>
              View Billing Portal
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageSubscriptionComponent;