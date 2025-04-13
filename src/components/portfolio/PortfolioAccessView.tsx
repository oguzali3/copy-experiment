/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/portfolio/PortfolioAccessView.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Portfolio } from '@/components/portfolio/types';
import { PortfolioView } from '@/components/portfolio/PortfolioView';
import portfolioApi from '@/services/portfolioApi';
import accessControlService from '@/services/accessControlService';
import creatorSubscriptionApi from '@/services/creatorSubscriptionApi';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle, Info, Loader2 } from 'lucide-react';
import PortfolioAccessDenied from './PortfolioAccessDenied';
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Elements, 
  CardElement, 
  useStripe, 
  useElements,
  PaymentRequestButtonElement
} from '@stripe/react-stripe-js';
import apiClient from '@/utils/apiClient';
import PaymentAPI from '@/services/paymentApi';

// Initialize Stripe with your publishable key
// Replace this with your actual publishable key
const stripePromise = loadStripe('pk_test_51R7ffjP03K9QaBZcwxbAeRRzovFMa6kq1MlOZSDRSX76mPfadRRKvGxTIlPMx0AokZUDcq2tFa4tgGS2fSVbdgee00oedNBEHg');

// Payment form component that collects card details
const PaymentForm = ({ onSubscribe, planType, price, currency = 'USD', isProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState('');
  
  // In your PaymentForm component, modify handleSubmit:

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast.error("Stripe hasn't loaded yet. Please try again.");
      return;
    }
    
    // Get card element
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error("Card element not found");
      return;
    }
    
    // Clear any previous errors
    setCardError('');
    
    try {
      // First, create the payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      
      if (error) {
        console.error('Payment method creation error:', error);
        setCardError(error.message || 'An error occurred with your card');
        return;
      }
      
      // Instead of passing just the ID, pass the entire payment method object
      // This allows the parent component to have the option to attach it first
      onSubscribe(planType, paymentMethod.id, paymentMethod);
    } catch (err) {
      console.error('Error in payment submission:', err);
      setCardError('An unexpected error occurred. Please try again.');
    }
  };
  
  const cardElementOptions = {
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
    hidePostalCode: true,
  };
  
  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card details
        </label>
        <div className="p-3 border rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <CardElement options={cardElementOptions} />
        </div>
        {cardError && (
          <p className="mt-2 text-sm text-red-600">{cardError}</p>
        )}
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin h-4 w-4 mr-2" />
            Processing...
          </>
        ) : (
          `Subscribe for ${currency} ${price}`
        )}
      </Button>
    </form>
  );
};

