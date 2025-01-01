import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { TimeRangePanel } from "./financials/TimeRangePanel";
import { TimeFrameSelector } from "./financials/TimeFrameSelector";
import { MetricsChartSection } from "./financials/MetricsChartSection";
import { FinancialStatementsTabs } from "./financials/FinancialStatementsTabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { transformFinancialData, calculateTTM, transformTTMData, getMetricChartData } from "@/utils/financialDataTransform";

interface FinancialDataResponse {
  date: string;
  symbol: string;
  revenue: number;
  revenueGrowth: number;
  costOfRevenue: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  netIncome: number;
  ebitda: number;
}

interface TransformedFinancialData {
  period: string;
  revenue: string;
  revenueGrowth: string;
  costOfRevenue: string;
  grossProfit: string;
  operatingExpenses: string;
  operatingIncome: string;
  netIncome: string;
  ebitda: string;
}

export const FinancialStatements = ({ ticker }: { ticker: string }) => {
  const [timeFrame, setTimeFrame] = useState<"annual" | "quarterly" | "ttm">("annual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("TTM");
  const [sliderValue, setSliderValue] = useState([0, 0]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [metricTypes, setMetricTypes] = useState<Record<string, 'bar' | 'line'>>({});
  const [timePeriods, setTimePeriods] = useState<string[]>([]);

  // Reset selected metrics when ticker changes
  useEffect(() => {
    setSelectedMetrics([]);
    setMetricTypes({});
  }, [ticker]);

  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial-data', ticker],
    queryFn: async () => {
      // First fetch TTM data (last 4 quarters)
      const { data: ttmData, error: ttmError } = await supabase.functions.invoke<{ data: FinancialDataResponse[] }>('fetch-financial-data', {
        body: { endpoint: 'income-statement', symbol: ticker, period: 'quarter', limit: 4 }
      });

      if (ttmError) throw ttmError;

      // Then fetch annual data
      const { data: annualData, error: annualError } = await supabase.functions.invoke<{ data: FinancialDataResponse[] }>('fetch-financial-data', {
        body: { endpoint: 'income-statement', symbol: ticker, period: 'annual' }
      });

      if (annualError) throw annualError;

      const transformedAnnual = transformFinancialData(annualData?.data || [], ticker) as TransformedFinancialData[];
      const ttm = calculateTTM(ttmData?.data || []);
      const transformedTTM = transformTTMData(ttm) as TransformedFinancialData;

      // Sort annual data chronologically
      const sortedAnnual = transformedAnnual.sort((a, b) => parseInt(a.period) - parseInt(b.period));

      // Update time periods based on available data
      const years = sortedAnnual.map(item => item.period);
      const uniqueYears = Array.from(new Set(years)).sort((a, b) => parseInt(a) - parseInt(b));
      const allPeriods = [...uniqueYears, 'TTM'];
      setTimePeriods(allPeriods);
      
      // Set initial slider values to show all available data
      setSliderValue([0, allPeriods.length - 1]);
      
      // Update date range display
      if (uniqueYears.length > 0) {
        setStartDate(`December 31, ${uniqueYears[0]}`);
        setEndDate('TTM');
      }

      return {
        [ticker]: {
          annual: sortedAnnual,
          ttm: [transformedTTM],
        }
      };
    },
    enabled: !!ticker,
  });

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    const startYear = timePeriods[value[0]];
    const endPeriod = timePeriods[value[1]];
    setStartDate(`December 31, ${startYear}`);
    setEndDate(endPeriod === 'TTM' ? 'TTM' : `December 31, ${endPeriod}`);
  };

  const handleMetricTypeChange = (metric: string, type: 'bar' | 'line') => {
    setMetricTypes(prev => ({
      ...prev,
      [metric]: type
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  const chartData = getMetricChartData(selectedMetrics, financialData, ticker, sliderValue, timePeriods);

  return (
    <div className="space-y-6">
      {selectedMetrics.length > 0 && (
        <MetricsChartSection 
          selectedMetrics={selectedMetrics}
          data={chartData}
          ticker={ticker}
          metricTypes={metricTypes}
          onMetricTypeChange={handleMetricTypeChange}
        />
      )}
      
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Financial Statements</h2>
            <TimeFrameSelector 
              timeFrame={timeFrame}
              onTimeFrameChange={setTimeFrame}
            />
          </div>

          <TimeRangePanel
            startDate={startDate}
            endDate={endDate}
            sliderValue={sliderValue}
            onSliderChange={handleSliderChange}
            timePeriods={timePeriods}
          />

          <FinancialStatementsTabs 
            timeFrame={timeFrame}
            selectedMetrics={selectedMetrics}
            onMetricsChange={setSelectedMetrics}
            ticker={ticker}
          />
        </div>
      </Card>
    </div>
  );
};