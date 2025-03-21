/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/portfolioApi.ts
import { Portfolio, Stock } from '@/components/portfolio/types';
import apiClient from '@/utils/apiClient';
import { AuthService, getUserData } from '@/services/auth.service';
import { standardizePortfolioData } from '@/utils/portfolioDataUtils';

// Request deduplication system
// Store ongoing promises to deduplicate in-flight identical requests
const pendingRequests = new Map<string, Promise<any>>();
// Cache completed responses
const requestCache = new Map<string, {data: any, timestamp: number}>();
const CACHE_TTL = 10000; // 10 seconds cache lifetime

// Helper to create cache key from request details
const createCacheKey = (endpoint: string, params?: any) => {
  return `${endpoint}${params ? '_' + JSON.stringify(params) : ''}`;
};

// Deduplicate and cache GET requests
const dedupGet = async <T>(endpoint: string, params?: any): Promise<T> => {
  // Add timestamp to prevent browser caching on page refresh
  const paramsWithTimestamp = { 
    ...params, 
    _t: Date.now() // Add timestamp to URL 
  };
  
  const cacheKey = createCacheKey(endpoint, params); // Keep original cache key without timestamp
  const now = Date.now();
  
  // Check if we have a valid cached response
  const cached = requestCache.get(cacheKey);
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    console.log(`[Cache hit] Using cached response for ${cacheKey}`);
    return cached.data as T;
  }
  
  // Check if there's already an in-flight request
  const pendingRequest = pendingRequests.get(cacheKey);
  if (pendingRequest) {
    console.log(`[Request dedup] Reusing in-flight request for ${cacheKey}`);
    return pendingRequest;
  }
  
  // Create a new request with the timestamped params
  const requestPromise = (async () => {
    try {
      const response = await apiClient.get<T>(endpoint, { 
        params: paramsWithTimestamp,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      // Cache the response
      requestCache.set(cacheKey, { data: response.data, timestamp: now });
      return response.data;
    } finally {
      // Remove from pending requests when done
      pendingRequests.delete(cacheKey);
    }
  })();
  
  // Store the promise
  pendingRequests.set(cacheKey, requestPromise);
  
  return requestPromise;
};

// Interface for API request bodies
interface CreatePortfolioRequest {
  name: string;
  positions: {
    ticker: string;
    name: string;
    shares: number;
    avgPrice: number;
  }[];
  userId?: string; // Add userId as an optional field
}

interface UpdatePositionRequest {
  ticker: string;
  shares?: number;
  avgPrice?: number;
}

// Add interfaces for backend response types
interface PortfolioResponseDto {
  id: string;
  name: string;
  totalValue: number;
  positions: StockPositionResponseDto[]; // Backend uses 'positions' instead of 'stocks'
  userId: string;
  createdAt: string;
  updatedAt: string;
  previousDayValue: number;
  dayChange: number;
  dayChangePercent: number;
  lastPriceUpdate: Date | null;
}

interface StockPositionResponseDto {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  percentOfPortfolio: number;
  gainLoss: number;
  gainLossPercent: number;
  createdAt: string;
  updatedAt: string;
}

interface GetPortfoliosOptions {
  skipRefresh?: boolean;
  forceRefresh?: boolean;
  portfolioId?: string;
}

interface PortfolioHistoryData {
  date: string;
  value: number;
  previousValue: number;
  dayChange: number;
  dayChangePercent: number;
}

interface PortfolioHistoryResponse {
  portfolioId: string;
  interval: 'daily' | 'weekly' | 'monthly';
  data: PortfolioHistoryData[];
}

interface PortfolioPerformanceData {
  dates: string[];
  portfolioValues: number[];
  performanceValues: number[];
  performancePercent: number[];
}

interface PortfolioPerformanceResponse {
  portfolioId: string;
  data: PortfolioPerformanceData;
}

interface StockHistoryData {
  date: string;
  ticker: string;
  shares: number;
  price: number;
  marketValue: number;
  percentOfPortfolio: number;
}

interface StockHistoryResponse {
  portfolioId: string;
  ticker: string;
  data: StockHistoryData[];
}

const mapToPortfolio = (dto: PortfolioResponseDto): Portfolio => {
  // Helper function to ensure numbers
  const ensureNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'string') return parseFloat(val) || 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    return 0;
  };

  // First convert positions to standard format for Portfolio type
  const stocks = dto.positions.map(pos => ({
    ticker: pos.ticker,
    name: pos.name,
    shares: ensureNumber(pos.shares),
    avgPrice: ensureNumber(pos.avgPrice),
    currentPrice: ensureNumber(pos.currentPrice),
    marketValue: ensureNumber(pos.shares) * ensureNumber(pos.currentPrice), // Recalculate for consistency
    percentOfPortfolio: ensureNumber(pos.percentOfPortfolio),
    gainLoss: ensureNumber(pos.gainLoss),
    gainLossPercent: ensureNumber(pos.gainLossPercent)
  }));
  
  // Calculate total value from positions
  const calculatedTotal = stocks.reduce((sum, stock) => sum + stock.marketValue, 0);
  
  // Get reported total value
  const reportedTotal = ensureNumber(dto.totalValue);
  
  // Use calculated value if there's a significant discrepancy
  const totalValue = Math.abs(calculatedTotal - reportedTotal) > 0.5 ? calculatedTotal : reportedTotal;
  
  // Log if there's a discrepancy
  if (Math.abs(calculatedTotal - reportedTotal) > 0.5) {
    console.warn(`Portfolio ${dto.id} total value mismatch - API: ${reportedTotal}, Calculated: ${calculatedTotal}, Using: ${totalValue}`);
  }
  
  // Create initial portfolio object with the basic data
  const portfolio = {
    id: dto.id,
    name: dto.name,
    totalValue: totalValue,
    previousDayValue: ensureNumber(dto.previousDayValue),
    dayChange: totalValue - ensureNumber(dto.previousDayValue), // Recalculate using consistent total
    dayChangePercent: ensureNumber(dto.previousDayValue) > 0 
      ? ((totalValue - ensureNumber(dto.previousDayValue)) / ensureNumber(dto.previousDayValue)) * 100 
      : 0,
    lastPriceUpdate: dto.lastPriceUpdate ? new Date(dto.lastPriceUpdate) : null,
    stocks: stocks
  };
  
  // Standardize the portfolio data to ensure all values are proper numbers
  return standardizePortfolioData(portfolio);
};

