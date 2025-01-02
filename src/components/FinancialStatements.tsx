import React, { useState } from "react";
import { Card } from "./ui/card";
import { TimeRangePanel } from "./financials/TimeRangePanel";
import { TimeFrameSelector } from "./financials/TimeFrameSelector";
import { MetricsChartSection } from "./financials/MetricsChartSection";
import { FinancialStatementsTabs } from "./financials/FinancialStatementsTabs";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useTimePeriods } from "@/hooks/useTimePeriods";
import { useMetrics } from "@/hooks/useMetrics";
import { useBalanceSheetData } from "@/hooks/useBalanceSheetData";

export const FinancialStatements = ({ ticker }: { ticker: string }) => {
  const [timeFrame, setTimeFrame] = useState<"annual" | "quarterly" | "ttm">("annual");
  const { financialData, isLoading: isIncomeStatementLoading } = useFinancialData(ticker);
  const { filteredData: balanceSheetData, isLoading: isBalanceSheetLoading } = useBalanceSheetData(ticker);
  
  const {
    startDate,
    endDate,
    sliderValue,
    timePeriods,
    handleSliderChange
  } = useTimePeriods(financialData, ticker);

  const {
    selectedMetrics,
    setSelectedMetrics,
    metricTypes,
    handleMetricTypeChange,
  } = useMetrics(ticker);

  const isLoading = isIncomeStatementLoading || isBalanceSheetLoading;

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

  const getMetricData = () => {
    if (!selectedMetrics.length) return [];

    const startYear = timePeriods[sliderValue[0]];
    const endYear = timePeriods[sliderValue[1]];

    // Combine and transform both income statement and balance sheet data
    const transformedData = (financialData?.[ticker]?.annual || []).map((item: any) => {
      const year = item.period;
      const dataPoint: Record<string, any> = { period: year };

      // Add income statement metrics
      selectedMetrics.forEach(metric => {
        if (item[metric] !== undefined) {
          const value = parseFloat(item[metric]?.toString().replace(/[^0-9.-]/g, '') || '0');
          dataPoint[metric] = isNaN(value) ? 0 : value;
        }
      });

      // Find and add corresponding balance sheet metrics
      const balanceSheetItem = balanceSheetData?.find((bsItem: any) => {
        const bsYear = bsItem.date ? new Date(bsItem.date).getFullYear().toString() : 'TTM';
        return bsYear === year;
      });

      if (balanceSheetItem) {
        selectedMetrics.forEach(metric => {
          if (balanceSheetItem[metric] !== undefined && !dataPoint[metric]) {
            const value = parseFloat(balanceSheetItem[metric]?.toString().replace(/[^0-9.-]/g, '') || '0');
            dataPoint[metric] = isNaN(value) ? 0 : value;
          }
        });
      }

      return dataPoint;
    });

    // Filter data based on selected time range
    return transformedData.filter((item: any) => {
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
  };

  const metricData = getMetricData();

  return (
    <div className="space-y-6">
      {selectedMetrics.length > 0 && (
        <MetricsChartSection 
          selectedMetrics={selectedMetrics}
          data={metricData}
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