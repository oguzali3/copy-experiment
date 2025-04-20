// src/utils/portfolioSubscriptionUtils.ts
import { PortfolioVisibility } from '@/constants/portfolioVisibility';
import portfolioApi from '@/services/portfolioApi';
import CreatorSubscriptionAPI from '@/services/creatorSubscriptionApi';
import StripeConnectService from '@/services/stripeConnectApi';
import { PortfolioSubscriptionPrice } from '@/types/subscription';

/**
 * Interface for portfolio data with visibility
 */
export interface PortfolioWithVisibility {
  id: string;
  name: string;
  visibility: PortfolioVisibility;
  included?: boolean;
  description?: string;
}

/**
 * Interface for pricing settings
 */
export interface PricingSettings {
  monthlyPrice: number;
  annualPrice: number;
  offerDiscount: boolean;
  discountPercentage: number;
  currency: string;
  freeTrialDays: number;
  enableFreeTrial: boolean;
  billingCycleDefault: 'monthly' | 'annual';
}

/**
 * Interface for subscription page setup
 */
export interface SubscriptionSetup {
  isStripeConnected: boolean;
  stripeConnectionStatus: {
    needsOnboarding: boolean;
    isActive: boolean;
  };
  portfolios: PortfolioWithVisibility[];
  pricingSettings: PricingSettings;
  portfolioPrices: Record<string, PortfolioSubscriptionPrice>;
}

/**
 * Check if Stripe Connect is properly set up
 */
export const checkStripeConnectStatus = async (): Promise<{
  isConnected: boolean;
  stripeConnectionStatus: {
    needsOnboarding: boolean;
    isActive: boolean;
  };
}> => {
  try {
    const accountStatus = await StripeConnectService.getAccountStatus();
    return {
      isConnected: accountStatus.isConnected,
      stripeConnectionStatus: {
        needsOnboarding: accountStatus.needsOnboarding,
        isActive: accountStatus.isActive
      }
    };
  } catch (error) {
    console.error('Error checking Stripe Connect status:', error);
    return {
      isConnected: false,
      stripeConnectionStatus: {
        needsOnboarding: true,
        isActive: false
      }
    };
  }
};

// In the savePricingSettings function
export async function savePricingSettings(
  portfolios: PortfolioWithVisibility[],
  pricingMap: Record<string, PricingSettings>
): Promise<{
  success: boolean;
  updatedPortfolios: string[];
  failedPortfolios: string[];
  requiresCreatorSubscription?: boolean;
}> {
  const results = {
    success: true,
    updatedPortfolios: [] as string[],
    failedPortfolios: [] as string[],
    requiresCreatorSubscription: false
  };
  
  // Process only paid portfolios
  const paidPortfolios = portfolios.filter(p => 
    p.visibility === PortfolioVisibility.PAID && p.included
  );
  
  for (const portfolio of paidPortfolios) {
    try {
      // Get pricing for this portfolio (use defaults if not set)
      const pricing = pricingMap[portfolio.id] || {
        monthlyPrice: 9.99,
        annualPrice: 99.99,
        offerDiscount: true,
        discountPercentage: 17,
        currency: 'USD',
        freeTrialDays: 7,
        enableFreeTrial: true,
        billingCycleDefault: 'monthly'
      };
      
      // Convert to API DTO - using the field names the API expects
      const pricingDto = {
        monthlyPrice: pricing.monthlyPrice,  // API expects monthlyPrice
        annualPrice: pricing.annualPrice,    // API expects annualPrice
        currency: pricing.currency,
        isActive: true,
        offerTrial: pricing.enableFreeTrial,
        trialDays: pricing.freeTrialDays,
        description: `Subscription to ${portfolio.name}`
      };
      
      // Save pricing for this portfolio
      await CreatorSubscriptionAPI.setPortfolioSubscriptionPrice(
        portfolio.id,
        pricingDto
      );
      
      results.updatedPortfolios.push(portfolio.id);
    } catch (error) {
      results.failedPortfolios.push(portfolio.id);
      
      // Check for Creator subscription requirement
      if (error?.response?.data?.message === 'You need a CREATOR subscription to set portfolio prices') {
        results.requiresCreatorSubscription = true;
      }
    }
  }
  
  // Overall success is true only if all portfolios were updated successfully
  results.success = results.failedPortfolios.length === 0;
  
  return results;
}
/**
 * Fetch and process portfolios from the API with consistent enum usage
 */
