import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCashFlowData = (ticker: string, period: 'annual' | 'quarter' = 'annual') => {
  const { data, isLoading } = useQuery({
    queryKey: ['cash-flow-data', ticker, period],
    queryFn: async () => {
      console.log('Fetching cash flow data for:', ticker, 'period:', period);
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { 
          endpoint: 'cash-flow-statement', 
          symbol: ticker, 
          period 
        }
      });

      if (error) {
        console.error('Error fetching cash flow data:', error);
        throw error;
      }

      console.log(`Received ${period} cash flow data:`, data);
      return data;
    },
    enabled: !!ticker,
  });

  return { data, isLoading };
};