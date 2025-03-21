// src/models/portfolio.model.ts

/**
 * Represents a stock position within a portfolio
 */
export interface StockPosition {
    ticker: string;
    name: string;
    shares: number;
    avgPrice: number;
    currentPrice: number;
    marketValue: number;
    percentOfPortfolio: number;
    gainLoss: number;
    gainLossPercent: number;
  }
  
  /**
   * Represents a complete portfolio
   */
  export interface Portfolio {
    id: string;
    name: string;
    positions: StockPosition[];
    totalValue: number;
    previousDayValue: number;
    dayChange: number;
    dayChangePercent: number;
    lastPriceUpdate: Date | null;
  }
  
  /**
   * Data needed to create a new portfolio
   */
  export interface CreatePortfolioData {
    name: string;
    positions: {
      ticker: string;
      name: string;
      shares: number;
      avgPrice: number;
    }[];
  }
  
  /**
   * Data needed to create/update a position
   */
  export interface PositionData {
    ticker: string;
    name: string;
    shares: number;
    avgPrice: number;
  }
  
  /**
   * Portfolio performance data for charts
   */
  export interface PortfolioPerformanceData {
    dates: string[];
    portfolioValues: number[];
    performanceValues: number[];
    performancePercent: number[];
  }
  
  /**
   * Portfolio history data point
   */
  export interface PortfolioHistoryDataPoint {
    date: string;
    value: number;
    dayChange: number;
    dayChangePercent: number;
  }
  
  /**
   * Market status types
   */
  export type MarketStatus = 'open' | 'closed' | 'pre-market' | 'after-hours';
  
  /**
   * Timeframe options for charts
   */
  export type TimeframeType = '1D' | '5D' | '15D' | '1M' | '3M' | '6M' | '1Y' | 'ALL';