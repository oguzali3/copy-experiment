import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFinancialData = (ticker: string, period: 'annual' | 'quarter' = 'annual') => {
  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial-data', ticker, period],
    queryFn: async () => {
      console.log(`Fetching ${period} financial data for ${ticker}`);
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { 
          endpoint: 'income-statement', 
          symbol: ticker, 
          period 
        }
      });

      if (error) throw error;

      console.log(`Received ${period} financial data:`, data);
      return data;
    },
    enabled: !!ticker,
  });

  return { financialData, isLoading };
};