// src/services/priceRefreshService.ts
import apiClient from '@/utils/apiClient';
import { Portfolio } from '@/components/portfolio/types';

interface MarketStatus {
  isMarketOpen: boolean;
  nextMarketOpenTime: Date;
  lastMarketCloseTime: Date;
  marketHours: { open: string; close: string };
  serverTime: Date;
}

class PriceRefreshService {
  private lastRefreshTimes = new Map<string, Date>();
  private marketStatusCache: MarketStatus | null = null;
  private marketStatusLastChecked: number = 0;
  private readonly MARKET_STATUS_TTL = 60 * 1000; // 1 minute

  // Track when a portfolio was last refreshed
  recordRefresh(portfolioId: string): void {
    this.lastRefreshTimes.set(portfolioId, new Date());
  }

  getLastRefreshTime(portfolioId: string): Date | null {
    return this.lastRefreshTimes.get(portfolioId) || null;
  }

  clearRefreshCache(portfolioId: string): void {
    this.lastRefreshTimes.delete(portfolioId);
  }

  // Refresh a specific portfolio with price updates
  async refreshPortfolioPrices(portfolioId: string, force: boolean = false): Promise<Portfolio> {
    try {
      const endpoint = force 
        ? `/portfolios/${portfolioId}/force-sync` 
        : `/portfolios/${portfolioId}/refresh`;
        
      interface PortfolioResponseDto {
        id: string;
        name: string;
        totalValue: number;
        positions: Array<{
          ticker: string;
          name: string;
          shares: number;
          avgPrice: number;
          currentPrice: number;
          marketValue: number;
          percentOfPortfolio: number;
          gainLoss: number;
          gainLossPercent: number;
        }>;
        previousDayValue: number;
        dayChange: number;
        dayChangePercent: number;
        lastPriceUpdate: Date | null;
        visibility: string;
        description?: string;
        userId: string;
      }
      
      const response = await apiClient.post<PortfolioResponseDto>(endpoint, {}, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      this.recordRefresh(portfolioId);
      
      // Map the response to Portfolio type
      const stocks = response.data.positions.map(pos => ({
        ticker: pos.ticker,
        name: pos.name,
        shares: Number(pos.shares),
        avgPrice: Number(pos.avgPrice),
        currentPrice: Number(pos.currentPrice),
        marketValue: Number(pos.marketValue),
        percentOfPortfolio: Number(pos.percentOfPortfolio),
        gainLoss: Number(pos.gainLoss),
        gainLossPercent: Number(pos.gainLossPercent)
      }));
      
      const portfolio: Portfolio = {
        id: response.data.id,
        name: response.data.name,
        stocks: stocks,
        totalValue: Number(response.data.totalValue),
        previousDayValue: Number(response.data.previousDayValue),
        dayChange: Number(response.data.dayChange),
        dayChangePercent: Number(response.data.dayChangePercent),
        lastPriceUpdate: response.data.lastPriceUpdate,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        visibility: response.data.visibility as any,
        description: response.data.description || '',
        userId: response.data.userId
      };
      
      return portfolio;
    } catch (error) {
      console.error('Error refreshing portfolio prices:', error);
      throw error;
    }
  }

  // Get market status
  async getMarketStatusFromAPI(): Promise<MarketStatus> {
    try {
      const now = Date.now();
      
      // Return cached status if recent
      if (this.marketStatusCache && now - this.marketStatusLastChecked < this.MARKET_STATUS_TTL) {
        return this.marketStatusCache;
      }
      
      const response = await apiClient.get<MarketStatus>('/portfolios/market/status');
      this.marketStatusCache = response.data;
      this.marketStatusLastChecked = now;
      
      return response.data;
    } catch (error) {
      console.error('Error fetching market status:', error);
      
      // Return default values on error
      return {
        isMarketOpen: false,
        nextMarketOpenTime: new Date(),
        lastMarketCloseTime: new Date(),
        marketHours: { open: '09:30', close: '16:00' },
        serverTime: new Date()
      };
    }
  }

  // Check if market is open
  async isMarketOpen(): Promise<boolean> {
    const status = await this.getMarketStatusFromAPI();
    return status.isMarketOpen;
  }

  // Get market status as a string
  getMarketStatus(): 'open' | 'closed' | 'pre-market' | 'after-hours' {
    if (!this.marketStatusCache) {
      return 'closed';
    }
    
    const now = new Date();
    
    if (this.marketStatusCache.isMarketOpen) {
      return 'open';
    }
    
    // Check for pre-market (before opening)
    const today = now.toISOString().split('T')[0];
    const marketHours = this.marketStatusCache.marketHours;
    
    if (!marketHours || !marketHours.open || !marketHours.close) {
      return 'closed';
    }
    
    const openTimeToday = new Date(`${today}T${marketHours.open}`);
    const closeTimeToday = new Date(`${today}T${marketHours.close}`);
    
    if (now < openTimeToday && now.getDay() >= 1 && now.getDay() <= 5) {
      return 'pre-market';
    }
    
    if (now > closeTimeToday && now.getDay() >= 1 && now.getDay() <= 5) {
      // Check if it's within 2 hours after closing
      const twoHoursAfterClose = new Date(closeTimeToday);
      twoHoursAfterClose.setHours(twoHoursAfterClose.getHours() + 2);
      
      if (now < twoHoursAfterClose) {
        return 'after-hours';
      }
    }
    
    return 'closed';
  }
}

export default new PriceRefreshService();