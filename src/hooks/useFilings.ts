import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Filing } from "@/types/filing";

export const useFilings = (symbol: string, type: string, page: number, year: string) => {
  return useQuery<Filing[]>({
    queryKey: ['sec-filings', symbol, type, page, year],
    queryFn: async () => {
      console.log('Fetching SEC filings for:', { symbol, type, page, year });
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { 
          endpoint: 'sec-filings',
          symbol,
          type,
          page,
          year
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