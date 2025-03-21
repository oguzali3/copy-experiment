// // src/services/portfolio.service.ts
// import apiClient from './api-client';
// import { normalizePortfolio, normalizePosition } from '../utils/data-normalizer';
// import {
//   Portfolio,
//   StockPosition,
//   CreatePortfolioData,
//   PositionData,
//   PortfolioPerformanceData,
//   PortfolioHistoryDataPoint,
//   TimeframeType
// } from '../models/portfolio.model';

// /**
//  * Interface for backend portfolio response
//  */
// interface PortfolioResponseDto {
//   id: string;
//   name: string;
//   totalValue: number;
//   positions: PositionResponseDto[];
//   userId: string;
//   createdAt: string;
//   updatedAt: string;
//   previousDayValue: number;
//   dayChange: number;
//   dayChangePercent: number;
//   lastPriceUpdate: string | null;
// }

// /**
//  * Interface for backend position response
//  */
// interface PositionResponseDto {
//   id: string;
//   ticker: string;
//   name: string;
//   shares: number;
//   avgPrice: number;
//   currentPrice: number;
//   marketValue: number;
//   percentOfPortfolio: number;
//   gainLoss: number;
//   gainLossPercent: number;
//   createdAt: string;
//   updatedAt: string;
// }

// /**
//  * Interface for portfolio history data from API
//  */
// interface PortfolioHistoryResponseDto {
//   portfolioId: string;
//   data: {
//     date: string;
//     value: number;
//     dayChange: number;
//     dayChangePercent: number;
//   }[];
// }

// /**
//  * Interface for portfolio performance data from API
//  */
// interface PortfolioPerformanceResponseDto {
//   portfolioId: string;
//   data: {
//     dates: string[];
//     portfolioValues: number[];
//     performanceValues: number[];
//     performancePercent: number[];
//   };
// }

// /**
//  * Options for fetching portfolios
//  */
// interface GetPortfoliosOptions {
//   skipRefresh?: boolean;
//   forceRefresh?: boolean;
// }

// /**
//  * Service for portfolio-related operations
//  */
// class PortfolioService {
//   /**
//    * Get all portfolios for the current user
//    */
//   async getPortfolios(options?: GetPortfoliosOptions): Promise<Portfolio[]> {
//     try {
//       const response = await apiClient.get<PortfolioResponseDto[]>('/portfolios', {
//         params: {
//           skipRefresh: options?.skipRefresh,
//           forceRefresh: options?.forceRefresh
//         }
//       });

//       // Normalize and return portfolios
//       return response.map(dto => this.mapDtoToPortfolio(dto));
//     } catch (error) {
//       console.error('Error fetching portfolios:', error);
//       throw new Error('Failed to fetch portfolios');
//     }
//   }

//   /**
//    * Get a specific portfolio by ID
//    */
//   async getPortfolio(id: string, skipRefresh = false): Promise<Portfolio> {
//     try {
//       const response = await apiClient.get<PortfolioResponseDto>(`/portfolios/${id}`, {
//         params: { skipRefresh }
//       });

//       return this.mapDtoToPortfolio(response);
//     } catch (error) {
//       console.error(`Error fetching portfolio ${id}:`, error);
//       throw new Error('Failed to fetch portfolio');
//     }
//   }

//   /**
//    * Create a new portfolio
//    */
//   async createPortfolio(data: CreatePortfolioData): Promise<Portfolio> {
//     try {
//       const response = await apiClient.post<PortfolioResponseDto>('/portfolios', data);
      
//       // Clear cache after creating a portfolio
//       apiClient.clearCache();
      
//       return this.mapDtoToPortfolio(response);
//     } catch (error) {
//       console.error('Error creating portfolio:', error);
//       throw new Error('Failed to create portfolio');
//     }
//   }

//   /**
//    * Update a portfolio's name
//    */
//   async updatePortfolio(id: string, name: string): Promise<Portfolio> {
//     try {
//       const response = await apiClient.put<PortfolioResponseDto>(`/portfolios/${id}`, { name });
      
//       // Clear cache for this portfolio
//       apiClient.clearPortfolioCache(id);
      
