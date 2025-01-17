import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCashFlowData = (ticker: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ['cash-flow-data', ticker],
    queryFn: async () => {
      console.log('Fetching cash flow data for:', ticker);
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'cash-flow-statement', symbol: ticker }
      });

      if (error) {
        console.error('Error fetching cash flow data:', error);
        throw error;
      }

      console.log('Cash flow data received:', data);
      return data;
    },
    enabled: !!ticker,
  });

  return { data, isLoading };
};