const PortfolioAccessView: React.FC = () => {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessResult, setAccessResult] = useState<{ 
    hasAccess: boolean; 
    reason?: 'private' | 'subscriptionRequired' | 'notFound';
    portfolioInfo?: any;
  }>({ hasAccess: false });
  const [subscriptionPrice, setSubscriptionPrice] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | null>(null);
  

  useEffect(() => {
    const loadPortfolioData = async () => {
      if (!portfolioId) return;
      
      // If user is not logged in, show loading state
      if (!user) {
        return;
      }
            
      setLoading(true);
      
      try {
        // First, check access to the portfolio
        const result = await accessControlService.checkPortfolioAccess(portfolioId, user.id);
        setAccessResult(result);
        
        if (result.hasAccess) {
          // User has access - load full portfolio data
          const portfolioData = await portfolioApi.getPortfolioById(portfolioId);
          setPortfolio(portfolioData);
        } else if (result.reason === 'subscriptionRequired' && result.portfolioInfo) {
          // For subscription required, use the info returned from access check
          setPortfolio({
            id: result.portfolioInfo.id,
            name: result.portfolioInfo.name,
            description: '',
            stocks: [],
            totalValue: 0,
            previousDayValue: 0,
            dayChange: 0,
            dayChangePercent: 0,
            lastPriceUpdate: null,
            visibility: result.portfolioInfo.visibility,
            userId: result.portfolioInfo.userId
          });
          
          // Load subscription price info
          const priceInfo = await creatorSubscriptionApi.getPortfolioSubscriptionPrice(portfolioId);
          setSubscriptionPrice(priceInfo);
        } else {
          // For other access denied reasons
          setPortfolio(null);
        }
      } catch (error) {
        console.error('Error loading portfolio data:', error);
        setAccessResult({
          hasAccess: false,
          reason: 'notFound'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadPortfolioData();
  }, [portfolioId, user?.id]);

  const handleSubscribe = async (priceType: 'monthly' | 'annual', paymentMethodId: string) => {
    if (!portfolioId || !user?.id) return;
    
    setIsProcessing(true);
    toast.loading("Processing subscription...", { id: "subscription-toast" });
    
    try {
      // Get creator ID from portfolio
      const creatorId = portfolio?.userId;
      
      if (!creatorId) {
        throw new Error("Creator information is missing");
      }
      
      // Step 1: Make sure we have a Stripe customer ID
      const { stripeCustomerId } = await PaymentAPI.getOrCreateStripeCustomer();
      
      // Step 2: Attach the payment method to the customer
      await PaymentAPI.attachPaymentMethod(paymentMethodId);
      console.log("Payment method attached successfully");
      
      // Step 3: Now proceed with the subscription
      await creatorSubscriptionApi.subscribeToPortfolio(
        portfolioId,
        paymentMethodId,
        user.id,
        priceType,
        creatorId
      );
      
      toast.success("Successfully subscribed to portfolio!", { id: "subscription-toast" });
      
      // Refresh access status
      const result = await accessControlService.checkPortfolioAccess(portfolioId, user.id);
      setAccessResult(result);
      
      if (result.hasAccess) {
        const portfolioData = await portfolioApi.getPortfolioById(portfolioId);
        setPortfolio(portfolioData);
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to process subscription";
      toast.error(errorMessage, { id: "subscription-toast" });
      
      console.error("Subscription error:", error);
      
      // More detailed error handling
      if (errorMessage.includes('payment method')) {
        toast.error("There was an issue with your payment method. Please try a different card.", 
          { id: "subscription-hint-toast", duration: 6000 });
      } else if (errorMessage.includes('subscription pricing') || errorMessage.includes('No such price')) {
        toast.error("There was an issue with the subscription setup. Please contact support.", 
          { id: "subscription-hint-toast", duration: 6000 });
      }
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const showPaymentForm = (planType: 'monthly' | 'annual') => {
    setSelectedPlan(planType);
  };

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2">Loading portfolio...</span>
      </div>
    );
  }

  // Handle access denied cases
  if (!accessResult.hasAccess) {
    if (accessResult.reason === 'subscriptionRequired' && portfolio) {
      // Show subscription UI
      return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-2">{portfolio.name}</h2>
          <p className="text-gray-600 mb-6">{portfolio.description || "Subscribe to access this premium portfolio."}</p>
          
          {/* Creator info */}
          {portfolio.userId && (
            <div className="flex items-center mb-6">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarFallback>{portfolio.userId.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Created by: User {portfolio.userId.substring(0, 5)}</p>
                <p className="text-sm text-gray-500">Premium Content Creator</p>
              </div>
            </div>
          )}
          
          {/* Portfolio teaser */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium mb-2">What you'll get</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Full access to this premium portfolio
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Real-time performance tracking
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Investment insights from experienced creators
              </li>
            </ul>
          </div>
          
          {/* Subscription options */}
          <div className="border-t border-b py-4 my-4">
            <h3 className="text-xl font-semibold mb-4">Subscription Options</h3>
            
            {subscriptionPrice ? (
              <Elements stripe={stripePromise}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Monthly Plan */}
                  <div className={`border rounded-lg p-4 flex flex-col ${selectedPlan === 'monthly' ? 'ring-2 ring-blue-500' : ''}`}>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium">Monthly Plan</h4>
                      <p className="text-3xl font-bold my-2">
                        ${subscriptionPrice.monthlyPrice || subscriptionPrice.monthly}
                        <span className="text-sm text-gray-500 font-normal">/month</span>
                      </p>
                      <ul className="text-sm text-gray-600 space-y-2 my-4">
                        <li>✓ Full access to portfolio details</li>
                        <li>✓ Real-time performance tracking</li>
                        <li>✓ Cancel anytime</li>
                      </ul>
                    </div>
                    
                    {selectedPlan === 'monthly' ? (
                      <PaymentForm 
                        onSubscribe={handleSubscribe} 
                        planType="monthly" 
                        price={subscriptionPrice.monthlyPrice || subscriptionPrice.monthly}
                        currency={subscriptionPrice.currency || 'USD'}
                        isProcessing={isProcessing}
                      />
                    ) : (
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => showPaymentForm('monthly')}
                        disabled={isProcessing}
                      >
                        Select Monthly Plan
                      </Button>
                    )}
                  </div>
                  
                  {/* Annual Plan */}
                  <div className={`border rounded-lg p-4 flex flex-col ${selectedPlan === 'annual' ? 'ring-2 ring-blue-500' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-medium">Annual Plan</h4>
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          SAVE {Math.round(100 - ((subscriptionPrice.annualPrice || subscriptionPrice.annual) / ((subscriptionPrice.monthlyPrice || subscriptionPrice.monthly) * 12)) * 100)}%
                        </span>
                      </div>
                      <p className="text-3xl font-bold my-2">
                        ${subscriptionPrice.annualPrice || subscriptionPrice.annual}
                        <span className="text-sm text-gray-500 font-normal">/year</span>
                      </p>
                      <ul className="text-sm text-gray-600 space-y-2 my-4">
                        <li>✓ Full access to portfolio details</li>
                        <li>✓ Real-time performance tracking</li>
                        <li>✓ Cancel anytime</li>
                        <li>✓ Annual discount</li>
                      </ul>
                    </div>
                    
                    {selectedPlan === 'annual' ? (
                      <PaymentForm 
                        onSubscribe={handleSubscribe} 
                        planType="annual" 
                        price={subscriptionPrice.annualPrice || subscriptionPrice.annual}
                        currency={subscriptionPrice.currency || 'USD'}
                        isProcessing={isProcessing}
                      />
                    ) : (
                      <Button 
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700" 
                        onClick={() => showPaymentForm('annual')}
                        disabled={isProcessing}
                      >
                        Select Annual Plan
                      </Button>
                    )}
                  </div>
                </div>
              </Elements>
            ) : (
              <div className="text-center py-4">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500 mx-auto" />
                <p className="text-gray-600 mt-2">Loading subscription options...</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <Button variant="outline" onClick={() => navigate('/portfolios/public')} disabled={isProcessing}>
              Back to Portfolios
            </Button>
            
            {subscriptionPrice?.offerTrial && (
              <p className="text-green-600 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                {subscriptionPrice.trialDays}-day free trial available
              </p>
            )}
          </div>
          
          {/* Additional info about payment */}
          <div className="mt-6 text-xs text-gray-500">
            <p>Your payment information is securely processed by Stripe. We do not store your full card details.</p>
            <p className="mt-1">By subscribing, you agree to our terms of service and privacy policy.</p>
          </div>
        </div>
      );
    }
    
    // For other access denied reasons
    return (
      <PortfolioAccessDenied 
        reason={accessResult.reason || 'notFound'} 
        portfolioName={portfolio?.name}
        portfolioId={portfolioId}
      />
    );
  }

  // User has access - show the portfolio
  if (portfolio) {
    return (
      <PortfolioView 
        portfolio={portfolio}
        onUpdatePortfolio={setPortfolio}
        onAddPortfolio={() => navigate('/portfolio/new')}
        onDeletePortfolio={(id) => {
          navigate('/portfolio');
          return Promise.resolve();
        }}
        onRefreshPrices={async (id) => {
          try {
            const refreshed = await portfolioApi.refreshPrices(id);
            setPortfolio(refreshed);
            return Promise.resolve();
          } catch (error) {
            console.error('Error refreshing prices:', error);
            return Promise.reject(error);
          }
        }}
        marketStatus="closed"
        lastRefreshTime={new Date()}
        onAddPosition={() => {}} 
        onUpdatePosition={() => {}}
        onDeletePosition={() => {}}
        isViewOnly={user.id !== portfolio.userId} // Add this line
      />
    );
  }

  // Fallback
  return <PortfolioAccessDenied reason="notFound" />;
};

export default PortfolioAccessView;