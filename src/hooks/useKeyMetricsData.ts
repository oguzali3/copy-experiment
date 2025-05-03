import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";

export const useKeyMetricsData = (ticker: string, period: 'annual' | 'quarter' = 'annual') => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['key-metrics', ticker, period],
    queryFn: async () => {
      try {
        // Fetch key metrics data
        const responseData = await fetchFinancialData('key-metrics', ticker, period);
        
        // Log data for debugging
        console.log('Raw key metrics data type:', typeof responseData);
        console.log('Raw key metrics data structure:', 
          Array.isArray(responseData) ? 'Array' : 
          responseData === null ? 'null' : 
          'Object with keys: ' + Object.keys(responseData || {}).join(', ')
        );
        
        // Normalize data based on its structure
        let keyMetricsData = [];
        
        if (Array.isArray(responseData)) {
          keyMetricsData = responseData;
        } else if (responseData && typeof responseData === 'object') {
          // Check different potential structures
          if (responseData[ticker] && responseData[ticker][period] && Array.isArray(responseData[ticker][period])) {
            keyMetricsData = responseData[ticker][period];
          } else if (responseData[period] && Array.isArray(responseData[period])) {
            keyMetricsData = responseData[period];
          } else {
            // Try to find any array property that might contain our data
            for (const key in responseData) {
              if (Array.isArray(responseData[key])) {
                keyMetricsData = responseData[key];
                break;
              }
            }
          }
        }
        
        // Log normalized data
        console.log(`Normalized ${keyMetricsData.length} key metrics data items`);
        if (keyMetricsData.length > 0) {
          console.log('Sample key metrics properties:', Object.keys(keyMetricsData[0]).slice(0, 10));
        }
        
        return keyMetricsData;
      } catch (error) {
        console.error('Error fetching key metrics data:', error);
        throw error;
      }
    },
    enabled: !!ticker,
  });

  return { 
    keyMetricsData: data || [], 
    isLoading, 
    error 
  };
};