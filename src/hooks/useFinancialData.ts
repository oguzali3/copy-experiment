import { useQuery } from "@tanstack/react-query";

export const useFinancialData = (ticker: string, period: 'annual' | 'quarter' = 'annual') => {
  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial-data', ticker, period],
    queryFn: async () => {
      console.log(`Fetching ${period} financial data for ${ticker} from local API`);
      
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
        console.log(`Received ${period} income statement data from local API:`, data);

        // Check if data is already an array
        if (Array.isArray(data)) {
          return data;
        }
        
        // If it has a nested structure, extract the array
        if (typeof data === 'object' && data !== null) {
          // Check if it has ticker.period structure
          if (data[ticker] && data[ticker][mappedPeriod] && Array.isArray(data[ticker][mappedPeriod])) {
            console.log(`Normalizing nested income statement data for ${ticker}`);
            return data[ticker][mappedPeriod];
          }
          
          // If it has just period structure
          const periods = Object.keys(data).filter(key => ['annual', 'quarter', 'ttm'].includes(key));
          if (periods.length > 0 && Array.isArray(data[periods[0]])) {
            console.log(`Normalizing income statement data by period key: ${periods[0]}`);
            return data[periods[0]];
          }
        }
        
        console.warn("Unknown income statement data format:", data);
        return [];
      } catch (error) {
        console.error('Error fetching from local API:', error);
        throw error;
      }
    },
    enabled: !!ticker,
  });

  return { financialData: financialData || [], isLoading };
};