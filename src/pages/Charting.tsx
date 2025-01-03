import React from "react";
import { MetricsSearch } from "@/components/MetricsSearch";
import { CompanySearch } from "@/components/CompanySearch";
import { MetricChart } from "@/components/financials/MetricChart";
import { MetricsDataTable } from "@/components/financials/MetricsDataTable";
import { TimeRangePanel } from "@/components/financials/TimeRangePanel";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMetrics } from "@/hooks/useMetrics";
import { useTimePeriods } from "@/hooks/useTimePeriods";

const Charting = () => {
  const [selectedCompany, setSelectedCompany] = React.useState<any>(null);
  
  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial-data', selectedCompany?.symbol],
    queryFn: async () => {
      if (!selectedCompany?.symbol) return null;

      // Fetch all required financial data including TTM
      const responses = await Promise.all([
        supabase.functions.invoke('fetch-financial-data', {
          body: { 
            endpoint: 'income-statement', 
            symbol: selectedCompany.symbol,
            period: 'annual',
            limit: 10
          }
        }),
        supabase.functions.invoke('fetch-financial-data', {
          body: { 
            endpoint: 'income-statement', 
            symbol: selectedCompany.symbol,
            period: 'quarter'
          }
        })
      ]);

      const [annualData, quarterlyData] = responses.map(r => r.data);

      // Calculate TTM data from quarterly data
      const ttmData = quarterlyData?.slice(0, 4).reduce((acc: any, quarter: any) => {
        Object.keys(quarter).forEach(key => {
          if (typeof quarter[key] === 'number') {
            if (!acc[key]) acc[key] = 0;
            acc[key] += quarter[key];
          }
        });
        return acc;
      }, { period: 'TTM' });

      return {
        [selectedCompany.symbol]: {
          annual: ttmData ? [ttmData, ...annualData] : annualData
        }
      };
    },
    enabled: !!selectedCompany?.symbol
  });

  const {
    selectedMetrics,
    setSelectedMetrics,
    metricTypes,
    handleMetricTypeChange,
    getMetricData
  } = useMetrics(selectedCompany?.symbol);

  const {
    startDate,
    endDate,
    sliderValue,
    timePeriods,
    handleSliderChange
  } = useTimePeriods(financialData, selectedCompany?.symbol);

  const handleCompanySelect = (company: any) => {
    setSelectedCompany(company);
  };

  const handleMetricSelect = (metricId: string) => {
    if (!selectedMetrics.includes(metricId)) {
      setSelectedMetrics(prev => [...prev, metricId]);
      setMetricTypes(prev => ({
        ...prev,
        [metricId]: metricId.toLowerCase().includes('ratio') ? 'line' : 'bar'
      }));
    }
  };

  const chartData = React.useMemo(() => {
    if (!financialData?.[selectedCompany?.symbol]) return [];
    return getMetricData(
      financialData[selectedCompany.symbol].annual,
      timePeriods,
      sliderValue
    );
  }, [financialData, selectedCompany, selectedMetrics, timePeriods, sliderValue]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-sm font-medium mb-2 text-gray-600">Search Companies</h2>
          <CompanySearch onCompanySelect={handleCompanySelect} />
        </div>
        <div>
          <h2 className="text-sm font-medium mb-2 text-gray-600">Search Metrics</h2>
          <MetricsSearch onMetricSelect={handleMetricSelect} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        {!selectedCompany && !selectedMetrics.length ? (
          <div className="text-center text-gray-500">
            <p>Select a company and metrics to start charting</p>
          </div>
        ) : (
          <div className="space-y-6">
            {selectedCompany && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{selectedCompany.name}</p>
                  <p className="text-sm text-gray-500">{selectedCompany.symbol} • {selectedCompany.exchangeShortName}</p>
                </div>
              </div>
            )}
            
            {selectedMetrics.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {selectedMetrics.map((metric, index) => (
                  <div 
                    key={index} 
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    <span>{metric}</span>
                    <button
                      onClick={() => setSelectedMetrics(prev => prev.filter(m => m !== metric))}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {timePeriods.length > 0 && (
              <TimeRangePanel
                startDate={startDate}
                endDate={endDate}
                sliderValue={sliderValue}
                onSliderChange={handleSliderChange}
                timePeriods={timePeriods}
              />
            )}

            {isLoading ? (
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            ) : chartData.length > 0 && selectedMetrics.length > 0 ? (
              <div className="space-y-6">
                <div className="h-[500px]">
                  <MetricChart 
                    data={chartData}
                    metrics={selectedMetrics}
                    ticker={selectedCompany.symbol}
                    metricTypes={metricTypes}
                    onMetricTypeChange={handleMetricTypeChange}
                  />
                </div>
                <MetricsDataTable 
                  data={chartData}
                  metrics={selectedMetrics}
                  ticker={selectedCompany.symbol}
                />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default Charting;