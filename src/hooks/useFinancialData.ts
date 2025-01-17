import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFinancialData = (ticker: string, period: 'annual' | 'quarter' = 'annual') => {
  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial-data', ticker, period],
    queryFn: async () => {
      console.log(`Fetching ${period} financial data for ${ticker}`);
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'income-statement', symbol: ticker, period }
      });

      if (error) throw error;

      console.log(`Received ${period} financial data:`, data);

      const transformedData = data.map((item: any) => ({
        period: item.period === 'TTM' ? 'TTM' : new Date(item.date).getFullYear().toString(),
        revenue: item.revenue?.toString() || "0",
        revenueGrowth: item.revenueGrowth?.toString() || "0",
        costOfRevenue: item.costOfRevenue?.toString() || "0",
        grossProfit: item.grossProfit?.toString() || "0",
        operatingExpenses: item.operatingExpenses?.toString() || "0",
        operatingIncome: item.operatingIncome?.toString() || "0",
        netIncome: item.netIncome?.toString() || "0",
        ebitda: item.ebitda?.toString() || "0",
      }));

      return {
        [ticker]: {
          [period]: transformedData,
        }
      };
    },
    enabled: !!ticker,
  });

  return { financialData, isLoading };
};