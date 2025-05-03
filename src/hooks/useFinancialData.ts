import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const useFinancialData = (ticker: string, period: 'annual' | 'quarter' = 'annual') => {
  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['financial-data', ticker, period],
    queryFn: async () => {
      // Reduce log frequency to avoid console spam
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Fetching ${period} financial data for ${ticker} from local API`);
      }
      
      try {
        // Map the period to match backend expectations
        const mappedPeriod = period === 'annual' ? 'annual' : 'quarter';
        const response = await fetch(
          `http://localhost:4000/api/analysis/income-statement/${ticker}?period=${mappedPeriod}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Only log in development and limit frequency
        if (process.env.NODE_ENV !== 'production') {
          console.log(`Received ${period} income statement data`);
        }

        // Check if data is already an array
        if (Array.isArray(data)) {
          return data;
        }
        
        // If it has a nested structure, extract the array
        if (typeof data === 'object' && data !== null) {
          // Check if it has ticker.period structure
          if (data[ticker] && data[ticker][mappedPeriod] && Array.isArray(data[ticker][mappedPeriod])) {
            return data[ticker][mappedPeriod];
          }
          
          // If it has just period structure
          const periods = Object.keys(data).filter(key => ['annual', 'quarter', 'ttm'].includes(key));
          if (periods.length > 0 && Array.isArray(data[periods[0]])) {
            return data[periods[0]];
          }
        }
        
        console.warn("Unknown income statement data format");
        return [];
      } catch (error) {
        console.error('Error fetching from local API:', error);
        throw error;
      }
    },
    enabled: !!ticker,
    // Add stale time to reduce refetching
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use useMemo to prevent re-calculation on every render
  const financialData = useMemo(() => {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return [];
    }
    
    // Sort with TTM first, then by date
    return [...rawData].sort((a, b) => {
      if (a.period === 'TTM') return -1;
      if (b.period === 'TTM') return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }).slice(0, period === 'quarter' ? 60 : 15);
  }, [rawData, period]);

  return { financialData, isLoading, error };
};