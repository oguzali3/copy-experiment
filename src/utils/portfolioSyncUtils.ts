// src/utils/portfolioSyncUtils.ts
import { Portfolio, Stock } from '@/components/portfolio/types';

/**
 * Ensures consistent numeric values throughout a portfolio
 * @param portfolio The portfolio to sanitize
 * @returns A portfolio with consistent numeric values
 */
export const sanitizePortfolio = (portfolio: Portfolio): Portfolio => {
  if (!portfolio) return portfolio;
  
  // Helper function to ensure numeric values
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ensureNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'string') return parseFloat(val) || 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    return 0;
  };

  // Sanitize stocks with accurate calculations
  const sanitizedStocks = portfolio.stocks.map(stock => {
    const shares = ensureNumber(stock.shares);
    const avgPrice = ensureNumber(stock.avgPrice);
    const currentPrice = ensureNumber(stock.currentPrice);
    
    // Always calculate market value based on shares * currentPrice
    const marketValue = shares * currentPrice;
    
    // Calculate gain/loss metrics
    const gainLoss = marketValue - (shares * avgPrice);
    const gainLossPercent = avgPrice > 0 ? (gainLoss / (shares * avgPrice)) * 100 : 0;
    
    return {
      ...stock,
      shares,
      avgPrice,
      currentPrice,
      marketValue,
      gainLoss,
      gainLossPercent,
      // percentOfPortfolio will be recalculated after totalValue is determined
      percentOfPortfolio: 0
    };
  });
  
  // Calculate total value from positions
  const totalValue = sanitizedStocks.reduce((sum, stock) => sum + stock.marketValue, 0);
  
  // Ensure numeric portfolio values
  const previousDayValue = ensureNumber(portfolio.previousDayValue);
  
  // Calculate day change values
  const dayChange = totalValue - previousDayValue;
  const dayChangePercent = previousDayValue > 0 ? (dayChange / previousDayValue) * 100 : 0;
  
  // Calculate percentOfPortfolio for each stock
  const stocksWithPercent = sanitizedStocks.map(stock => ({
    ...stock,
    percentOfPortfolio: totalValue > 0 ? (stock.marketValue / totalValue) * 100 : 0
  }));
  
  return {
    ...portfolio,
    totalValue,
    previousDayValue,
    dayChange,
    dayChangePercent,
    stocks: stocksWithPercent,
    lastPriceUpdate: portfolio.lastPriceUpdate
  };
};

/**
 * Detects and fixes common inconsistencies in portfolio data
 * @param portfolios Array of portfolios to synchronize
 * @returns Sanitized portfolios with consistent values
 */
export const synchronizePortfolioData = (portfolios: Portfolio[]): Portfolio[] => {
  return portfolios.map(portfolio => sanitizePortfolio(portfolio));
};

/**
 * Merge portfolio data, preferring fresh values for specific fields
 * @param currentPortfolio The current portfolio data
 * @param freshData Fresh data to merge (e.g., from light refresh)
 * @returns A merged portfolio with preference for fresh data
 */
export const mergePortfolioData = (
  currentPortfolio: Portfolio, 
  freshData: Portfolio
): Portfolio => {
  if (!currentPortfolio || !freshData) {
    return currentPortfolio || freshData;
  }
  
  // Start with the current portfolio
  const result = { ...currentPortfolio };
  
  // Update stocks with fresh data
  const updatedStocks = result.stocks.map(currentStock => {
    // Find matching stock in fresh data
    const freshStock = freshData.stocks.find(s => s.ticker === currentStock.ticker);
    if (!freshStock) return currentStock;
    
    // Prefer fresh data for prices and calculated values
    return {
      ...currentStock,
      currentPrice: freshStock.currentPrice,
      marketValue: freshStock.marketValue,
      percentOfPortfolio: freshStock.percentOfPortfolio,
      gainLoss: freshStock.gainLoss,
      gainLossPercent: freshStock.gainLossPercent
    };
  });
  
  // Prefer fresh data for portfolio-level metrics
  return {
    ...result,
    totalValue: freshData.totalValue,
    previousDayValue: freshData.previousDayValue,
    dayChange: freshData.dayChange,
    dayChangePercent: freshData.dayChangePercent,
    lastPriceUpdate: freshData.lastPriceUpdate,
    stocks: updatedStocks
  };
};