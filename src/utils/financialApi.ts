import { supabase } from "@/integrations/supabase/client";
import { formatFinancialData } from "./data-formatter";

export type FinancialEndpoint = 'quote' | 'profile' | 'income-statement' | 'balance-sheet-statement' | 'cash-flow-statement';

export async function fetchFinancialData(endpoint: FinancialEndpoint, symbol: string, period: 'annual' | 'quarter' = 'annual') {
  try {
    console.log(`Fetching ${endpoint} data for ${symbol} with period try ${period}`);

    // For financial statements, use local API
    if (['income-statement', 'balance-sheet-statement', 'cash-flow-statement'].includes(endpoint)) {
      // Map the period to match backend expectations
      const periodMap = {
        'annual': 'annual',
        'quarter': 'quarter'
      };

      const mappedPeriod = periodMap[period] || period;

      // Map the endpoints to match your backend routes
      const endpointMap = {
        'income-statement': 'income-statement',
        'balance-sheet-statement': 'balance-sheet',
        'cash-flow-statement': 'cash-flow'
      };

      const mappedEndpoint = endpointMap[endpoint];
      const url = `http://localhost:4000/api/analysis/${mappedEndpoint}/${symbol}?period=${mappedPeriod}`;
      
      console.log('Requesting from local API:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Local API request failed: ${response.statusText}`);
      }

      const rawData = await response.json();
      
      // Format the data to match the expected structure
      const formattedData = Array.isArray(rawData) 
        ? rawData.map(formatFinancialData)
        : formatFinancialData(rawData);

      console.log(`Received ${endpoint} formatted data:`, formattedData);
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

    console.log(`Received ${endpoint} data from supabase:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint} data for ${symbol}:`, error);
    throw error;
  }
}