//       return this.mapDtoToPortfolio(response);
//     } catch (error) {
//       console.error(`Error updating portfolio ${id}:`, error);
//       throw new Error('Failed to update portfolio');
//     }
//   }

//   /**
//    * Delete a portfolio
//    */
//   async deletePortfolio(id: string): Promise<void> {
//     try {
//       await apiClient.delete(`/portfolios/${id}`);
      
//       // Clear all cache after deleting a portfolio
//       apiClient.clearCache();
//     } catch (error) {
//       console.error(`Error deleting portfolio ${id}:`, error);
//       throw new Error('Failed to delete portfolio');
//     }
//   }

//   /**
//    * Add a position to a portfolio
//    */
//   async addPosition(portfolioId: string, position: PositionData): Promise<StockPosition> {
//     try {
//       const response = await apiClient.post<PositionResponseDto>(
//         `/portfolios/${portfolioId}/positions`,
//         position
//       );
      
//       // Clear cache for this portfolio
//       apiClient.clearPortfolioCache(portfolioId);
      
//       return this.mapDtoToPosition(response);
//     } catch (error) {
//       console.error(`Error adding position to portfolio ${portfolioId}:`, error);
//       throw new Error('Failed to add position');
//     }
//   }

//   /**
//    * Update a position in a portfolio
//    */
//   async updatePosition(
//     portfolioId: string,
//     ticker: string,
//     data: { shares?: number; avgPrice?: number }
//   ): Promise<StockPosition> {
//     try {
//       const response = await apiClient.put<PositionResponseDto>(
//         `/portfolios/${portfolioId}/positions/${ticker}`,
//         { ...data, ticker }
//       );
      
//       // Clear cache for this portfolio
//       apiClient.clearPortfolioCache(portfolioId);
      
//       return this.mapDtoToPosition(response);
//     } catch (error) {
//       console.error(`Error updating position ${ticker} in portfolio ${portfolioId}:`, error);
//       throw new Error('Failed to update position');
//     }
//   }

//   /**
//    * Delete a position from a portfolio
//    */
//   async deletePosition(portfolioId: string, ticker: string): Promise<void> {
//     try {
//       await apiClient.delete(`/portfolios/${portfolioId}/positions/${ticker}`);
      
//       // Clear cache for this portfolio
//       apiClient.clearPortfolioCache(portfolioId);
//     } catch (error) {
//       console.error(`Error deleting position ${ticker} from portfolio ${portfolioId}:`, error);
//       throw new Error('Failed to delete position');
//     }
//   }

//   /**
//    * Refresh portfolio prices
//    */
//   async refreshPrices(portfolioId: string): Promise<Portfolio> {
//     try {
//       // Clear cache before refreshing
//       apiClient.clearCache();
      
//       const response = await apiClient.post<PortfolioResponseDto>(
//         `/portfolios/${portfolioId}/refresh`
//       );
      
//       return this.mapDtoToPortfolio(response);
//     } catch (error) {
//       console.error(`Error refreshing portfolio ${portfolioId}:`, error);
//       throw new Error('Failed to refresh portfolio prices');
//     }
//   }

//   /**
//    * Get portfolio with light refresh (minimal price updates)
//    */
//   async getLightRefresh(portfolioId: string): Promise<Portfolio> {
//     try {
//       const response = await apiClient.get<PortfolioResponseDto>(
//         `/portfolios/${portfolioId}/light-refresh`
//       );
      
//       return this.mapDtoToPortfolio(response);
//     } catch (error) {
//       console.error(`Error light refreshing portfolio ${portfolioId}:`, error);
//       throw new Error('Failed to light refresh portfolio');
//     }
//   }

//   /**
//    * Get portfolio performance data
//    */
//   async getPortfolioPerformance(
//     portfolioId: string,
//     startDate?: string,
//     endDate?: string
//   ): Promise<PortfolioPerformanceData> {
//     try {
//       const response = await apiClient.get<PortfolioPerformanceResponseDto>(
//         `/portfolios/${portfolioId}/performance`,
//         {
//           params: { startDate, endDate }
//         }
//       );
      
