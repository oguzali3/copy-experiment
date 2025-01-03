import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KeyMetricsTable } from "./KeyMetricsTable";
import { DcfAnalysis } from "./DcfAnalysis";

interface ValuationMetricsProps {
  ticker: string;
}

export const ValuationMetrics = ({ ticker }: ValuationMetricsProps) => {
  const { data: ttmData, isLoading: ttmLoading } = useQuery({
    queryKey: ['key-metrics-ttm', ticker],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'key-metrics-ttm', symbol: ticker }
      });
      if (error) throw error;
      return data;
    },
    enabled: !!ticker
  });

  const { data: historicalData, isLoading: historicalLoading } = useQuery({
    queryKey: ['key-metrics-historical', ticker],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'key-metrics-historical', symbol: ticker }
      });
      if (error) throw error;
      return data;
    },
    enabled: !!ticker
  });

  if (ttmLoading || historicalLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-center text-gray-500">Loading key metrics...</p>
        </div>
      </div>
    );
  }

  if (!ttmData || !historicalData) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-center text-gray-500">No key metrics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DcfAnalysis ticker={ticker} />
      <KeyMetricsTable ttmData={ttmData} historicalData={historicalData} />
    </div>
  );
};