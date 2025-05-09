
import { supabase } from "@/integrations/supabase/client";

export type FinancialEndpoint = 'quote' | 'profile' | 'income-statement' | 'balance-sheet-statement' | 'cash-flow-statement' | 'batch-quote';

export async function fetchFinancialData(endpoint: FinancialEndpoint, symbol: string, period: 'annual' | 'quarter' = 'annual') {
  try {
    console.log(`Fetching ${endpoint} data for ${symbol} with period ${period}`);
    const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
      body: { endpoint, symbol, period }
    });

    if (error) {
      console.error(`Error fetching ${endpoint} data for ${symbol}:`, error);
      throw error;
    }

    if (!data) {
      console.error(`No data received for ${symbol}`);
      throw new Error(`No data received for ${symbol}`);
    }

    console.log(`Received ${endpoint} data:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint} data for ${symbol}:`, error);
    throw error;
  }
}

export async function fetchBatchQuotes(symbols: string[]) {
  try {
    console.log('Fetching batch quotes for:', symbols);
    
    // Fetch quotes individually and combine results
    const quotes = await Promise.all(
      symbols.map(symbol => 
        fetchFinancialData('quote', symbol)
          .then(data => data[0])
          .catch(error => {
            console.error(`Error fetching quote for ${symbol}:`, error);
            return null;
          })
      )
    );

    // Filter out any failed requests
    const validQuotes = quotes.filter(quote => quote !== null);

    if (validQuotes.length === 0) {
      throw new Error('Failed to fetch any quotes');
    }

    console.log('Received quotes data:', validQuotes);
    return validQuotes;
  } catch (error) {
    console.error('Error fetching batch quotes:', error);
    throw error;
  }
}

// Mock intraday data function - completely removed the real API call
export async function fetchIntradayData(symbol: string) {
  // Return empty array - we're using mocked data in CompanyTableRow instead
  return [];
}

export const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1e12) {
    return `${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `${(marketCap / 1e6).toFixed(2)}M`;
  } else {
    return `${(marketCap).toFixed(2)}`;
  }
};
