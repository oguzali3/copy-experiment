import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChartingHeader } from "@/components/charting/ChartingHeader";
import { ChartingContent } from "@/components/charting/ChartingContent";

const Charting = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [metricTypes, setMetricTypes] = useState<Record<string, 'bar' | 'line'>>({});
  const [timeRange, setTimeRange] = useState<[number, number]>([2015, 2023]);

  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial-data', selectedCompany?.symbol, selectedMetrics],
    queryFn: async () => {
      if (!selectedCompany?.symbol || !selectedMetrics.length) return null;

      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { 
          endpoint: 'income-statement', 
          symbol: selectedCompany.symbol,
          period: 'annual',
          limit: 10
        }
      });

      if (error) throw error;
      console.log('Processed financial data:', data?.length, 'periods');
      return data;
    },
    enabled: !!selectedCompany?.symbol && selectedMetrics.length > 0
  });

  const handleMetricSelect = (metricId: string) => {
    if (!selectedMetrics.includes(metricId)) {
      setSelectedMetrics(prev => [...prev, metricId]);
      setMetricTypes(prev => ({
        ...prev,
        [metricId]: metricId.toLowerCase().includes('ratio') ? 'line' : 'bar'
      }));
    }
  };

  const handleCompanySelect = (company: any) => {
    setSelectedCompany(company);
    setSelectedMetrics([]);
    setMetricTypes({});
  };

  const handleMetricRemove = (metric: string) => {
    setSelectedMetrics(prev => prev.filter(m => m !== metric));
    setMetricTypes(prev => {
      const { [metric]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleMetricTypeChange = (metric: string, type: 'bar' | 'line') => {
    setMetricTypes(prev => ({
      ...prev,
      [metric]: type
    }));
  };

  return (
    <div className="space-y-6">
      <ChartingHeader
        onCompanySelect={handleCompanySelect}
        onMetricSelect={handleMetricSelect}
      />

      <div className="bg-white p-6 rounded-lg shadow-sm">
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        ) : (
          <ChartingContent
            selectedCompany={selectedCompany}
            selectedMetrics={selectedMetrics}
            financialData={financialData || []}
            metricTypes={metricTypes}
            onMetricRemove={handleMetricRemove}
            onMetricTypeChange={handleMetricTypeChange}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        )}
      </div>
    </div>
  );
};

export default Charting;