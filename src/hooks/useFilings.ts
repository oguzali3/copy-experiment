import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Filing {
  title: string;
  date: string;
  link: string;
  cik: string;
  form_type: string;
  ticker: string;
  done: boolean;
}

export const useFilings = (
  ticker: string,
  fromDate: string,
  toDate: string
) => {
  const { data: filings, isLoading } = useQuery({
    queryKey: ['filings', ticker, fromDate, toDate],
    queryFn: async () => {
      console.log('Fetching filings for:', { ticker, fromDate, toDate });
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { 
          endpoint: 'rss-feed',
          symbol: ticker,
          from: fromDate,
          to: toDate
        }
      });

      if (error) {
        console.error('Error fetching filings:', error);
        throw error;
      }

      console.log('Filings data received:', data);
      return data as Filing[];
    },
    enabled: !!ticker && !!fromDate && !!toDate
  });

  return { filings, isLoading };
};