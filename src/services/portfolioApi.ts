// src/services/portfolioApi.ts
import { Portfolio, Stock } from '@/components/portfolio/types';
import apiClient from '@/utils/apiClient';
import { AuthService, getUserData } from '@/services/auth.service';

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
  }

  const mapToPortfolio = (dto: PortfolioResponseDto): Portfolio => ({
    id: dto.id,
    name: dto.name,
    totalValue: typeof dto.totalValue === 'string' ? parseFloat(dto.totalValue) : dto.totalValue,
    previousDayValue: dto.previousDayValue || dto.totalValue, // This is correct
    dayChange: dto.dayChange !== undefined ? dto.dayChange : 0, // Ensure it's explicitly 0 for new portfolios
    dayChangePercent: dto.dayChangePercent !== undefined ? dto.dayChangePercent : 0,
    lastPriceUpdate: dto.lastPriceUpdate ? new Date(dto.lastPriceUpdate) : null,
    stocks: dto.positions.map(pos => mapToStock(pos))
  });

// Map position DTO to Stock model
const mapToStock = (dto: StockPositionResponseDto): Stock => ({
  ticker: dto.ticker,
  name: dto.name,
  shares: dto.shares,
  avgPrice: dto.avgPrice,
  currentPrice: dto.currentPrice,
  marketValue: dto.marketValue,
  percentOfPortfolio: dto.percentOfPortfolio,
  gainLoss: dto.gainLoss,
  gainLossPercent: dto.gainLossPercent
});

// Create an API request queue to prevent multiple concurrent requests
class RequestQueue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const portfolioApi = {
  // In portfolioApi.ts
getPortfolios: async (options?: GetPortfoliosOptions): Promise<Portfolio[]> => {
    try {
      // Make sure this line is correctly using the options
      const skipRefresh = options?.skipRefresh === true;
      
      // And this is actually sending it to the API
      const response = await apiClient.get<PortfolioResponseDto[]>('/portfolios', {
        params: { skipRefresh }
      });
      
      return response.data.map(mapToPortfolio);
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
        return mapToPortfolio(response.data);
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
      return mapToPortfolio(response.data);
    });
  },

  // Delete portfolio
  deletePortfolio: async (id: string): Promise<void> => {
    // Queue this request to prevent race conditions
    return requestQueue.add(async () => {
      await apiClient.delete(`/portfolios/${id}`);
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
      const response = await apiClient.post<StockPositionResponseDto>(
        `/portfolios/${portfolioId}/positions`, 
        position
      );
      
      return mapToStock(response.data);
    });
  },

  // Update position
  updatePosition: async (portfolioId: string, ticker: string, data: UpdatePositionRequest): Promise<Stock> => {
    // Queue this request to prevent race conditions
    return requestQueue.add(async () => {
      const response = await apiClient.put<StockPositionResponseDto>(
        `/portfolios/${portfolioId}/positions/${ticker}`, 
        data
      );
      
      return mapToStock(response.data);
    });
  },

  // Delete position
  deletePosition: async (portfolioId: string, ticker: string): Promise<void> => {
    // Queue this request to prevent race conditions
    return requestQueue.add(async () => {
      await apiClient.delete(`/portfolios/${portfolioId}/positions/${ticker}`);
    });
  },

  // Refresh portfolio prices
  refreshPrices: async (portfolioId: string): Promise<Portfolio> => {
    // Queue this request to prevent race conditions
    return requestQueue.add(async () => {
      const response = await apiClient.post<PortfolioResponseDto>(`/portfolios/${portfolioId}/refresh`, {});
      return mapToPortfolio(response.data);
    });
  },
  
  // Bulk refresh all portfolios (to be used at app initialization)
  refreshAllPrices: async (portfolioIds: string[]): Promise<void> => {
    // Queue in sequence to prevent API rate limit issues
    return requestQueue.add(async () => {
      for (const id of portfolioIds) {
        try {
          await apiClient.post<PortfolioResponseDto>(`/portfolios/${id}/refresh`, {});
        } catch (error) {
          console.error(`Error refreshing portfolio ${id}:`, error);
        }
      }
    });
  },
  getLightRefreshPortfolio: async (portfolioId: string): Promise<Portfolio> => {
    try {
      const response = await apiClient.get<PortfolioResponseDto>(
        `/portfolios/${portfolioId}/light-refresh`
      );
      return mapToPortfolio(response.data);
    } catch (error) {
      console.error('Error light refreshing portfolio:', error);
      throw error;
    }
  },
};

export default portfolioApi;