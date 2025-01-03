import React, { useState } from "react";
import { MetricsSearch } from "@/components/MetricsSearch";
import { CompanySearch } from "@/components/CompanySearch";
import { MetricChart } from "@/components/financials/MetricChart";
import { MetricsDataTable } from "@/components/financials/MetricsDataTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Charting = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [metricTypes, setMetricTypes] = useState<Record<string, 'bar' | 'line'>>({});

  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial-data', selectedCompany?.symbol, selectedMetrics],
    queryFn: async () => {
      if (!selectedCompany?.symbol || !selectedMetrics.length) return null;

      // Fetch all required financial data including TTM
      const responses = await Promise.all([
        supabase.functions.invoke('fetch-financial-data', {
          body: { 
            endpoint: 'income-statement', 
            symbol: selectedCompany.symbol,
            period: 'annual',
            limit: 10  // Fetch up to 10 years of data
          }
        }),
        supabase.functions.invoke('fetch-financial-data', {
          body: { 
            endpoint: 'income-statement', 
            symbol: selectedCompany.symbol,
            period: 'quarter'  // This will give us TTM data
          }
        }),
        supabase.functions.invoke('fetch-financial-data', {
          body: { 
            endpoint: 'balance-sheet-statement', 
            symbol: selectedCompany.symbol,
            period: 'annual',
            limit: 10
          }
        }),
        supabase.functions.invoke('fetch-financial-data', {
          body: { 
            endpoint: 'balance-sheet-statement', 
            symbol: selectedCompany.symbol,
            period: 'quarter'
          }
        }),
        supabase.functions.invoke('fetch-financial-data', {
          body: { 
            endpoint: 'cash-flow-statement', 
            symbol: selectedCompany.symbol,
            period: 'annual',
            limit: 10
          }
        }),
        supabase.functions.invoke('fetch-financial-data', {
          body: { 
            endpoint: 'cash-flow-statement', 
            symbol: selectedCompany.symbol,
            period: 'quarter'
          }
        })
      ]);

      const [
        annualIncome, 
        quarterlyIncome, 
        annualBalance, 
        quarterlyBalance,
        annualCashFlow,
        quarterlyCashFlow
      ] = responses.map(r => r.data);

      // Calculate TTM data from quarterly data
      const ttmData = quarterlyIncome?.slice(0, 4).reduce((acc: any, quarter: any) => {
        selectedMetrics.forEach(metric => {
          if (!acc[metric]) acc[metric] = 0;
          acc[metric] += parseFloat(quarter[metric] || 0);
        });
        return acc;
      }, { period: 'TTM' });

      // Transform annual data
      const transformedAnnual = annualIncome?.map((period: any, index: number) => {
        const dataPoint: any = {
          period: new Date(period.date).getFullYear().toString()
        };

        selectedMetrics.forEach(metric => {
          // Add the metric value from the appropriate data source
          if (annualIncome[index][metric]) dataPoint[metric] = annualIncome[index][metric];
          if (annualBalance?.[index]?.[metric]) dataPoint[metric] = annualBalance[index][metric];
          if (annualCashFlow?.[index]?.[metric]) dataPoint[metric] = annualCashFlow[index][metric];
        });

        return dataPoint;
      });

      // Combine TTM with annual data if TTM exists and is different from most recent annual
      const result = ttmData ? [ttmData, ...transformedAnnual] : transformedAnnual;
      
      console.log('Processed financial data:', result?.length, 'periods');
      return result;
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

  const handleMetricTypeChange = (metric: string, type: 'bar' | 'line') => {
    setMetricTypes(prev => ({
      ...prev,
      [metric]: type
    }));
  };

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

            {isLoading ? (
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            ) : financialData && selectedMetrics.length > 0 ? (
              <div className="space-y-6">
                <div className="h-[500px]">
                  <MetricChart 
                    data={financialData}
                    metrics={selectedMetrics}
                    ticker={selectedCompany.symbol}
                    metricTypes={metricTypes}
                    onMetricTypeChange={handleMetricTypeChange}
                  />
                </div>
                <MetricsDataTable 
                  data={financialData}
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