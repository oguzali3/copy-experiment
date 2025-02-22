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

        // Transform the data to match the expected format
        const transformedData = data.map((item: any) => ({
          period: item.period === 'TTM' ? 'TTM' : new Date(item.date).getFullYear().toString(),
          revenue: item.revenue?.toString() || "0",
          revenueGrowth: (((item.revenue - item.previousRevenue) / Math.abs(item.previousRevenue)) * 100)?.toString() || "0",
          costOfRevenue: item.costOfRevenue?.toString() || "0",
          grossProfit: item.grossProfit?.toString() || "0",
          operatingExpenses: item.operatingExpenses?.toString() || "0",
          operatingIncome: item.operatingIncome?.toString() || "0",
          netIncome: item.netIncome?.toString() || "0",
          ebitda: item.EBITDA?.toString() || "0",  // Note the capitalization from your DB
        }));

        // Return in the same structure as before
        return {
          [ticker]: {
            [period]: transformedData,
          }
        };
      } catch (error) {
        console.error('Error fetching from local API:', error);
        throw error;
      }
    },
    enabled: !!ticker,
  });

  return { financialData, isLoading };
};