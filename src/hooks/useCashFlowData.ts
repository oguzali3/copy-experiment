import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCashFlowData = (ticker: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ['cash-flow-data', ticker],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'cash-flow-statement', symbol: ticker }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!ticker,
  });

  return { data, isLoading };
};