// src/services/priceRefreshService.ts - optimized version
import portfolioApi, { invalidatePortfolioCache } from './portfolioApi';
import { toast } from 'sonner';
import { Portfolio } from '@/components/portfolio/types';

class PriceRefreshService {
  private refreshOperations = new Map<string, Promise<Portfolio>>();
  private lastRefreshTimes = new Map<string, number>();
  
  // Minimum time between refreshes to prevent API abuse (5 minutes)
  private readonly MIN_REFRESH_INTERVAL = 5 * 60 * 1000; 
  
  /**
   * Refresh prices for a specific portfolio with deduplication
   * @param portfolioId The ID of the portfolio to refresh
   * @param forceRefresh Whether to force a refresh even if recently refreshed
   * @returns The updated portfolio with fresh prices
   */
  async refreshPortfolioPrices(
    portfolioId: string, 
    forceRefresh = false
  ): Promise<Portfolio> {
    // If there's already a refresh in progress for this portfolio, return that promise
    if (this.refreshOperations.has(portfolioId)) {
      console.log(`Reusing in-flight refresh operation for portfolio ${portfolioId}`);
      return this.refreshOperations.get(portfolioId)!;
    }
    
    // Check if we've refreshed recently, unless forced
    if (!forceRefresh) {
      const lastRefreshTime = this.lastRefreshTimes.get(portfolioId);
      if (lastRefreshTime) {
        const timeSinceLastRefresh = Date.now() - lastRefreshTime;
        if (timeSinceLastRefresh < this.MIN_REFRESH_INTERVAL) {
          console.log(`Using recently cached data for portfolio ${portfolioId} (${Math.round(timeSinceLastRefresh / 1000)}s ago)`);
          
          // Get the cached data instead of refreshing
          const portfolios = await portfolioApi.getPortfolios({ 
            skipRefresh: true,
            portfolioId: portfolioId // Pass specific portfolioId to only get this one
          });
          const portfolio = portfolios.find(p => p.id === portfolioId);
          
          if (portfolio) {
            return portfolio;
          }
        }
      }
    }
    
    // Create a refresh operation
    const refreshOperation = (async () => {
      try {
        // IMPORTANT: Only clear cache for THIS portfolio, not all portfolios
        await invalidatePortfolioCache(portfolioId);
        
        // Call the API to refresh prices
        const refreshedPortfolio = await portfolioApi.refreshPrices(portfolioId);
        
        // Update last refresh time
        this.lastRefreshTimes.set(portfolioId, Date.now());
        
        return refreshedPortfolio;
      } finally {
        // Remove from operations when done
        this.refreshOperations.delete(portfolioId);
      }
    })();
    
    // Store the promise for deduplication
    this.refreshOperations.set(portfolioId, refreshOperation);
    
    return refreshOperation;
  }
  
  /**
   * Get the last refresh time for a portfolio
   * @returns The timestamp of the last successful refresh or null if never refreshed
   */
  getLastRefreshTime(portfolioId: string): Date | null {
    const timestamp = this.lastRefreshTimes.get(portfolioId);
    return timestamp ? new Date(timestamp) : null;
  }
  
  /**
   * Get the current market status
   * @returns The current market status
   */
  getMarketStatus(): 'open' | 'closed' | 'pre-market' | 'after-hours' {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Weekend
    if (day === 0 || day === 6) return 'closed';
    
    // Check various market hours
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
  }

  /**
   * Lightweight check if market is open
   */
  isMarketOpen(): boolean {
    const status = this.getMarketStatus();
    return status === 'open' || status === 'pre-market' || status === 'after-hours';
  }

  /**
   * Clear the refresh cache for a specific portfolio or all portfolios
   */
  clearRefreshCache(portfolioId?: string): void {
    if (portfolioId) {
      this.lastRefreshTimes.delete(portfolioId);
    } else {
      this.lastRefreshTimes.clear();
    }
  }
}

// Create a singleton instance to be used across the app
const priceRefreshService = new PriceRefreshService();

export default priceRefreshService;