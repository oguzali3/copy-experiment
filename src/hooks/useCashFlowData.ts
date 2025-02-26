import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";

export const useCashFlowData = (ticker: string, period: 'annual' | 'quarter' = 'annual') => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['cash-flow', ticker, period],
    queryFn: async () => {
      const responseData = await fetchFinancialData('cash-flow-statement', ticker, period);
      console.log('Raw cash flow data:', responseData);
      
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
      
      console.log('Normalized cash flow data:', cashFlowData);
      return cashFlowData;
    },
    enabled: !!ticker,
  });

  return { 
    cashFlowData: data || [], 
    isLoading, 
    error 
  };
};