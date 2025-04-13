import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink, ArrowRight, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/loaders';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import StripeConnectService from '@/services/stripeConnectApi';
import { Switch } from '@/components/ui/switch';
import { toast } from "sonner";

const CreatorStripeConnect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accountStatus, setAccountStatus] = useState({
    isConnected: false,
    needsOnboarding: true,
    requiresAction: false,
    isActive: false,
    details_submitted: false,
    charges_enabled: false,
    payouts_enabled: false
  });
  
  // For demo purposes - to allow testing different states
  const [demoMode, setDemoMode] = useState(false);

  // Fetch the current status of the creator's Stripe Connect account
  useEffect(() => {
    const fetchAccountStatus = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get account status from API
        const status = await StripeConnectService.getAccountStatus();
        console.log("Fetched Stripe account status:", status);
        setAccountStatus(status);
      } catch (err) {
        console.error('Error fetching account status:', err);
        setError('Unable to fetch your Stripe Connect account status. Please try again later.');
        toast.error("Failed to get Stripe Connect account status");
      } finally {
        setLoading(false);
      }
    };

    if (!demoMode) {
      fetchAccountStatus();
    }
  }, [demoMode]);

  // Generate an onboarding link for the creator
  const handleStartOnboarding = async () => {
    try {
      setLoading(true);
      
      // Build return URL
      const currentUrl = window.location.origin;
      const returnUrl = `${currentUrl}/creator/payments?tab=connect`;
      
      // For demo purposes
      if (demoMode) {
        // Just simulate the status change
        setAccountStatus(StripeConnectService.simulateAccountStatus({
          isConnected: true,
          needsOnboarding: false,
          details_submitted: true,
          requiresAction: true
        }));
        setLoading(false);
        return;
      }
      
      // Get onboarding link from API
      const { url } = await StripeConnectService.getOnboardingLink(user?.id, returnUrl);
      
      // Redirect to Stripe's onboarding flow
      window.location.href = url;
    } catch (err) {
      console.error('Error generating onboarding link:', err);
      setError('Unable to start the onboarding process. Please try again later.');
      toast.error("Failed to generate Stripe onboarding link");
      setLoading(false);
    }
  };

  // Get a link to the Stripe dashboard for the creator
  const handleViewDashboard = async () => {
    try {
      setLoading(true);
      
      // Get dashboard link from API
      const { url } = await StripeConnectService.getDashboardLink();
      
      // Open Stripe dashboard in a new tab
      window.open(url, '_blank');
      setLoading(false);
    } catch (err) {
      console.error('Error generating dashboard link:', err);
      toast.error("Failed to generate Stripe dashboard link");
      setLoading(false);
    }
  };

  // Handle navigation
  const handleNavigate = (path) => {
    navigate(path);
  };
  
  // For demo purposes - cycle through account states
  const simulateAccountState = (state) => {
    if (state === 'new') {
      setAccountStatus(StripeConnectService.simulateAccountStatus({
        isConnected: false,
        needsOnboarding: true,
        requiresAction: false,
        isActive: false,
        details_submitted: false,
        charges_enabled: false,
        payouts_enabled: false
      }));
    } else if (state === 'incomplete') {
      setAccountStatus(StripeConnectService.simulateAccountStatus({
        isConnected: true,
        needsOnboarding: false,
        requiresAction: true,
        isActive: false,
        details_submitted: true,
        charges_enabled: false,
        payouts_enabled: false
      }));
    } else if (state === 'active') {
      setAccountStatus(StripeConnectService.simulateAccountStatus({
        isConnected: true,
        needsOnboarding: false,
        requiresAction: false,
        isActive: true,
        details_submitted: true,
        charges_enabled: true,
        payouts_enabled: true
      }));
    }
  };

  // Render the appropriate content based on the account status
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your payment information...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (accountStatus.isActive && accountStatus.charges_enabled && accountStatus.payouts_enabled) {
      // Fully active account
      return (
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-medium text-green-800 dark:text-green-300">Account Active</h3>
              <p className="text-sm text-green-700 dark:text-green-400">
                Your Stripe Connect account is fully set up and ready to receive payments.
              </p>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Manage Payments</CardTitle>
                <CardDescription>View your earnings and payment history</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={handleViewDashboard} className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Stripe Dashboard
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Set Pricing</CardTitle>
                <CardDescription>Manage your subscription pricing</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={() => handleNavigate('/portfolio-pricing')}
                  className="w-full"
                >
                  Configure Pricing
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      );
    } else if (accountStatus.isConnected && accountStatus.details_submitted) {
      // Account exists but needs attention
      return (
        <div className="space-y-6">
          <Alert className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertTitle>Account Needs Attention</AlertTitle>
            <AlertDescription>
              Your Stripe account setup is incomplete. You need to complete a few more steps to start receiving payments.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Account Setup</CardTitle>
              <CardDescription>
                Please complete the remaining steps to activate your payment processing capabilities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                  <div className={`h-4 w-4 rounded-full ${accountStatus.details_submitted ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className={accountStatus.details_submitted ? 'text-green-600 dark:text-green-400' : ''}>
                    Account information submitted
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`h-4 w-4 rounded-full ${accountStatus.charges_enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className={accountStatus.charges_enabled ? 'text-green-600 dark:text-green-400' : ''}>
                    Payment processing enabled
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`h-4 w-4 rounded-full ${accountStatus.payouts_enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className={accountStatus.payouts_enabled ? 'text-green-600 dark:text-green-400' : ''}>
                    Payouts enabled
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleStartOnboarding} className="w-full">
                Continue Setup
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    } else {
      // New account, needs to start onboarding
      return (
        <Card>
          <CardHeader>
            <CardTitle>Set Up Payments with Stripe</CardTitle>
            <CardDescription>
              Connect your Stripe account to start accepting payments from subscribers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                To start monetizing your content, you'll need to connect with Stripe, our payment processor.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-2">Here's what you'll need:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your legal name and address</li>
                  <li>Your bank account details for receiving payments</li>
                  <li>A valid government ID for verification</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleStartOnboarding} className="w-full">
              Connect with Stripe
            </Button>
          </CardFooter>
        </Card>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Payment Processing</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Set up and manage how you receive payments from your subscribers.
        </p>
      </div>
      
      {/* Demo mode switch */}
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-sm text-gray-500">Demo Mode:</span>
        <Switch 
          checked={demoMode}
          onCheckedChange={setDemoMode}
        />
      </div>
      
      {/* Demo controls for switching between states */}
      {demoMode && (
        <div className="flex gap-2 mb-4">
          <Button size="sm" variant="outline" onClick={() => simulateAccountState('new')}>
            Show New Account
          </Button>
          <Button size="sm" variant="outline" onClick={() => simulateAccountState('incomplete')}>
            Show Incomplete Account
          </Button>
          <Button size="sm" variant="outline" onClick={() => simulateAccountState('active')}>
            Show Active Account
          </Button>
        </div>
      )}
      
      {renderContent()}
    </div>
  );
};

export default CreatorStripeConnect;