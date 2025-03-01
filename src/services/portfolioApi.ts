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

// Map backend response to frontend model
const mapToPortfolio = (dto: PortfolioResponseDto): Portfolio => ({
  id: dto.id,
  name: dto.name,
  totalValue: dto.totalValue,
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
  // Get all portfolios
  getPortfolios: async (): Promise<Portfolio[]> => {
    try {
      const response = await apiClient.get<PortfolioResponseDto[]>('/portfolios');
      return response.data.map(mapToPortfolio);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      return [];
    }
  },

  // Get single portfolio
  getPortfolio: async (id: string): Promise<Portfolio | null> => {
    try {
      const response = await apiClient.get<PortfolioResponseDto>(`/portfolios/${id}`);
      return mapToPortfolio(response.data);
    } catch (error) {
      console.error(`Error fetching portfolio ${id}:`, error);
      return null;
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
  }
};

export default portfolioApi;