// Map position DTO to Stock model
const mapToStock = (dto: StockPositionResponseDto): Stock => {
  // Helper function to ensure all values are proper numbers
  const ensureNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'string') return parseFloat(val) || 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    return 0;
  };
  
  return {
    ticker: dto.ticker,
    name: dto.name,
    shares: ensureNumber(dto.shares),
    avgPrice: ensureNumber(dto.avgPrice),
    currentPrice: ensureNumber(dto.currentPrice),
    marketValue: ensureNumber(dto.marketValue),
    percentOfPortfolio: ensureNumber(dto.percentOfPortfolio),
    gainLoss: ensureNumber(dto.gainLoss),
    gainLossPercent: ensureNumber(dto.gainLossPercent)
  };
};

// Create an API request queue to prevent multiple concurrent requests
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;

  public async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.process();
    });
  }

  private async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Request error:', error);
        }
      }
    }

    this.processing = false;
  }
}

// Create request queue instance
const requestQueue = new RequestQueue();

// Function to detect and correct data mismatches
const detectAndCorrectDataMismatch = (portfolio: Portfolio): Portfolio => {
  // Calculate the expected total value based on stock positions
  const calculatedTotalValue = portfolio.stocks.reduce(
    (sum, stock) => sum + stock.marketValue, 
    0
  );
  
  // Check if there's a significant discrepancy (more than 50 cents)
  if (Math.abs(calculatedTotalValue - portfolio.totalValue) > 0.5) {
    console.warn(`Total value mismatch in portfolio ${portfolio.id}: API value = ${portfolio.totalValue}, calculated = ${calculatedTotalValue}`);
    
    // Recalculate percentages
    const updatedStocks = portfolio.stocks.map(stock => ({
      ...stock,
      percentOfPortfolio: calculatedTotalValue > 0 
        ? (stock.marketValue / calculatedTotalValue) * 100 
        : 0
    }));
    
    // Recalculate day change values
    const previousDayValue = portfolio.previousDayValue || calculatedTotalValue;
    const dayChange = calculatedTotalValue - previousDayValue;
    const dayChangePercent = previousDayValue > 0 
      ? (dayChange / previousDayValue) * 100 
      : 0;
    
    // Return corrected portfolio
    return {
      ...portfolio,
      totalValue: calculatedTotalValue,
      dayChange,
      dayChangePercent,
      stocks: updatedStocks
    };
  }
  
  return portfolio;
};

