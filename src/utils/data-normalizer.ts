// src/utils/data-normalizer.ts
import { Portfolio, StockPosition } from '../models/portfolio.model';

/**
 * Ensures a value is a valid number
 * @param value Any value that should be a number
 * @returns A valid number or 0 if invalid
 */
export const ensureNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'string') return parseFloat(value) || 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  return 0;
};

/**
 * Normalize a stock position with consistent numeric values
 * @param position Stock position to normalize
 * @returns Normalized stock position
 */
export const normalizePosition = (position: Partial<StockPosition>): StockPosition => {
  const shares = ensureNumber(position.shares);
  const avgPrice = ensureNumber(position.avgPrice);
  const currentPrice = ensureNumber(position.currentPrice);
  
  // Calculate derived values
  const marketValue = shares * currentPrice;
  const gainLoss = marketValue - (shares * avgPrice);
  const gainLossPercent = avgPrice > 0 
    ? ((currentPrice - avgPrice) / avgPrice) * 100 
    : 0;
  
  return {
    ticker: position.ticker || '',
    name: position.name || '',
    shares,
    avgPrice,
    currentPrice,
    marketValue,
    percentOfPortfolio: 0, // Will be calculated when normalizing portfolio
    gainLoss,
    gainLossPercent
  };
};

/**
 * Normalize a portfolio with consistent numeric values
 * @param portfolio Portfolio to normalize
 * @returns Normalized portfolio
 */
export const normalizePortfolio = (portfolio: Partial<Portfolio>): Portfolio => {
  if (!portfolio) throw new Error('Portfolio is required');
  
  // Normalize each position
  const normalizedPositions = (portfolio.positions || [])
    .map(position => normalizePosition(position));
  
  // Calculate total portfolio value
  const totalValue = normalizedPositions.reduce(
    (sum, position) => sum + position.marketValue, 
    0
  );
  
  // Ensure previous day value
  const previousDayValue = ensureNumber(portfolio.previousDayValue);
  
  // Calculate day change values
  const dayChange = totalValue - previousDayValue;
  const dayChangePercent = previousDayValue > 0 
    ? (dayChange / previousDayValue) * 100 
    : 0;
  
  // Calculate percentage of portfolio for each position
  const positionsWithPercentages = normalizedPositions.map(position => ({
    ...position,
    percentOfPortfolio: totalValue > 0 
      ? (position.marketValue / totalValue) * 100 
      : 0
  }));
  
  return {
    id: portfolio.id || '',
    name: portfolio.name || '',
    positions: positionsWithPercentages,
    totalValue,
    previousDayValue,
    dayChange,
    dayChangePercent,
    lastPriceUpdate: portfolio.lastPriceUpdate || null
  };
};

/**
 * Format a currency value consistently
 * @param value Number to format as currency
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  if (value === undefined || isNaN(value)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Format a percentage value consistently
 * @param value Number to format as percentage
 * @returns Formatted percentage string
 */
export const formatPercent = (value: number): string => {
  if (value === undefined || isNaN(value)) {
    return '0.00%';
  }
  
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

/**
 * Determine market status based on current time
 * @returns Current market status
 */
export const determineMarketStatus = (): 'open' | 'closed' | 'pre-market' | 'after-hours' => {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  // Weekend
  if (day === 0 || day === 6) return 'closed';
  
  // Check market hours (9:30 AM - 4:00 PM ET, simplified)
  const marketMinutes = hours * 60 + minutes;
  const marketOpenMinutes = 9 * 60 + 30;  // 9:30 AM
  const marketCloseMinutes = 16 * 60;     // 4:00 PM
  const preMarketOpenMinutes = 4 * 60;    // 4:00 AM (pre-market)
  const afterHoursCloseMinutes = 20 * 60; // 8:00 PM (after-hours)
  
  if (marketMinutes >= marketOpenMinutes && marketMinutes < marketCloseMinutes) {
    return 'open';
  } else if (marketMinutes >= preMarketOpenMinutes && marketMinutes < marketOpenMinutes) {
    return 'pre-market';
  } else if (marketMinutes >= marketCloseMinutes && marketMinutes < afterHoursCloseMinutes) {
    return 'after-hours';
  } else {
    return 'closed';
  }
};

/**
 * Format a date for display on charts
 * @param dateString Date string to format
 * @param timeframe Current chart timeframe
 * @returns Formatted date string
 */
export const formatDateForDisplay = (dateString: string, timeframe: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString; // Return original if invalid date
  }
  
  switch (timeframe) {
    case '1D':
      return new Intl.DateTimeFormat('en-US', { 
        hour: 'numeric', minute: 'numeric', hour12: true 
      }).format(date);
    case '5D':
    case '15D':
      return new Intl.DateTimeFormat('en-US', { 
        weekday: 'short', month: 'short', day: 'numeric' 
      }).format(date);
    case '1M':
    case '3M':
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', day: 'numeric' 
      }).format(date);
    case '6M':
    case '1Y':
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', year: 'numeric' 
      }).format(date);
    case 'ALL':
      return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric' 
      }).format(date);
    default:
      return dateString;
  }
};