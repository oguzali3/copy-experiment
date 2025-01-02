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

  const calculateMetricChange = (data: any[]) => {
    if (data.length < 2) return null;
    const firstValue = parseFloat(data[0]?.toString().replace(/[^0-9.-]/g, '') || '0');
    const lastValue = parseFloat(data[data.length - 1]?.toString().replace(/[^0-9.-]/g, '') || '0');
    if (isNaN(firstValue) || isNaN(lastValue) || firstValue === 0) return null;
    return ((lastValue - firstValue) / Math.abs(firstValue)) * 100;
  };

  const calculateCAGR = (data: any[], years: number) => {
    if (data.length < 2 || years <= 0) return null;
    const firstValue = parseFloat(data[0]?.toString().replace(/[^0-9.-]/g, '') || '0');
    const lastValue = parseFloat(data[data.length - 1]?.toString().replace(/[^0-9.-]/g, '') || '0');
    if (isNaN(firstValue) || isNaN(lastValue) || firstValue <= 0 || lastValue <= 0) return null;
    return ((Math.pow(lastValue / firstValue, 1 / years) - 1) * 100);
  };

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
    const filteredData = transformedData.filter((item: any) => {
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

    // Calculate years for CAGR
    const years = endYear === 'TTM' ? 
      filteredData.length - 2 : // Exclude TTM from year count
      filteredData.length - 1;

    // Add total change and CAGR to metric names
    return filteredData.map((item: any) => {
      const metricValues = selectedMetrics.map(metric => {
        const values = filteredData.map(d => d[metric]);
        const totalChange = calculateMetricChange(values);
        const cagr = calculateCAGR(values, years);
        return {
          metric,
          values,
          totalChange: totalChange !== null ? `${totalChange.toFixed(2)}%` : 'NaN%',
          cagr: cagr !== null ? `${cagr.toFixed(2)}%` : 'NaN%'
        };
      });

      const enhancedDataPoint = { ...item };
      metricValues.forEach(({ metric, totalChange, cagr }) => {
        if (enhancedDataPoint[metric] !== undefined) {
          enhancedDataPoint[`${metric}_totalChange`] = totalChange;
          enhancedDataPoint[`${metric}_cagr`] = cagr;
        }
      });

      return enhancedDataPoint;
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