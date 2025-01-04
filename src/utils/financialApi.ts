import { supabase } from "@/integrations/supabase/client";

export type FinancialEndpoint = 'quote' | 'profile' | 'income-statement' | 'balance-sheet' | 'cash-flow-statement' | 'key-metrics' | 'key-metrics-ttm' | 'key-metrics-historical' | 'dcf';

export async function fetchFinancialData(endpoint: FinancialEndpoint, symbol: string) {
  try {
    console.log(`Fetching ${endpoint} data for ${symbol}`);
    const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
      body: { endpoint, symbol }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint} data for ${symbol}:`, error);
    throw error;
  }
}