import React, { useState } from "react";
import { Card } from "./ui/card";
import { TimeRangePanel } from "./financials/TimeRangePanel";
import { TimeFrameSelector } from "./financials/TimeFrameSelector";
import { MetricsChartSection } from "./financials/MetricsChartSection";
import { FinancialStatementsTabs } from "./financials/FinancialStatementsTabs";
import { financialData } from "@/data/financialData";
import { INCOME_STATEMENT_METRICS, calculateMetricValue } from "@/utils/metricDefinitions";

export const FinancialStatements = ({ ticker }: { ticker: string }) => {
  const [timeFrame, setTimeFrame] = useState<"annual" | "quarterly" | "ttm">("annual");
  const [startDate, setStartDate] = useState("December 31, 2019");
  const [endDate, setEndDate] = useState("December 31, 2023");
  const [sliderValue, setSliderValue] = useState([0, 4]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [metricTypes, setMetricTypes] = useState<Record<string, 'bar' | 'line'>>({});

  // Reset selected metrics when ticker changes
  React.useEffect(() => {
    setSelectedMetrics([]);
    setMetricTypes({});
  }, [ticker]);

  const timePeriods = ["2019", "2020", "2021", "2022", "2023"];

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    setStartDate(`December 31, 20${19 + value[0]}`);
    setEndDate(`December 31, 20${19 + value[1]}`);
  };

  const handleMetricTypeChange = (metric: string, type: 'bar' | 'line') => {
    setMetricTypes(prev => ({
      ...prev,
      [metric]: type
    }));
  };

  const getMetricData = () => {
    if (!selectedMetrics.length) {
      console.log('No metrics selected');
      return [];
    }

    const annualData = financialData[ticker]?.annual || [];
    const ttmData = financialData[ticker]?.ttm || [];
    console.log('Raw data for ticker:', ticker, annualData);

    if (!annualData.length) {
      console.log('No data available');
      return [];
    }

    // Filter years based on slider
    const startYear = 2019 + sliderValue[0];
    const endYear = 2019 + sliderValue[1];
    
    const filteredData = annualData.filter(item => {
      const year = parseInt(item.period);
      return year >= startYear && year <= endYear;
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

    // Add TTM data if available
    if (ttmData.length > 0) {
      const ttmPoint: Record<string, any> = { period: 'TTM' };
      const previousPeriod = filteredData[0];
      
      selectedMetrics.forEach(metric => {
        const metricDef = INCOME_STATEMENT_METRICS.find(m => m.id === metric);
        if (metricDef) {
          ttmPoint[metric] = calculateMetricValue(metricDef, ttmData[0], previousPeriod);
        }
      });
      chartData.push(ttmPoint);
    }

    console.log('Final chart data:', chartData);
    return chartData;
  };

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
