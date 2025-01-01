import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { TimeRangePanel } from "./financials/TimeRangePanel";
import { TimeFrameSelector } from "./financials/TimeFrameSelector";
import { MetricsChartSection } from "./financials/MetricsChartSection";
import { FinancialStatementsTabs } from "./financials/FinancialStatementsTabs";
import { INCOME_STATEMENT_METRICS, calculateMetricValue } from "@/utils/metricDefinitions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateToLongString } from "@/utils/dateFormatters";

export const FinancialStatements = ({ ticker }: { ticker: string }) => {
  const [timeFrame, setTimeFrame] = useState<"annual" | "quarterly" | "ttm">("annual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sliderValue, setSliderValue] = useState([0, 1]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [metricTypes, setMetricTypes] = useState<Record<string, 'bar' | 'line'>>({});
  const [timePeriods, setTimePeriods] = useState<string[]>([]);

  // Reset selected metrics when ticker changes
  React.useEffect(() => {
    setSelectedMetrics([]);
    setMetricTypes({});
  }, [ticker]);

  // Fetch financial data from API
  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial-data', ticker],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'income-statement', symbol: ticker }
      });

      if (error) throw error;

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
          annual: transformedData,
        }
      };
    },
    enabled: !!ticker,
  });

  // Update dates and time periods when financial data changes
  useEffect(() => {
    if (financialData && financialData[ticker]?.annual) {
      const annualData = financialData[ticker].annual;
      
      // Filter out TTM entry for sorting
      const regularData = annualData.filter(item => item.period !== 'TTM');
      const ttmData = annualData.find(item => item.period === 'TTM');
      
      // Sort regular data by year in ascending order
      const sortedData = [...regularData].sort((a, b) => 
        parseInt(a.period) - parseInt(b.period)
      );

      if (sortedData.length > 0) {
        const years = sortedData.map(item => item.period);
        
        // Add TTM if it exists
        if (ttmData) {
          years.push('TTM');
        }
        
        setTimePeriods(years);

        // Set initial dates based on the actual data
        const earliestYear = years[0];
        const latestYear = ttmData ? 'TTM' : years[years.length - 1];

        setStartDate(`December 31, ${earliestYear}`);
        
        if (latestYear === 'TTM') {
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth();
          const ttmDate = new Date(currentDate.getFullYear(), currentMonth, 0);
          setEndDate(formatDateToLongString(ttmDate));
        } else {
          setEndDate(`December 31, ${latestYear}`);
        }

        // Initialize slider with full range
        setSliderValue([0, years.length - 1]);
      }
    }
  }, [financialData, ticker]);

  const handleSliderChange = (value: number[]) => {
    if (timePeriods.length === 0) return;

    setSliderValue(value);
    const startYear = timePeriods[value[0]];
    const endYear = timePeriods[value[1]];
    
    setStartDate(`December 31, ${startYear}`);
    
    if (endYear === 'TTM') {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const ttmDate = new Date(currentDate.getFullYear(), currentMonth, 0);
      setEndDate(formatDateToLongString(ttmDate));
    } else {
      setEndDate(`December 31, ${endYear}`);
    }
  };

  const handleMetricTypeChange = (metric: string, type: 'bar' | 'line') => {
    setMetricTypes(prev => ({
      ...prev,
      [metric]: type
    }));
  };

  const getMetricData = () => {
    if (!selectedMetrics.length || !financialData) return [];

    const annualData = financialData[ticker]?.annual || [];
    if (!annualData.length) return [];

    const startYear = timePeriods[sliderValue[0]];
    const endYear = timePeriods[sliderValue[1]];
    
    const filteredData = annualData.filter(item => {
      if (item.period === 'TTM') {
        return endYear === 'TTM';
      }
      const year = parseInt(item.period);
      const startYearInt = parseInt(startYear);
      const endYearInt = endYear === 'TTM' ? 
        parseInt(timePeriods[timePeriods.length - 2]) : 
        parseInt(endYear);
      
      return year >= startYearInt && year <= endYearInt;
    });

    return filteredData.map((item, index) => {
      const point: Record<string, any> = { period: item.period };
      const previousItem = filteredData[index + 1];
      
      selectedMetrics.forEach(metric => {
        const metricDef = INCOME_STATEMENT_METRICS.find(m => m.id === metric);
        if (metricDef) {
          point[metric] = calculateMetricValue(metricDef, item, previousItem);
        }
      });
      
      return point;
    });
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

  return (
    <div className="space-y-6">
      {selectedMetrics.length > 0 && (
        <MetricsChartSection 
          selectedMetrics={selectedMetrics}
          data={getMetricData()}
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
