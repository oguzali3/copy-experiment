import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TranscriptDate {
  quarter: number;
  year: number;
  date: string;
}

export const useTranscriptDates = (ticker: string) => {
  const { data: transcriptDates, isLoading } = useQuery({
    queryKey: ['transcript-dates', ticker],
    queryFn: async () => {
      console.log('Fetching transcript dates for:', ticker);
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'transcript-dates', symbol: ticker }
      });
      if (error) {
        console.error('Error fetching transcript dates:', error);
        throw error;
      }
      console.log('Transcript dates received:', data);
      
      return data.map((item: any[]) => ({
        quarter: item[0],
        year: item[1],
        date: item[2]
      })) as TranscriptDate[];
    },
    enabled: !!ticker
  });

  const getYears = () => {
    if (!transcriptDates) return [];
    return [...new Set(transcriptDates.map(date => date.year))]
      .sort((a, b) => b - a);
  };

  const getQuarters = (selectedYear: string) => {
    if (!transcriptDates || !selectedYear) return [];
    return [...new Set(transcriptDates
      .filter(date => date.year === parseInt(selectedYear))
      .map(date => date.quarter))]
      .sort((a, b) => b - a);
  };

  return {
    transcriptDates,
    isLoading,
    getYears,
    getQuarters
  };
};