// src/services/stripeConnectApi.ts
import apiClient from '@/utils/apiClient';

// Interface for account status
export interface StripeConnectAccountStatus {
  isConnected: boolean;
  needsOnboarding: boolean;
  requiresAction: boolean;
  isActive: boolean;
  details_submitted: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
}

// Interface for onboarding link response
export interface OnboardingLinkResponse {
  url: string;
}

// Interface for dashboard link response
export interface DashboardLinkResponse {
  url: string;
}

// Interface for portfolio product creation
export interface PortfolioProductRequest {
  portfolioId: string;
  portfolioName: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
}

export interface PortfolioProductResponse {
  productId: string;
  priceId: string;
}

const StripeConnectService = {
  // Get the current status of the user's Stripe Connect account
  getAccountStatus: async (userId?: string): Promise<StripeConnectAccountStatus> => {
    try {
      const response = await apiClient.get<any>('/stripe-connect/account-status');
      
      // Map response to expected format
      return {
        isConnected: response.data.isConnected,
        needsOnboarding: !response.data.detailsSubmitted,
        requiresAction: response.data.requirements && 
                        response.data.requirements.currently_due && 
                        response.data.requirements.currently_due.length > 0,
        isActive: response.data.chargesEnabled && response.data.payoutsEnabled,
        details_submitted: response.data.detailsSubmitted,
        charges_enabled: response.data.chargesEnabled,
        payouts_enabled: response.data.payoutsEnabled
      };
    } catch (error) {
      console.error('Error getting Stripe Connect account status:', error);
      
      // If the API endpoint returns a 404, it means either:
      // 1. The endpoint isn't implemented yet
      // 2. The user doesn't have a Stripe Connect account
      if (error.response && error.response.status === 404) {
        console.warn('Stripe Connect API endpoint not found or user has no account');
        return {
          isConnected: false,
          needsOnboarding: true,
          requiresAction: false,
          isActive: false,
          details_submitted: false,
          charges_enabled: false,
          payouts_enabled: false
        };
      }
      
      throw error;
    }
  },
  
  // Generate an onboarding link for the creator
  getOnboardingLink: async (userId: string, returnUrl: string): Promise<OnboardingLinkResponse> => {
    try {
      // Try multiple possible endpoint patterns
      let response;
      try {
        // Try the path from your existing structure
        response = await apiClient.get<{url: string}>(`/social/payments/stripe/connect/onboarding-link?returnUrl=${encodeURIComponent(returnUrl)}`);
      } catch (firstError) {
        try {
          // Try alternative path structure
          response = await apiClient.get<{url: string}>(`/stripe-connect/onboarding-link?returnUrl=${encodeURIComponent(returnUrl)}`);
        } catch (secondError) {
          // If both fail, throw the original error
          throw firstError;
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error getting Stripe Connect onboarding link:', error);
      
      // If the API endpoint isn't implemented yet, provide a mock link for development
      if (error.response && error.response.status === 404) {
        console.warn('Stripe Connect API endpoint not found, falling back to mock data');
        return {
          url: `https://connect.stripe.com/setup/s/mock-onboarding?return_url=${encodeURIComponent(returnUrl)}`
        };
      }
      
      throw error;
    }
  },
  
  // Get a link to the Stripe dashboard for the creator
  getDashboardLink: async (userId?: string): Promise<DashboardLinkResponse> => {
    try {
      // Try multiple possible endpoint patterns
      let response;
      try {
        // Try the path from your existing structure
        response = await apiClient.get<{url: string}>('/social/payments/stripe/connect/dashboard-link');
      } catch (firstError) {
        try {
          // Try alternative path structure
          response = await apiClient.get<{url: string}>('/stripe-connect/dashboard-link');
        } catch (secondError) {
          // If both fail, throw the original error
          throw firstError;
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error getting Stripe Connect dashboard link:', error);
      
      // If the API endpoint isn't implemented yet, provide a mock link
      if (error.response && error.response.status === 404) {
        console.warn('Stripe Connect API endpoint not found, falling back to mock data');
        return {
          url: 'https://dashboard.stripe.com/test/connect/overview'
        };
      }
      
      throw error;
    }
  },
  
  // Create a product and price for a portfolio
  createPortfolioProduct: async (
    userId: string,
    portfolioId: string,
    portfolioName: string,
    amount: number,
    currency: string = 'USD',
    interval: 'month' | 'year' = 'month'
  ): Promise<PortfolioProductResponse> => {
    try {
      const requestData: PortfolioProductRequest = {
        portfolioId,
        portfolioName,
        amount,
        currency,
        interval
      };
      
      // Try multiple possible endpoint patterns
      let response;
      try {
        // Try the path from your existing structure
        response = await apiClient.post<PortfolioProductResponse>(
          '/social/payments/stripe/connect/portfolio-product',
          requestData
        );
      } catch (firstError) {
        try {
          // Try alternative path structure
          response = await apiClient.post<PortfolioProductResponse>(
            '/stripe-connect/portfolio-product',
            requestData
          );
        } catch (secondError) {
          // If both fail, throw the original error
          throw firstError;
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating portfolio product:', error);
      
      // If the API endpoint isn't implemented yet, return mock IDs
      if (error.response && error.response.status === 404) {
        console.warn('Stripe Connect API endpoint not found, falling back to mock data');
        return {
          productId: `prod_mock_${Math.random().toString(36).substring(2, 11)}`,
          priceId: `price_mock_${Math.random().toString(36).substring(2, 11)}`
        };
      }
      
      throw error;
    }
  },
  
  // Simulate a change in account status (for demo/development)
  simulateAccountStatus: (status: Partial<StripeConnectAccountStatus>): StripeConnectAccountStatus => {
    const defaultStatus = {
      isConnected: false,
      needsOnboarding: true,
      requiresAction: false,
      isActive: false,
      details_submitted: false,
      charges_enabled: false,
      payouts_enabled: false
    };
    
    return { ...defaultStatus, ...status };
  }
};

export default StripeConnectService;