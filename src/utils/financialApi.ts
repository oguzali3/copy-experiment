
import { supabase } from "@/integrations/supabase/client";

export type FinancialEndpoint = 'quote' | 'profile' | 'income-statement' | 'balance-sheet-statement' | 'cash-flow-statement' | 'intraday';

export async function fetchFinancialData(endpoint: FinancialEndpoint, symbol: string, period: 'annual' | 'quarter' = 'annual') {
  try {
    console.log(`Fetching ${endpoint} data for ${symbol} with period ${period}`);
    const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
      body: { 
        endpoint, 
        symbol, 
        period,
        ...(endpoint === 'intraday' && {
          interval: '10min',
          from: new Date().toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0]
        })
      }
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
    const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
      body: { endpoint: 'batch-quote', symbols }
    });

    if (error) {
      console.error('Error fetching batch quotes:', error);
      throw error;
    }

    if (!data) {
      console.error('No batch quote data received');
      throw new Error('No batch quote data received');
    }

    console.log('Received batch quote data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching batch quotes:', error);
    throw error;
  }
}