export const fetchPortfoliosWithVisibility = async (): Promise<PortfolioWithVisibility[]> => {
    try {
      // Clear portfolio API cache before fetching
      // clearAllCaches();
      
      // Fetch portfolios with cache disabled
      const fetchedPortfolios = await portfolioApi.getPortfolios({ 
        skipRefresh: true,
        forceRefresh: true
      });
      
      console.log('Raw portfolios from API:', fetchedPortfolios);
      
      // Process the portfolios to match your state structure
      const processedPortfolios = fetchedPortfolios.map(portfolio => {
        console.log(`Processing portfolio ${portfolio.id} (${portfolio.name})`);
        
        // Default to private visibility
        let visibility = PortfolioVisibility.PRIVATE;
        
        // Explicitly log the visibility property regardless of its type
        console.log(`Visibility property for ${portfolio.id}:`, portfolio.visibility);
        
        // Handle the visibility property based on its type
        if (portfolio.visibility !== undefined) {
          // If it's a string that matches our enum values
          if (typeof portfolio.visibility === 'string') {
            switch (portfolio.visibility.toLowerCase()) {
              case 'paid':
                visibility = PortfolioVisibility.PAID;
                break;
              case 'public':
                visibility = PortfolioVisibility.PUBLIC;
                break;
              case 'private':
              default:
                visibility = PortfolioVisibility.PRIVATE;
            }
          }
          
        }
        
        console.log(`Final visibility for ${portfolio.id}: ${visibility}`);
        
        // Return the processed portfolio
        return {
          id: portfolio.id,
          name: portfolio.name,
          description: portfolio.description || '',
          visibility: visibility,
          included: visibility === PortfolioVisibility.PAID // Automatically include paid portfolios
        };
      });
      
      console.log('Processed portfolios:', processedPortfolios);
      return processedPortfolios;
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      return [];
    }
  };

/**
 * Get portfolio subscription prices for portfolios that are marked as paid
 */
export const fetchPortfolioPrices = async (
  portfolios: PortfolioWithVisibility[]
): Promise<Record<string, PortfolioSubscriptionPrice>> => {
  const pricingData: Record<string, PortfolioSubscriptionPrice> = {};
  
  // Clear subscription API cache before fetching
  CreatorSubscriptionAPI.clearCache();
  
  // Find portfolios marked as paid
  const paidPortfolios = portfolios.filter(p => p.visibility === PortfolioVisibility.PAID);
  
  for (const portfolio of paidPortfolios) {
    try {
      const apiPrice = await CreatorSubscriptionAPI.getPortfolioSubscriptionPrice(portfolio.id);
      if (apiPrice) {
        // Map API response to our expected interface
        pricingData[portfolio.id] = {
          portfolioId: portfolio.id,
          monthlyPrice: apiPrice.monthlyPrice || 9.99,  // Use our field name
          annualPrice: apiPrice.annualPrice || 99.99,   // Use our field name
          currency: apiPrice.currency || 'USD',
          offerTrial: apiPrice.offerTrial || false,
          trialDays: apiPrice.trialDays || 7
        };
      }
    } catch (err) {
      console.warn(`Error fetching pricing for portfolio ${portfolio.id}:`, err);
    }
  }
  
  return pricingData;
};
const convertToApiFormat = (pricing: PricingSettings) => {
  return {
    monthlyPrice: pricing.monthlyPrice, // Map to API expected field
    annualPrice: pricing.annualPrice,   // Map to API expected field
    currency: pricing.currency,
    isActive: true,
    offerTrial: pricing.enableFreeTrial,
    trialDays: pricing.freeTrialDays,
    description: `Subscription to portfolio`
  };
};

