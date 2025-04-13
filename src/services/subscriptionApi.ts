// src/services/subscriptionApi.ts
import apiClient from '@/utils/apiClient';
import PaymentAPI from './paymentApi';

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
  paymentMethodId?: string;

}

interface SubscribeDto {
    subscriptionId: string;
    paymentMethodId: string;
    userId: string;
    stripeCustomerId?: string;
}
interface SwitchPlanDto {
    newSubscriptionId: string;
    paymentMethodId?: string;
    prorate?: boolean;
}

// Cache for subscription data
const cache = {
  subscriptions: null as Subscription[] | null,
  currentSubscription: null as UserSubscription | null,
  lastFetch: {
    subscriptions: 0,
    currentSubscription: 0
  }
};

// Cache lifetime in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

const SubscriptionAPI = {
  /**
   * Get all available subscription plans
   */
  getAvailableSubscriptions: async (): Promise<Subscription[]> => {
    // Check if we have cached data that's still valid
    const now = Date.now();
    if (cache.subscriptions && (now - cache.lastFetch.subscriptions < CACHE_TTL)) {
      return cache.subscriptions;
    }

    try {
      const response = await apiClient.get<Subscription[]>('/subscriptions');
      
      // Add sample features if not provided by API
      const subscriptionsWithFeatures = response.data.map(sub => ({
        ...sub,
        features: sub.features || getSampleFeatures(sub.tier)
      }));
      
      // Cache the result
      cache.subscriptions = subscriptionsWithFeatures;
      cache.lastFetch.subscriptions = now;
      
      return subscriptionsWithFeatures;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  },

  /**
   * Get the current user's subscription
   */
  getCurrentSubscription: async (): Promise<UserSubscription | null> => {
    // Check if we have cached data that's still valid
    const now = Date.now();
    if (cache.currentSubscription && (now - cache.lastFetch.currentSubscription < CACHE_TTL)) {
      return cache.currentSubscription;
    }

    try {
      const response = await apiClient.get<UserSubscription>('/subscriptions/current');
      
      // Cache the result
      cache.currentSubscription = response.data;
      cache.lastFetch.currentSubscription = now;
      
      return response.data;
    } catch (error) {
      // If 404, user doesn't have a subscription
      if (error.response && error.response.status === 404) {
        cache.currentSubscription = null;
        cache.lastFetch.currentSubscription = now;
        return null;
      }
      
      console.error('Error fetching current subscription:', error);
      throw error;
    }
  },


  subscribeUser: async (subscribeDto: SubscribeDto): Promise<UserSubscription> => {
    try {
      console.log('Subscription request data:', subscribeDto);
      
      // Validate input
      if (!subscribeDto.subscriptionId) {
        throw new Error('Subscription ID is required');
      }
      
      if (!subscribeDto.paymentMethodId) {
        throw new Error('Payment method ID is required');
      }
      
      if (!subscribeDto.userId) {
        throw new Error('User ID is required');
      }
      
      // Include stripeCustomerId if available
      if (!subscribeDto.stripeCustomerId) {
        try {
          const { stripeCustomerId } = await PaymentAPI.getOrCreateStripeCustomer();
          subscribeDto.stripeCustomerId = stripeCustomerId;
        } catch (err) {
          console.warn('Could not get Stripe customer ID, continuing without it', err);
        }
      }
      
      // Make the API request with additional logging
      try {
        const response = await apiClient.post<UserSubscription>('/subscriptions', subscribeDto);
        console.log('Subscription response:', response.status, response.statusText);
        
        // Invalidate cache
        cache.currentSubscription = null;
        
        return response.data;
      } catch (apiError) {
        // Log API error details
        console.error('API Error details:', {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          message: apiError.message
        });
        throw apiError;
      }
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      throw error;
    }
  },
  /**
 * Switch to a different subscription plan
 * Workaround implementation that uses existing endpoints
 */
    switchPlan: async (switchPlanDto: SwitchPlanDto): Promise<UserSubscription> => {
        try {
        console.log('Switch plan request data:', switchPlanDto);
        
        // Validate input
        if (!switchPlanDto.newSubscriptionId) {
            throw new Error('New subscription ID is required');
        }
        
        // Get current subscription
        const currentSubscription = await SubscriptionAPI.getCurrentSubscription();
        
        if (!currentSubscription) {
            throw new Error('No active subscription found to switch from');
        }
        
        // Instead of calling the non-existent switch-plan endpoint, we'll:
        // 1. Cancel the existing subscription (but continue to end of billing period)
        // 2. Create a new subscription with the new plan
        
        // Step 1: Cancel the existing subscription
        console.log(`Cancelling existing subscription: ${currentSubscription.id}`);
        await apiClient.delete(`/subscriptions/${currentSubscription.id}`);
        
        // Step 2: Create a new subscription with the new plan
        const subscribeData: SubscribeDto = {
            subscriptionId: switchPlanDto.newSubscriptionId,
            paymentMethodId: switchPlanDto.paymentMethodId || currentSubscription.paymentMethodId,
            userId: currentSubscription.userId,
            stripeCustomerId: currentSubscription.stripeCustomerId
        };
        
        console.log('Creating new subscription with data:', subscribeData);
        const response = await apiClient.post<UserSubscription>('/subscriptions', subscribeData);
        
        console.log('New subscription created successfully:', response.status, response.statusText);
        
        // Invalidate cache
        cache.currentSubscription = null;
        
        return response.data;
        } catch (error) {
        console.error('Error switching subscription plan:', error);
        throw error;
        }
    },
  
  /**
   * Cancel a subscription with improved error handling
   */
  cancelSubscription: async (subscriptionId: string): Promise<void> => {
    if (!subscriptionId) {
      throw new Error('Subscription ID is required to cancel a subscription');
    }
    
    try {
      console.log(`Cancelling subscription: ${subscriptionId}`);
      
      const response = await apiClient.delete(`/subscriptions/${subscriptionId}`);
      console.log('Cancellation response:', response.status, response.statusText);
      
      // Invalidate cache
      cache.currentSubscription = null;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      if (error.response?.data) {
        console.error('Server response:', error.response.data);
      }
      throw error;
    }
  },
  
  /**
   * Resume a canceled subscription with improved error handling
   */
  resumeSubscription: async (subscriptionId: string): Promise<UserSubscription> => {
    if (!subscriptionId) {
      throw new Error('Subscription ID is required to resume a subscription');
    }
    
    try {
      console.log(`Resuming subscription: ${subscriptionId}`);
      
      const response = await apiClient.post<UserSubscription>(`/subscriptions/${subscriptionId}/resume`);
      console.log('Resume response:', response.status, response.statusText);
      
      // Invalidate cache
      cache.currentSubscription = null;
      
      return response.data;
    } catch (error) {
      console.error('Error resuming subscription:', error);
      if (error.response?.data) {
        console.error('Server response:', error.response.data);
      }
      throw error;
    }
  },

  /**
   * Get user subscription status (tier)
   */
  getUserSubscriptionStatus: async (): Promise<string> => {
    try {
      const response = await apiClient.get<string>('/subscriptions/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      throw error;
    }
  },

  /**
   * Process a webhook event
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  processSubscriptionWebhook: async (payload: any, signature: string): Promise<void> => {
    try {
      await apiClient.post('/webhooks/stripe', payload, {
        headers: {
          'stripe-signature': signature
        }
      });
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  },

  /**
   * Clear cache
   */
  clearCache: () => {
    cache.subscriptions = null;
    cache.currentSubscription = null;
    cache.lastFetch.subscriptions = 0;
    cache.lastFetch.currentSubscription = 0;
  }
};

// Helper function to generate sample features for each tier
function getSampleFeatures(tier: string): string[] {
  const baseFeatures = [
    'View public portfolios',
    'Create 1 portfolio',
    'Basic market data'
  ];

  const premiumFeatures = [
    ...baseFeatures,
    'Create up to 5 portfolios',
    'Advanced analytics',
    'Performance tracking',
    'Real-time market data'
  ];

  const creatorFeatures = [
    ...premiumFeatures,
    'Unlimited portfolios',
    'Monetize your portfolios',
    'Access to follower insights',
    'Priority support',
    'Custom analysis tools'
  ];

  switch (tier) {
    case 'PREMIUM':
      return premiumFeatures;
    case 'CREATOR':
      return creatorFeatures;
    case 'FREE':
    default:
      return baseFeatures;
  }
}

export default SubscriptionAPI;