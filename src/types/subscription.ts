// src/types/subscription.ts

  export type SubscriptionPeriod = 'monthly' | 'annual';
  
  export interface SubscriberInfo {
    id: string;
    name: string;
    email: string;
    joinDate: string;
    status: 'Active' | 'Trial' | 'Churned';
    lifetimeValue: number;
  }
  
  export interface SubscriptionAnalytics {
    totalSubscribers: number;
    activeSubscribers: number;
    monthlyRevenue: number;
    revenueByPortfolio: {
      portfolioId: string;
      portfolioName: string;
      revenue: number;
    }[];
    subscriberGrowth: {
      date: string;
      newSubscribers: number;
      churned: number;
    }[];
  }
  
  export interface SubscribeResponse {
    accessId: string;
    transactionId: string;
  }
  // Add this interface for Creator
export interface Creator {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  }
  
  // Create SubscribablePortfolio interface
  export interface SubscribablePortfolio {
    id: string;
    name: string;
    description: string;
    creator: Creator;
    price: {
      monthly: number;
      annual: number;
      currency: string;
      offerTrial: boolean;
      trialDays: number;
    };
    isSubscribed: boolean;
  }
  
  export interface PortfolioSubscriptionPrice {
    portfolioId: string;
    monthlyPrice: number;
    annualPrice: number;
    currency: string;
    offerTrial: boolean;
    trialDays: number;
  }