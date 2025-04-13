// src/services/portfolioAccessService.ts
import axios from 'axios';
import apiClient from '@/utils/apiClient'; // Use your existing auth-enabled client
import { PortfolioVisibility } from '@/constants/portfolioVisibility';

interface PortfolioResponseDto {
  id: string;
  name: string;
  totalValue: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  positions: any[]; // Using any[] to avoid needing to import StockPositionResponseDto
  userId: string;
  createdAt: string;
  updatedAt: string;
  previousDayValue: number;
  dayChange: number;
  dayChangePercent: number;
  lastPriceUpdate: Date | null;
  visibility: PortfolioVisibility;
  description?: string;
}

// Define the response type for better type safety
interface AccessCheckResponse {
  hasAccess: boolean;
}

interface AccessiblePortfoliosResponse {
  portfolios: string[];
}

class PortfolioAccessService {
  private api = axios.create({
    baseURL: "http://localhost:4000",
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });
  
  async checkAccess(portfolioId: string): Promise<boolean> {
    try {
      // First check as you're already doing...
      
      // Then use apiClient instead of this.api
      const response = await apiClient.get<AccessCheckResponse>(`/portfolio-access/${portfolioId}/check`);
      return response.data.hasAccess;
    } catch (error) {
      console.error('Error checking portfolio access:', error);
      return false;
    }
  }

  async getAccessiblePortfolios(): Promise<string[]> {
    try {
      const response = await this.api.get<AccessiblePortfoliosResponse>('/portfolio-access/accessible-portfolios');
      return response.data.portfolios || [];
    } catch (error) {
      console.error('Error getting accessible portfolios:', error);
      return [];
    }
  }


}

export default new PortfolioAccessService();