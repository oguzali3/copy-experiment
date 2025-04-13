// src/components/settings/ManageSubscriptionComponent.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loaders";
import { 
  AlertCircle, 
  CreditCard, 
  Calendar, 
  ExternalLink, 
  CheckCircle, 
  XCircle,
  RefreshCw
} from "lucide-react";
import SubscriptionAPI from "@/services/subscriptionApi";
import PaymentAPI from "@/services/paymentApi";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import AddPaymentMethodForm from "./AddPaymentMethodForm";
import SwitchPlanDialog from "../payment/SwitchPlanDialog";

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
  name: string;
  tier: string;
  price: number;
  currency: string;
  billingPeriod: string;
  stripePriceId: string;
  features: string[];
}

interface UserSubscription {
  id: string;
  userId: string;
  subscriptionId: string;
  status: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  subscription: Subscription;
}

const ManageSubscriptionComponent = () => {
  const navigate = useNavigate();
  // Get user from AuthContext
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false);
  const [switchPlanDialogOpen, setSwitchPlanDialogOpen] = useState(false);

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
  
  const handleSwitchPlanSuccess = () => {
    setSwitchPlanDialogOpen(false);
    loadSubscriptionData();
    toast.success('Your subscription plan has been updated successfully');
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
                  <>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => setSwitchPlanDialogOpen(true)}
                      disabled={processingAction}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Switch Plan
                    </Button>
                    
                    <Button variant="destructive" onClick={handleCancelSubscription} disabled={processingAction}>
                      {processingAction ? <Spinner size="sm" /> : 'Cancel Subscription'}
                    </Button>
                  </>
                )}
                
                <Button variant="outline" onClick={() => navigate('/subscriptions')}>
                  View All Plans
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
      
      {/* Switch Plan Dialog */}
      {subscription && (
        <Elements stripe={stripePromise}>
          <SwitchPlanDialog
            open={switchPlanDialogOpen}
            onOpenChange={setSwitchPlanDialogOpen}
            currentSubscription={subscription}
            paymentMethods={paymentMethods}
            onSuccess={handleSwitchPlanSuccess}
          />
        </Elements>
      )}
    </div>
  );
};

export default ManageSubscriptionComponent;