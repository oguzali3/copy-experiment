import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { FinancialEndpoint } from "@/utils/financialApi";

/**
 * A generic hook for fetching financial data with TTM support
 * 
 * @param endpoint The financial API endpoint to fetch data from
 * @param ticker The stock ticker symbol
 * @param period The data period ('annual' or 'quarter')
 * @returns Object with sorted data (TTM first), loading state, and error
 */
export const useFinancialDataWithTTM = (
  endpoint: FinancialEndpoint, 
  ticker: string, 
  period: 'annual' | 'quarter' = 'annual'
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [endpoint, ticker, period],
    queryFn: async () => {
      const responseData = await fetchFinancialData(endpoint, ticker, period);
      
      // Normalize data to ensure it's always an array
      let financialData = [];
      
      if (Array.isArray(responseData)) {
        financialData = responseData;
      } else if (responseData && typeof responseData === 'object') {
        // Check if it has ticker.period structure
        if (responseData[ticker] && responseData[ticker][period] && Array.isArray(responseData[ticker][period])) {
          financialData = responseData[ticker][period];
        }
        // Check if it has just period structure
        else if (responseData[period] && Array.isArray(responseData[period])) {
          financialData = responseData[period];
        }
        // Check for any array property
        else {
          for (const key in responseData) {
            if (Array.isArray(responseData[key])) {
              financialData = responseData[key];
              break;
            }
          }
        }
      }
      
      // Sort data to ensure TTM comes first if it exists
      return financialData.sort((a: any, b: any) => {
        // TTM should come first
        if (a.period === 'TTM') return -1;
        if (b.period === 'TTM') return 1;
        // Then sort by date in descending order
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    },
    enabled: !!ticker,
  });

  // Slice the data to limit the number of periods
  const slicedData = (data || []).slice(0, period === 'quarter' ? 20 : 10);

  return { 
    data: slicedData, 
    isLoading, 
    error 
  };
};