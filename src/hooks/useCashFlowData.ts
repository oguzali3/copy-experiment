import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { useMemo } from "react";

export const useCashFlowData = (ticker: string, period: 'annual' | 'quarter' = 'annual') => {
  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['cash-flow', ticker, period],
    queryFn: async () => {
      // Reduce log frequency
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Fetching cash flow data for ${ticker}`);
      }
      
      const responseData = await fetchFinancialData('cash-flow-statement', ticker, period);
      
      // Normalize data to ensure it's always an array
      let cashFlowData = [];
      
      if (Array.isArray(responseData)) {
        cashFlowData = responseData;
      } else if (responseData && typeof responseData === 'object') {
        // Check if it has ticker.period structure
        if (responseData[ticker] && responseData[ticker][period] && Array.isArray(responseData[ticker][period])) {
          cashFlowData = responseData[ticker][period];
        }
        // Check if it has just period structure
        else if (responseData[period] && Array.isArray(responseData[period])) {
          cashFlowData = responseData[period];
        }
        // Check for any array property
        else {
          for (const key in responseData) {
            if (Array.isArray(responseData[key])) {
              cashFlowData = responseData[key];
              break;
            }
          }
        }
      }
      
      return cashFlowData;
    },
    enabled: !!ticker,
    // Add stale time to reduce refetching
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use useMemo to prevent recalculation on every render
  const cashFlowData = useMemo(() => {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return [];
    }
    
    // Sort data to ensure TTM comes first
    return [...rawData]
      .sort((a, b) => {
        if (a.period === 'TTM') return -1;
        if (b.period === 'TTM') return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
      .slice(0, period === 'quarter' ? 20 : 10);
  }, [rawData, period]);

  return { 
    cashFlowData, 
    isLoading, 
    error 
  };
};