//       return response.data;
//     } catch (error) {
//       console.error(`Error fetching portfolio performance for ${portfolioId}:`, error);
//       throw new Error('Failed to fetch portfolio performance');
//     }
//   }

//   /**
//    * Get portfolio history data
//    */
//   async getPortfolioHistory(
//     portfolioId: string,
//     timeframe: TimeframeType,
//     startDate?: string,
//     endDate?: string
//   ): Promise<PortfolioHistoryDataPoint[]> {
//     try {
//       // Calculate dates if not provided
//       if (!endDate) {
//         endDate = new Date().toISOString().split('T')[0]; // Today
//       }
      
//       if (!startDate) {
//         // Calculate start date based on timeframe
//         const start = new Date();
        
//         switch (timeframe) {
//           case '1D':
//             // Use today
//             startDate = endDate;
//             break;
//           case '5D':
//             start.setDate(start.getDate() - 5);
//             break;
//           case '15D':
//             start.setDate(start.getDate() - 15);
//             break;
//           case '1M':
//             start.setMonth(start.getMonth() - 1);
//             break;
//           case '3M':
//             start.setMonth(start.getMonth() - 3);
//             break;
//           case '6M':
//             start.setMonth(start.getMonth() - 6);
//             break;
//           case '1Y':
//             start.setFullYear(start.getFullYear() - 1);
//             break;
//           case 'ALL':
//             start.setFullYear(start.getFullYear() - 5);
//             break;
//           default:
//             start.setDate(start.getDate() - 30); // Default to 30 days
//         }
        
//         startDate = start.toISOString().split('T')[0];
//       }
      
//       const response = await apiClient.get<PortfolioHistoryResponseDto>(
//         `/portfolios/${portfolioId}/history`,
//         {
//           params: { 
//             startDate, 
//             endDate,
//             interval: timeframe === 'ALL' ? 'monthly' : 
//                      (timeframe === '1Y' || timeframe === '6M') ? 'weekly' : 'daily'
//           }
//         }
//       );
      
//       return response.data.map(item => ({
//         date: item.date,
//         value: item.value,
//         dayChange: item.dayChange,
//         dayChangePercent: item.dayChangePercent
//       }));
//     } catch (error) {
//       console.error(`Error fetching portfolio history for ${portfolioId}:`, error);
//       throw new Error('Failed to fetch portfolio history');
//     }
//   }

//   /**
//    * Map a DTO response to a Portfolio model
//    */
//   private mapDtoToPortfolio(dto: PortfolioResponseDto): Portfolio {
//     // Transform lastPriceUpdate from string to Date if it exists
//     const lastPriceUpdate = dto.lastPriceUpdate ? new Date(dto.lastPriceUpdate) : null;
    
//     // Map DTO to portfolio model
//     const portfolio: Portfolio = {
//       id: dto.id,
//       name: dto.name,
//       positions: dto.positions.map(pos => this.mapDtoToPosition(pos)),
//       totalValue: dto.totalValue,
//       previousDayValue: dto.previousDayValue,
//       dayChange: dto.dayChange,
//       dayChangePercent: dto.dayChangePercent,
//       lastPriceUpdate
//     };
    
//     // Normalize the portfolio to ensure consistent values
//     return normalizePortfolio(portfolio);
//   }

//   /**
//    * Map a DTO response to a StockPosition model
//    */
//   private mapDtoToPosition(dto: PositionResponseDto): StockPosition {
//     const position: StockPosition = {
//       ticker: dto.ticker,
//       name: dto.name,
//       shares: dto.shares,
//       avgPrice: dto.avgPrice,
//       currentPrice: dto.currentPrice,
//       marketValue: dto.marketValue,
//       percentOfPortfolio: dto.percentOfPortfolio,
//       gainLoss: dto.gainLoss,
//       gainLossPercent: dto.gainLossPercent
//     };
    
//     // Normalize the position to ensure consistent values
//     return normalizePosition(position);
//   }
// }

// // Export a singleton instance of the service
// export const portfolioService = new PortfolioService();