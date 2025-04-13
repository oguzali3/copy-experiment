/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/creatorSubscriptionApi.ts
import apiClient from '@/utils/apiClient';
import {
  PortfolioSubscriptionPrice,
  SubscriberInfo,
  SubscriptionAnalytics,
  SubscribeResponse,
  SubscriptionPeriod
} from '@/types/subscription';
import { toast } from 'sonner';

// Cache for analytics data
const cache: {
  analytics: SubscriptionAnalytics | null;
  lastFetch: number;
} = {
  analytics: null,
  lastFetch: 0
};

// Cache lifetime in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

const CreatorSubscriptionAPI = {

    /**
   * Subscribe to a portfolio
   * 
   * @param portfolioId The ID of the portfolio to subscribe to
   * @param paymentMethodId Stripe payment method ID
   * @param userId The ID of the user subscribing
   * @param billingPeriod The type of subscription (monthly or annual)
   * @param creatorId The ID of the creator who owns the portfolio
   * @returns Subscription response with access details
   */
  subscribeToPortfolio: async (
    portfolioId: string,
    paymentMethodId: string,
    userId: string,
    billingPeriod: 'monthly' | 'annual' = 'monthly',
    creatorId: string
  ): Promise<SubscribeResponse> => {
    try {
      // Log what we're sending
      console.log('Sending subscription request:', {
        portfolioId,
        paymentMethodId,
        userId,
        billingPeriod,
        creatorId,
        accessType: 'SUBSCRIBER'
      });
      
      // Call the API with all required fields
      const response = await apiClient.post<SubscribeResponse>(
        '/creator-subscriptions/subscribe',
        {
          portfolioId,
          paymentMethodId,
          userId,
          billingPeriod,
          creatorId,
          accessType: 'SUBSCRIBER'
        }
      );
      
      console.log('Subscription response:', response.data);
      return response.data;
    } catch (error: any) {
      // Enhanced error logging
      console.error('Error subscribing to portfolio:', 
        error.response?.data || error.message || error);
        
      // Try to extract the most useful error message
      let errorMessage = 'Failed to process subscription';
      
      if (error.response?.data?.message) {
        // If it's an array of messages, join them
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join('. ');
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Unsubscribe from a portfolio
   * 
   * @param portfolioId The ID of the portfolio to unsubscribe from
   */
  unsubscribeFromPortfolio: async (portfolioId: string): Promise<void> => {
    try {
      await apiClient.delete(`/creator-subscriptions/portfolios/${portfolioId}/unsubscribe`);
    } catch (error) {
      console.error('Error unsubscribing from portfolio:', error);
      throw error;
    }
  },

  /**
   * Set or update a portfolio's subscription price
   * 
   * @param portfolioId The ID of the portfolio to set pricing for 
   * @param priceData The pricing data
   * @returns The updated pricing data
   */
  setPortfolioSubscriptionPrice: async (
    portfolioId: string, 
    priceData: Omit<PortfolioSubscriptionPrice, 'portfolioId'>
  ): Promise<PortfolioSubscriptionPrice> => {
    try {
      // Make sure to include portfolioId in the request body
      const requestData = {
        ...priceData,
        portfolioId // Include this explicitly
      };
      
      const response = await apiClient.put<PortfolioSubscriptionPrice>(
        `/creator-subscriptions/portfolios/${portfolioId}/price`, 
        requestData
      );
      return response.data;
    } catch (error) {
      console.error('Error setting portfolio subscription price:', error);
      throw error;
    }
  },

  /**
   * Get a portfolio's subscription price
   * 
   * @param portfolioId The ID of the portfolio to get pricing for
   * @returns The portfolio subscription price or null if not found
   */
  getPortfolioSubscriptionPrice: async (
    portfolioId: string
  ): Promise<PortfolioSubscriptionPrice | null> => {
    try {
      const response = await apiClient.get<PortfolioSubscriptionPrice>(
        `/creator-subscriptions/portfolios/${portfolioId}/price`
      );
      
      // Transform the response if needed for backward compatibility
      if (response.data && 'monthlyPrice' in response.data) {
        // If API returns old format, convert to new format
        return {
          portfolioId: portfolioId,
          monthlyPrice: (response.data as any).monthlyPrice,
          annualPrice: (response.data as any).annualPrice,
          currency: response.data.currency,
          offerTrial: response.data.offerTrial,
          trialDays: response.data.trialDays
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error getting portfolio subscription price:', error);
      
    }
  },

  /**
   * Get all portfolios the user is subscribed to
   * 
   * @returns Array of portfolio IDs
   */
  getMySubscribedPortfolios: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get<string[]>('/creator-subscriptions/my-subscriptions');
      return response.data;
    } catch (error: any) {
      console.error('Error getting subscribed portfolios:', error);
      
      // If the API endpoint is not implemented, return mock data for development
      if (error.response && error.response.status === 404) {
        console.warn('Creator subscription API endpoint not available, returning mock data');
        return [];
      }
      
      throw error;
    }
  },

  /**
   * Get all subscribers for a portfolio
   * 
   * @param portfolioId The ID of the portfolio to get subscribers for
   * @returns Array of subscriber info
   */
  getPortfolioSubscribers: async (portfolioId: string): Promise<SubscriberInfo[]> => {
    try {
      const response = await apiClient.get<SubscriberInfo[]>(`/creator-subscriptions/portfolios/${portfolioId}/subscribers`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting portfolio subscribers:', error);
      
      // If the API endpoint is not implemented, return mock data for development
      if (error.response && error.response.status === 404) {
        console.warn('Creator subscription API endpoint not available, returning mock data');
        return [];
      }
      
      throw error;
    }
  },

  /**
   * Get subscription analytics for the creator
   * 
   * @returns Subscription analytics data
   */
  getCreatorAnalytics: async (): Promise<SubscriptionAnalytics> => {
    // Check if we have cached data that's still valid
    const now = Date.now();
    if (cache.analytics && (now - cache.lastFetch < CACHE_TTL)) {
      return cache.analytics;
    }
    
    try {
      const response = await apiClient.get<SubscriptionAnalytics>('/creator-subscriptions/analytics');
      
      // Cache the result
      cache.analytics = response.data;
      cache.lastFetch = now;
      
      return response.data;
    } catch (error: any) {
      console.error('Error getting creator analytics:', error);
      
      // If the API endpoint is not implemented, return mock data
      if (error.response && error.response.status === 404) {
        console.warn('Analytics API endpoint not available, returning mock data');
        
        // Cache the mock data with default values (you can expand this)
        const mockData: SubscriptionAnalytics = {
          totalSubscribers: 0,
          activeSubscribers: 0,
          monthlyRevenue: 0,
          revenueByPortfolio: [],
          subscriberGrowth: []
        };
        
        cache.analytics = mockData;
        cache.lastFetch = now;
        
        return mockData;
      }
      
      throw error;
    }
  },
  
  // Clear cache
  clearCache: () => {
    cache.analytics = null;
    cache.lastFetch = 0;
  }
};

export default CreatorSubscriptionAPI;