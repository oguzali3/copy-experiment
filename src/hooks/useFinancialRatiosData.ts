import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";

export const useFinancialRatiosData = (ticker: string, period: 'annual' | 'quarter' = 'annual') => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['financial-ratios', ticker, period],
    queryFn: async () => {
      try {
        // Fetch financial ratios data
        const responseData = await fetchFinancialData('financial-ratios', ticker, period);
        
        // Log data for debugging
        console.log('Raw financial ratios data type:', typeof responseData);
        console.log('Raw financial ratios data structure:', 
          Array.isArray(responseData) ? 'Array' : 
          responseData === null ? 'null' : 
          'Object with keys: ' + Object.keys(responseData || {}).join(', ')
        );
        
        // Normalize data based on its structure
        let financialRatiosData = [];
        
        if (Array.isArray(responseData)) {
          financialRatiosData = responseData;
        } else if (responseData && typeof responseData === 'object') {
          // Check different potential structures
          if (responseData[ticker] && responseData[ticker][period] && Array.isArray(responseData[ticker][period])) {
            financialRatiosData = responseData[ticker][period];
          } else if (responseData[period] && Array.isArray(responseData[period])) {
            financialRatiosData = responseData[period];
          } else {
            // Try to find any array property that might contain our data
            for (const key in responseData) {
              if (Array.isArray(responseData[key])) {
                financialRatiosData = responseData[key];
                break;
              }
            }
          }
        }
        
        // Log normalized data
        console.log(`Normalized ${financialRatiosData.length} financial ratios data items`);
        if (financialRatiosData.length > 0) {
          console.log('Sample financial ratios properties:', Object.keys(financialRatiosData[0]).slice(0, 10));
        }
        
        return financialRatiosData;
      } catch (error) {
        console.error('Error fetching financial ratios data:', error);
        throw error;
      }
    },
    enabled: !!ticker,
  });

  return { 
    financialRatiosData: data || [], 
    isLoading, 
    error 
  };
};