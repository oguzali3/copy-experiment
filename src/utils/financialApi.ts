import { supabase } from "@/integrations/supabase/client";
import { formatFinancialData } from "./data-formatter";

export type FinancialEndpoint = 
  'quote' | 
  'profile' | 
  'income-statement' | 
  'balance-sheet-statement' | 
  'cash-flow-statement' | 
  'key-metrics' | 
  'financial-ratios';

/**
 * Fetches financial data from the appropriate API endpoint
 * 
 * @param endpoint The financial API endpoint to fetch from
 * @param symbol The stock ticker symbol
 * @param period The data period ('annual' or 'quarter')
 * @returns Normalized financial data array with proper TTM handling
 */
export async function fetchFinancialData(
  endpoint: FinancialEndpoint, 
  symbol: string, 
  period: 'annual' | 'quarter' = 'annual'
) {
  try {
    // For local API endpoints
    if ([
      'income-statement', 
      'balance-sheet-statement', 
      'cash-flow-statement',
      'key-metrics',
      'financial-ratios'
    ].includes(endpoint)) {
      // Map the period to match backend expectations
      const periodMap = {
        'annual': 'annual',
        'quarter': 'quarter'
      };

      const mappedPeriod = periodMap[period];

      // Map the endpoints to match backend routes
      const endpointMap = {
        'income-statement': 'income-statement',
        'balance-sheet-statement': 'balance-sheet',
        'cash-flow-statement': 'cash-flow',
        'key-metrics': 'key-metrics',
        'financial-ratios': 'ratios'
      };

      const mappedEndpoint = endpointMap[endpoint];
      const url = `http://localhost:4000/api/analysis/${mappedEndpoint}/${symbol}?period=${mappedPeriod}`;
      
      // Only log in development and reduce frequency
      if (process.env.NODE_ENV !== 'production') {
        console.log('Requesting from local API:', url);
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Local API request failed: ${response.status} ${response.statusText}`);
      }

      const rawData = await response.json();
      
      // Format the data to match the expected structure
      const formattedData = Array.isArray(rawData) 
        ? rawData.map(formatFinancialData)
        : formatFinancialData(rawData);

      return formattedData;
    }

    // For other endpoints, use supabase
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

    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint} data for ${symbol}:`, error);
    throw error;
  }
}