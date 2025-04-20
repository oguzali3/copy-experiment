// src/types/analytics.ts
export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

export interface PortfolioSummary {
  portfolioId: string;
  portfolioName: string;
  subscriberCount: number;
  activeSubscriberCount: number;
  revenue: number;
  growth?: number;  // percentage
}

export interface CreatorAnalyticsDto {
  totalSubscribers: number;
  activeSubscribers: number;
  totalRevenue: number;
  projectedMonthlyRevenue: number;
  churnRate: number;
  
  // Time series data
  revenueTimeSeries: TimeSeriesDataPoint[];
  subscriberTimeSeries: TimeSeriesDataPoint[];
  
  // Portfolio analytics summaries
  portfolioAnalytics: PortfolioSummary[];
}

export interface PortfolioTimeSeriesData {
  revenue: TimeSeriesDataPoint[];
  subscribers: TimeSeriesDataPoint[];
}

export interface PortfolioAnalyticsDto {
  portfolioId: string;
  portfolioName: string;
  subscriberCount: number;
  activeSubscriberCount: number;
  revenue: number;
  transactions: number;
  growth?: number;  // percentage
  
  // Time series data
  timeSeries: PortfolioTimeSeriesData;
}