export function clearAllCaches() {
  console.log('Clearing ALL portfolio-related caches');
  
  // Log all keys being cleared for debugging
  console.log('Cache keys being cleared:', Array.from(requestCache.keys()));
  
  // Clear the ENTIRE cache
  requestCache.clear();
  
  // Clear all in-flight requests too
  console.log('Pending requests being cleared:', Array.from(pendingRequests.keys()));
  pendingRequests.clear();
  
  console.log('Cache and pending requests completely cleared');
}

export function invalidatePortfolioCache(portfolioId: string) {
  const keysToInvalidate: string[] = [];
  
  // Find all cache keys related to this portfolio
  Array.from(requestCache.keys()).forEach(key => {
    if (key.includes(`/portfolios/${portfolioId}/`) || 
        key.includes(`light_refresh_${portfolioId}`) ||
        key === `/portfolios/${portfolioId}`) {
      keysToInvalidate.push(key);
    }
  });
  
  // Delete the cached data
  keysToInvalidate.forEach(key => {
    console.log(`[Cache] Invalidating ${key}`);
    requestCache.delete(key);
  });
}



const portfolioApi = {
  clearAllCaches,
  getPortfolios: async (options?: GetPortfoliosOptions): Promise<Portfolio[]> => {
    try {
      const skipRefresh = options?.skipRefresh === true;
      const forceRefresh = options?.forceRefresh === true;
      const specificPortfolioId = options?.portfolioId; // Add this parameter
      
      // If force refresh is true, clear specific portfolio cache instead of all
      if (forceRefresh && specificPortfolioId) {
        invalidatePortfolioCache(specificPortfolioId);
      } else if (forceRefresh) {
        // Only clear all if explicitly requested with no specific ID
        clearAllCaches();
      }
      
      // Add timestamp and other params
      const params = { 
        skipRefresh, 
        forceRefresh,
        portfolioId: specificPortfolioId, // Pass to API if specified
        _t: Date.now() // Add timestamp to prevent browser caching
      };
      
      // Add cache-busting headers to the request
      const headers = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      // Make the request with cache busting
      const response = await apiClient.get<PortfolioResponseDto[]>(
        '/portfolios', 
        { 
          params,
          headers
        }
      );
      
      // Process portfolios with validation
      let portfolios = response.data.map(dto => {
        // First check if we have recent light refresh data available
        const lightRefreshCacheKey = `light_refresh_${dto.id}`;
        const lightRefreshData = requestCache.get(lightRefreshCacheKey);
        
        // Use light refresh data if available and recent (less than 30 seconds old)
        if (lightRefreshData && (Date.now() - lightRefreshData.timestamp < 30000)) {
          console.log(`Using light refresh data for portfolio ${dto.id}`);
          return lightRefreshData.data as Portfolio;
        }
        
        // Otherwise process through standard mapping and validation
        const portfolio = mapToPortfolio(dto);
        return standardizePortfolioData(portfolio);
      });
      
      // Filter by portfolioId if specified
      if (specificPortfolioId) {
        portfolios = portfolios.filter(p => p.id === specificPortfolioId);
      }
      
      return portfolios;
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      return [];
    }
  },
  

  // Create portfolio
  createPortfolio: async (data: CreatePortfolioRequest): Promise<Portfolio> => {
    // Queue this request to prevent race conditions
    return requestQueue.add(async () => {
      // First, try to get user data from localStorage
      let userId = getUserData()?.id;
      
      // If not available, try to fetch it from the API
      if (!userId) {
        const currentUser = await AuthService.getCurrentUser(true);
        userId = currentUser?.id;
      }
      
      if (!userId) {
        throw new Error('User ID is required to create a portfolio');
      }
      
      // Include the userId in the request
      const requestData = {
        ...data,
        userId
      };
      
      try {
        const response = await apiClient.post<PortfolioResponseDto>('/portfolios', requestData);
        // Clear relevant cache entries
        clearAllCaches();
        
        // Map and validate the response data
        const portfolio = mapToPortfolio(response.data);
        return detectAndCorrectDataMismatch(portfolio);
      } catch (error) {
        console.error('Error creating portfolio:', error);
        // Add better error handling
        if (error.response?.data?.message) {
          const errorMessage = Array.isArray(error.response.data.message) 
            ? error.response.data.message.join(', ') 
            : error.response.data.message;
          
          throw new Error(errorMessage);
        }
        throw error;
      }
    });
  },

  // Update portfolio
  updatePortfolio: async (id: string, name: string): Promise<Portfolio> => {
    // Queue this request to prevent race conditions
    return requestQueue.add(async () => {
      const response = await apiClient.put<PortfolioResponseDto>(`/portfolios/${id}`, { name });
      // Invalidate cached data for this portfolio
      invalidatePortfolioCache(id);
      
      // Map and validate the response data
      const portfolio = mapToPortfolio(response.data);
      return detectAndCorrectDataMismatch(portfolio);
    });
  },

  // Delete portfolio
  deletePortfolio: async (id: string): Promise<void> => {
    // Queue this request to prevent race conditions
    return requestQueue.add(async () => {
      await apiClient.delete(`/portfolios/${id}`);
      // Invalidate cached data for this portfolio
      clearAllCaches();
    });
  },

  // Add position to portfolio
  addPosition: async (portfolioId: string, position: {
    ticker: string;
    name: string;
    shares: number;
    avgPrice: number;
  }): Promise<Stock> => {
    // Queue this request to prevent race conditions
    return requestQueue.add(async () => {
      // Ensure numeric values
      const cleanPosition = {
        ...position,
        shares: Number(position.shares),
        avgPrice: Number(position.avgPrice),
      };
      
      const response = await apiClient.post<StockPositionResponseDto>(
        `/portfolios/${portfolioId}/positions`, 
        cleanPosition,
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
      
      // Invalidate cached data for this portfolio
      invalidatePortfolioCache(portfolioId);
      
      // Map and return the processed stock
      return mapToStock(response.data);
    });
  },

  // Update position
  updatePosition: async (portfolioId: string, ticker: string, data: UpdatePositionRequest): Promise<Stock> => {
    // Queue this request to prevent race conditions
    return requestQueue.add(async () => {
      // Ensure numeric values
      const cleanData = {
        ...data,
        shares: data.shares !== undefined ? Number(data.shares) : undefined,
        avgPrice: data.avgPrice !== undefined ? Number(data.avgPrice) : undefined,
      };
      
      const response = await apiClient.put<StockPositionResponseDto>(
        `/portfolios/${portfolioId}/positions/${ticker}`, 
        cleanData,
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
      
      // Invalidate cached data for this portfolio
      invalidatePortfolioCache(portfolioId);
      
      // Map and return the processed stock
      return mapToStock(response.data);
    });
  },

  // Delete position
  deletePosition: async (portfolioId: string, ticker: string): Promise<void> => {
    // Queue this request to prevent race conditions
    return requestQueue.add(async () => {
      await apiClient.delete(`/portfolios/${portfolioId}/positions/${ticker}`,
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
      // Invalidate cached data for this portfolio
      invalidatePortfolioCache(portfolioId);
    });
  },

  // Refresh portfolio prices
    // Modify refreshPrices to avoid extra refresh calls
    refreshPrices: async (portfolioId: string): Promise<Portfolio> => {
      return requestQueue.add(async () => {
        try {
          // Only invalidate cache for this specific portfolio
          invalidatePortfolioCache(portfolioId);
          
          // Make the refresh request with cache-busting headers
          const response = await apiClient.post<PortfolioResponseDto>(
            `/portfolios/${portfolioId}/refresh`, 
            {},
            {
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            }
          );
          
          // Process the response data
          const portfolio = mapToPortfolio(response.data);
          const correctedPortfolio = detectAndCorrectDataMismatch(portfolio);
          
          // IMPORTANT: Don't trigger another portfolios request
          // This is what's causing the duplicate requests
          /*
          setTimeout(() => {
            apiClient.get('/portfolios', { 
              params: { 
                forceRefresh: true,
                _t: Date.now() 
              },
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            }).catch(err => console.error('Background refresh error:', err));
          }, 500);
          */
          
          return correctedPortfolio;
        } catch (error) {
          console.error('Error refreshing portfolio prices:', error);
          let errorMessage = 'Failed to refresh portfolio prices';
          if (error.response?.data?.message) {
            errorMessage = Array.isArray(error.response.data.message) 
              ? error.response.data.message.join(', ') 
              : error.response.data.message;
          }
          throw new Error(errorMessage);
        }
      });
    }
  ,

  // Bulk refresh all portfolios (to be used at app initialization)
  refreshAllPrices: async (portfolioIds: string[]): Promise<void> => {
    // Queue in sequence to prevent API rate limit issues
    return requestQueue.add(async () => {
      // Clear all cache before refreshing
      clearAllCaches();
      
      for (const id of portfolioIds) {
        try {
          await apiClient.post<PortfolioResponseDto>(
            `/portfolios/${id}/refresh`, 
            {},
            {
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            }
          );
        } catch (error) {
          console.error(`Error refreshing portfolio ${id}:`, error);
        }
      }
    });
  },
  
  getLightRefreshPortfolio: async (portfolioId: string): Promise<Portfolio> => {
    try {
      // Add cache-busting timestamp and headers
      const params = { _t: Date.now() };
      const headers = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      console.log(`Performing light refresh for portfolio ${portfolioId}`);
      
      // Make the request with cache busting
      const response = await apiClient.get<PortfolioResponseDto>(
        `/portfolios/${portfolioId}/light-refresh`,
        { params, headers }
      );
      
      // Process portfolio data through our mapping function
      const portfolio = mapToPortfolio(response.data);
      const standardizedPortfolio = standardizePortfolioData(portfolio);
      
      // Store the light refresh data in a special cache for immediate use
      requestCache.set(`light_refresh_${portfolioId}`, {
        data: standardizedPortfolio,
        timestamp: Date.now()
      });
      
      return standardizedPortfolio;
    } catch (error) {
      console.error('Error light refreshing portfolio:', error);
      
      // Handle the case where the light refresh fails - try to get the portfolio from cache
      console.log('Attempting to get portfolio from existing data');
      const portfolios = await apiClient.get<PortfolioResponseDto[]>('/portfolios', {
        params: { 
          skipRefresh: true,
          portfolioId: portfolioId 
        }
      });
      
      if (portfolios.data && portfolios.data.length > 0) {
        const matchingPortfolio = portfolios.data.find(p => p.id === portfolioId);
        if (matchingPortfolio) {
          const portfolio = mapToPortfolio(matchingPortfolio);
          return standardizePortfolioData(portfolio);
        }
      }
      
      throw error;
    }
  },
  
  getPortfolioPerformance: async (
    portfolioId: string,
    startDate?: string,
    endDate?: string
  ): Promise<PortfolioPerformanceResponse> => {
    try {
      // Add cache-busting timestamp and params
      const params = {
        startDate,
        endDate,
        _t: Date.now()
      };
      
      const headers = {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };
      
      // Make the request with cache busting
      const response = await apiClient.get<PortfolioPerformanceResponse>(
        `/portfolios/${portfolioId}/performance`,
        { params, headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio performance:', error);
      throw error;
    }
  },
  
  // Get stock position history
  getStockHistory: async (
    portfolioId: string,
    ticker: string,
    startDate?: string,
    endDate?: string
  ): Promise<StockHistoryResponse> => {
    try {
      // Add cache-busting timestamp and params
      const params = {
        startDate,
        endDate,
        _t: Date.now()
      };
      
      const headers = {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };
      
      // Make the request with cache busting
      const response = await apiClient.get<StockHistoryResponse>(
        `/portfolios/${portfolioId}/positions/${ticker}/history`,
        { params, headers }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching stock history for ${ticker}:`, error);
      throw error;
    }
  },
  
  getPortfolioHistory: async (
    portfolioId: string,
    startDate?: string,
    endDate?: string,
    interval: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<PortfolioHistoryResponse> => {
    try {
      // Add cache-busting timestamp and params
      const params = {
        startDate,
        endDate,
        interval,
        _t: Date.now()
      };
      
      const headers = {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };
      
      // Make the request with cache busting
      const response = await apiClient.get<PortfolioHistoryResponse>(
        `/portfolios/${portfolioId}/history`,
        { params, headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio history:', error);
      throw error;
    }
  }
};

export default portfolioApi;