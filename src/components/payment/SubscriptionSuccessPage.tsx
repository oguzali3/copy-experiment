import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SocialHeader } from "@/components/social/SocialHeader";
import { SocialSidebar } from "@/components/social/SocialSidebar";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, CreditCard, BadgeCheck, Clock } from "lucide-react";
import SubscriptionAPI from "@/services/subscriptionApi";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/loaders";

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [countdown, setCountdown] = useState(10);

  // Load subscription info
  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!isAuthenticated) return;
      
      try {
        const currentSubscription = await SubscriptionAPI.getCurrentSubscription();
        setSubscription(currentSubscription);
      } catch (error) {
        console.error('Error loading subscription data:', error);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    if (isAuthenticated && !isLoading) {
      loadSubscriptionData();
    }
  }, [isAuthenticated, isLoading]);

  // Handle authentication redirection
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/signin');
    }
    
    // Add confetti effect on page load
    const showConfetti = () => {
      // This is a placeholder - you would import and use a confetti library
      console.log("Showing confetti effect");
    };
    
    showConfetti();
    
    // Set a countdown for automatic redirect
    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          navigate('/portfolio');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [isLoading, isAuthenticated, navigate]);

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
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-6 text-green-500">
                <CheckCircle className="h-24 w-24" />
              </div>
              
              <h1 className="text-3xl font-bold mb-4">Subscription Successful!</h1>
              
              <p className="text-lg mb-8 max-w-md">
                Thank you for subscribing. You now have access to premium features and content.
              </p>
              
              {isLoadingSubscription ? (
                <div className="flex items-center justify-center mb-6">
                  <Spinner size="md" />
                  <span className="ml-2">Loading subscription details...</span>
                </div>
              ) : subscription ? (
                <Card className="max-w-md w-full mb-8 bg-white dark:bg-gray-800">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Your Subscription Details</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <BadgeCheck className="h-5 w-5 text-green-500 mr-3" />
                        <div>
                          <div className="font-medium">{subscription.subscription.name}</div>
                          <div className="text-sm text-gray-500">${subscription.subscription.price}/{subscription.subscription.billingPeriod}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <div className="font-medium">Billing Period</div>
                          <div className="text-sm text-gray-500">
                            {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 text-purple-500 mr-3" />
                        <div className="font-medium">Payment Method on File</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
              
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate('/portfolio')}
                  className="min-w-[200px]"
                >
                  View My Portfolios
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate('/settings?tab=subscription')}
                  className="min-w-[200px]"
                >
                  Manage My Subscription
                </Button>
              </div>
              
              <div className="mt-8 flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Redirecting in {countdown} seconds...</span>
              </div>
              
              <div className="mt-8 max-w-lg">
                <h3 className="text-lg font-semibold mb-2">What's Next?</h3>
                <ul className="text-left space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1" />
                    <span>Explore your new premium features</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1" />
                    <span>Create and share your investment portfolios</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1" />
                    <span>Access advanced analytics and market data</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;