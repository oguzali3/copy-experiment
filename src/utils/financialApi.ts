import { supabase } from "@/integrations/supabase/client";

export type FinancialEndpoint = 'quote' | 'profile' | 'income-statement' | 'balance-sheet' | 'cash-flow-statement';

export async function fetchFinancialData(endpoint: FinancialEndpoint, symbol: string) {
  try {
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