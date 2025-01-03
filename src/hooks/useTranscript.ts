import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Transcript {
  symbol: string;
  quarter: string;
  year: string;
  date: string;
  content: string;
}

export const useTranscript = (
  ticker: string,
  selectedYear: string,
  selectedQuarter: string
) => {
  const { data: transcript, isLoading } = useQuery({
    queryKey: ['transcript', ticker, selectedYear, selectedQuarter],
    queryFn: async () => {
      console.log('Fetching transcript for:', { ticker, selectedYear, selectedQuarter });
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { 
          endpoint: 'transcript',
          symbol: ticker,
          year: selectedYear,
          quarter: selectedQuarter
        }
      });
      if (error) {
        console.error('Error fetching transcript:', error);
        throw error;
      }
      console.log('Transcript received:', data);
      return data as Transcript[];
    },
    enabled: !!ticker && !!selectedYear && !!selectedQuarter
  });

  return { transcript, isLoading };
};