import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFilings = (symbol: string, type: string, page: number) => {
  return useQuery({
    queryKey: ['sec-filings', symbol, type, page],
    queryFn: async () => {
      console.log('Fetching SEC filings for:', { symbol, type, page });
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { 
          endpoint: 'sec-filings',
          symbol,
          type,
          page
        }
      });

      if (error) {
        console.error('Error fetching SEC filings:', error);
        throw error;
      }

      console.log('SEC filings received:', data);
      return data;
    },
    enabled: !!symbol
  });
};