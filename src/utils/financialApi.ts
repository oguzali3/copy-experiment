import { supabase } from "@/integrations/supabase/client";

export type FinancialEndpoint = 'quote' | 'profile' | 'income-statement' | 'balance-sheet' | 'cash-flow-statement';

export async function fetchFinancialData(endpoint: FinancialEndpoint, symbol: string) {
  try {
    console.log(`Fetching ${endpoint} data for ${symbol}`);
    const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
      body: { endpoint, symbol }
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