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
  const [sliderValue, setSliderValue] = useState([0, 4]);
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

      // Transform API data to match our format
      const transformedData = data.map((item: any) => ({
        period: new Date(item.date).getFullYear().toString(),
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
          ttm: [], // We'll handle TTM data separately if needed
        }
      };
    },
    enabled: !!ticker,
  });

  // Update dates and time periods when financial data changes
  useEffect(() => {
    if (financialData && financialData[ticker]?.annual) {
      const annualData = financialData[ticker].annual;
      
      // Sort data by year in ascending order
      const sortedData = [...annualData].sort((a, b) => 
        parseInt(a.period) - parseInt(b.period)
      );

      // Get earliest and latest years
      const earliestYear = sortedData[0]?.period;
      const latestYear = sortedData[sortedData.length - 1]?.period;
      
      // Get current date for TTM calculation
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      
      // Get TTM date (last day of previous month)
      const ttmDate = new Date(currentYear, currentMonth, 0);
      const ttmDateString = formatDateToLongString(ttmDate);

      if (earliestYear && latestYear) {
        // Create array of all years between earliest and latest, plus TTM
        const years = [];
        for (let year = parseInt(earliestYear); year <= parseInt(latestYear); year++) {
          years.push(year.toString());
        }
        years.push('TTM');
        setTimePeriods(years);

        // Set initial dates
        setStartDate(`December 31, ${earliestYear}`);
        setEndDate(ttmDateString);

        // Update slider values based on the number of periods
        const periodCount = years.length - 1;
        setSliderValue([0, periodCount]);
      }
    }
  }, [financialData, ticker]);

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    if (timePeriods.length > 0) {
      const startYear = timePeriods[value[0]];
      const endYear = timePeriods[value[1]];
      
      // Set start date
      setStartDate(`December 31, ${startYear}`);
      
      // Set end date based on whether TTM is selected
      if (endYear === 'TTM') {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const ttmDate = new Date(currentYear, currentMonth, 0);
        setEndDate(formatDateToLongString(ttmDate));
      } else {
        setEndDate(`December 31, ${endYear}`);
      }
    }
  };

  const handleMetricTypeChange = (metric: string, type: 'bar' | 'line') => {
    setMetricTypes(prev => ({
      ...prev,
      [metric]: type
    }));
  };

  const getMetricData = () => {
    if (!selectedMetrics.length || !financialData) {
      console.log('No metrics selected or no data available');
      return [];
    }

    const annualData = financialData[ticker]?.annual || [];
    console.log('Raw data for ticker:', ticker, annualData);

    if (!annualData.length) {
      console.log('No data available');
      return [];
    }

    // Filter years based on slider and time periods
    const startYear = timePeriods[sliderValue[0]];
    const endYear = timePeriods[sliderValue[1]];
    
    const filteredData = annualData.filter(item => {
      const year = parseInt(item.period);
      const startYearInt = parseInt(startYear);
      const endYearInt = endYear === 'TTM' ? new Date().getFullYear() : parseInt(endYear);
      return year >= startYearInt && year <= endYearInt;
    });

    console.log('Filtered data:', filteredData);

    // Transform data for chart
    const chartData = filteredData.map((item, index) => {
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

    console.log('Final chart data:', chartData);
    return chartData;
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