// When receiving from the API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertFromApiFormat = (apiPrice: any): PortfolioSubscriptionPrice => {
  return {
    portfolioId: apiPrice.portfolioId,
    monthlyPrice: apiPrice.monthlyPrice || apiPrice.monthly, // Handle both formats
    annualPrice: apiPrice.annualPrice || apiPrice.annual,    // Handle both formats
    currency: apiPrice.currency || 'USD',
    offerTrial: apiPrice.offerTrial || false,
    trialDays: apiPrice.trialDays || 7
  };
};
/**
 * Get default pricing settings from existing pricing data
 */
export const getDefaultPricingSettings = (
  portfolioPrices: Record<string, PortfolioSubscriptionPrice>
): PricingSettings => {
  // Default pricing settings
  const defaultSettings: PricingSettings = {
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    offerDiscount: true,
    discountPercentage: 17,
    currency: 'USD',
    freeTrialDays: 7,
    enableFreeTrial: true,
    billingCycleDefault: 'monthly'
  };
  
  // If we have pricing data, use the first one as default
  const prices = Object.values(portfolioPrices);
  if (prices.length > 0) {
    const defaultPrice = prices[0];
    
    // Calculate discount percentage based on monthly and annual price
    let discountPercentage = 17; // Default value
    if (defaultPrice.monthlyPrice > 0) {
      const annualCost = defaultPrice.monthlyPrice * 12;
      const discountAmount = annualCost - defaultPrice.annualPrice;
      discountPercentage = Math.round((discountAmount / annualCost) * 100);
    }
    
    return {
      monthlyPrice: defaultPrice.monthlyPrice,
      annualPrice: defaultPrice.annualPrice,
      offerDiscount: true,
      discountPercentage: discountPercentage,
      currency: defaultPrice.currency || 'USD',
      freeTrialDays: defaultPrice.trialDays || 7,
      enableFreeTrial: defaultPrice.offerTrial,
      billingCycleDefault: 'monthly'
    };
  }
  
  return defaultSettings;
};

/**
 * Save portfolio visibility using the enum
 */
export const savePortfolioVisibility = async (
  portfolioId: string, 
  name: string,
  visibility: PortfolioVisibility
): Promise<boolean> => {
  try {
    // Add this log before the API call
    console.log(`Saving portfolio ${portfolioId} (${name}) with visibility ${visibility}`);
    
    // Update portfolio in the backend, using the enum directly
    const updatedPortfolio = await portfolioApi.updatePortfolio(portfolioId, {
      name,
      visibility
    });
    
    // Log the response
    console.log(`API response for ${portfolioId} visibility update:`, updatedPortfolio);
    
    // Clear cache for this specific portfolio
    // clearAllCaches();

    return true;
  } catch (error) {
    console.error(`Error updating portfolio ${portfolioId} visibility:`, error);
    return false;
  }
};



/**
 * Initialize the subscription setup
 */
export const initializeSubscriptionSetup = async (): Promise<SubscriptionSetup> => {
  console.log('Initializing subscription setup...');
  
  // Clear all caches before initializing
  // clearAllCaches();
  CreatorSubscriptionAPI.clearCache();
  
  // Check Stripe Connect status
  const { isConnected, stripeConnectionStatus } = await checkStripeConnectStatus();
  console.log('Stripe Connect status:', { isConnected, stripeConnectionStatus });
  
  // Fetch portfolios
  const portfolios = await fetchPortfoliosWithVisibility();
  console.log(`Fetched ${portfolios.length} portfolios`);
  
  // Get pricing for paid portfolios
  const portfolioPrices = await fetchPortfolioPrices(portfolios);
  console.log(`Fetched pricing for ${Object.keys(portfolioPrices).length} portfolios`);
  
  // Get default pricing settings
  const pricingSettings = getDefaultPricingSettings(portfolioPrices);
  console.log('Default pricing settings:', pricingSettings);
  
  return {
    isStripeConnected: isConnected,
    stripeConnectionStatus,
    portfolios,
    pricingSettings,
    portfolioPrices
  };
};