import { supabase } from "@/integrations/supabase/client";

export type FinancialEndpoint = 'quote' | 'profile' | 'income-statement' | 'balance-sheet-statement' | 'cash-flow-statement';

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