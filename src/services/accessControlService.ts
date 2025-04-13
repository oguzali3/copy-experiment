// src/services/accessControlService.ts
import { PortfolioVisibility } from '@/constants/portfolioVisibility';
import portfolioApi from './portfolioApi';
import portfolioAccessService from './portfolioAccessService';
import creatorSubscriptionApi from './creatorSubscriptionApi';
import apiClient from '@/utils/apiClient';

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
  
interface PortfolioBasicInfo {
  id: string;
  name: string;
  visibility: PortfolioVisibility;
  userId: string;
}

interface AccessResult {
  hasAccess: boolean;
  reason?: 'private' | 'subscriptionRequired' | 'notFound';
  portfolioInfo?: PortfolioBasicInfo;
}

class AccessControlService {
  // src/services/accessControlService.ts

  async checkPortfolioAccess(portfolioId: string, userId: string): Promise<AccessResult> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get<any>(`/portfolio-access/${portfolioId}/check`, {
        params: { userId }
      });
      
      // Validate and enhance the response if needed
      const result: AccessResult = {
        hasAccess: response.data.hasAccess
      };
      
      // If access is denied, ensure we have a reason
      if (!result.hasAccess) {
        // Use the reason from response if available, otherwise assume subscription required for paid portfolios
        result.reason = response.data.reason || 'subscriptionRequired';
        
        // If reason is subscriptionRequired, ensure we have portfolio info
        if (result.reason === 'subscriptionRequired') {
          // Use portfolioInfo from response if available
          if (response.data.portfolioInfo) {
            result.portfolioInfo = response.data.portfolioInfo;
          } else {
            // If not available, try to fetch it separately
            try {
              const portfolioResponse = await apiClient.get<PortfolioBasicInfo>(
                `/portfolios/${portfolioId}/basic-info`
              );
              result.portfolioInfo = portfolioResponse.data;
            } catch (infoError) {
              console.error('Could not fetch portfolio basic info:', infoError);
              // Create minimal portfolioInfo
              result.portfolioInfo = {
                id: portfolioId,
                name: 'Premium Portfolio',
                visibility: PortfolioVisibility.PAID,
                userId: '' // This might need to be set to something else
              };
            }
          }
        }
      }
      
      console.log('Enhanced access check result:', result);
      return result;
    } catch (error) {
      console.error('Error checking portfolio access:', error);
      
      // Check if the error is due to a portfolio requiring subscription
      if (error.response?.status === 403 && error.response?.data?.reason === 'subscriptionRequired') {
        return { 
          hasAccess: false, 
          reason: 'subscriptionRequired',
          portfolioInfo: error.response.data.portfolioInfo || null
        };
      }
      
      // For other errors, assume not found
      return { 
        hasAccess: false, 
        reason: 'notFound' 
      };
    }
  }

  async getActiveSubscriptionsForPortfolios(): Promise<string[]> {
    try {
      const subscribedPortfolioIds = await creatorSubscriptionApi.getMySubscribedPortfolios();
      return subscribedPortfolioIds;
    } catch (error) {
      console.error('Error fetching active subscriptions:', error);
      return [];
    }
  }

  async isCreator(): Promise<boolean> {
    try {
      // This would check if the user has a creator subscription tier
      // For demo purposes, we'll just return true
      return true;
    } catch (error) {
      console.error('Error checking creator status:', error);
      return false;
    }
  }
    // In portfolioAccessService.ts
async checkPublicAccess(portfolioId: string): Promise<{
    isPublic: boolean;
    exists: boolean;
    name?: string;
    description?: string;
    visibility?: PortfolioVisibility;
  }> {
    try {
      // Try light-refresh endpoint
      const response = await apiClient.get<PortfolioResponseDto>(
        `/portfolios/${portfolioId}/light-refresh`,
        { params: { _t: Date.now() } }
      );
      
      if (response.data) {
        return {
          isPublic: response.data.visibility === PortfolioVisibility.PUBLIC,
          exists: true,
          name: response.data.name,
          description: response.data.description,
          visibility: response.data.visibility
        };
      }
      
      return { isPublic: false, exists: false };
    } catch (error) {
      // If there was an error, try the public portfolios endpoint
      try {
        // Properly type the response data as an array of PortfolioResponseDto
        const publicResponse = await apiClient.get<PortfolioResponseDto[]>('/portfolios/public');
        
        if (publicResponse.data && Array.isArray(publicResponse.data)) {
          const foundPortfolio = publicResponse.data.find(
            (p: PortfolioResponseDto) => p.id === portfolioId
          );
          
          if (foundPortfolio) {
            return {
              isPublic: true,
              exists: true,
              name: foundPortfolio.name,
              description: foundPortfolio.description,
              visibility: PortfolioVisibility.PUBLIC
            };
          }
        }
      } catch (publicError) {
        console.error('Error checking public portfolios:', publicError);
      }
      
      return { isPublic: false, exists: false };
    }
  }
  
}


export default new AccessControlService();