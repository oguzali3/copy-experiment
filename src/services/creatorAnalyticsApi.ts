// src/services/creatorAnalyticsApi.ts
import apiClient from '@/utils/apiClient';
import { CreatorAnalyticsDto, PortfolioAnalyticsDto } from '@/types/analytics';

interface AnalyticsQueryParams {
  timeframe?: 'day' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}

const CreatorAnalyticsAPI = {
  /**
   * Get analytics for creator
   * 
   * @param params Query parameters (timeframe, startDate, endDate)
   * @returns Creator analytics data
   */
  getCreatorAnalytics: async (params?: AnalyticsQueryParams): Promise<CreatorAnalyticsDto> => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params?.timeframe) queryParams.append('timeframe', params.timeframe);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      
      const queryString = queryParams.toString();
      const url = `/creator-analytics${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get<CreatorAnalyticsDto>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching creator analytics:', error);
      throw error;
    }
  },

  /**
   * Get analytics for a specific portfolio
   * 
   * @param portfolioId The ID of the portfolio to analyze
   * @param params Query parameters (timeframe, startDate, endDate)
   * @returns Portfolio analytics data
   */
  getPortfolioAnalytics: async (
    portfolioId: string,
    params?: AnalyticsQueryParams
  ): Promise<PortfolioAnalyticsDto> => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params?.timeframe) queryParams.append('timeframe', params.timeframe);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      
      const queryString = queryParams.toString();
      const url = `/creator-analytics/portfolios/${portfolioId}${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get<PortfolioAnalyticsDto>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio analytics:', error);
      throw error;
    }
  }
};

export default CreatorAnalyticsAPI;