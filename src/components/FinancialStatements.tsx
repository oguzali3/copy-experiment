import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { TimeRangePanel } from "./financials/TimeRangePanel";
import { TimeFrameSelector } from "./financials/TimeFrameSelector";
import { MetricsChartSection } from "./financials/MetricsChartSection";
import { FinancialStatementsTabs } from "./financials/FinancialStatementsTabs";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useTimePeriods } from "@/hooks/useTimePeriods";
import { useMetrics } from "@/hooks/useMetrics";
import { useBalanceSheetData } from "@/hooks/useBalanceSheetData";
import { transformFinancialData } from "@/utils/financialDataTransform";
import { useCashFlowData } from "@/hooks/useCashFlowData";

export const FinancialStatements = ({ ticker }: { ticker: string }) => {
  const [timeFrame, setTimeFrame] = useState<"annual" | "quarterly" | "ttm">("annual");
  
  // Update period parameter based on timeFrame
  const period = timeFrame === 'quarterly' ? 'quarter' : 'annual';
  
  const { financialData, isLoading: isIncomeStatementLoading } = useFinancialData(ticker, period);
  const { filteredData: balanceSheetData, isLoading: isBalanceSheetLoading } = useBalanceSheetData(ticker, period);
  const { cashFlowData, isLoading: isCashFlowLoading } = useCashFlowData(ticker, period);

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

  const isLoading = isIncomeStatementLoading || isBalanceSheetLoading || isCashFlowLoading;

  // Store transformed data
  const [metricData, setMetricData] = useState<any[]>([]);
  
  // Transform data when inputs change
  useEffect(() => {
    if (isLoading) return;
    
    // Log the raw data for debugging
    console.log(`Income Statement Data:`, financialData);
    console.log(`Balance Sheet Data:`, balanceSheetData);
    console.log(`Cash Flow Data:`, cashFlowData);
    
    // Transform the data using our updated function
    const transformedData = transformFinancialData(
      financialData,
      balanceSheetData,
      cashFlowData,
      selectedMetrics,
      timePeriods,
      sliderValue,
      ticker,
      timeFrame
    );
    
    setMetricData(transformedData);
  }, [
    financialData, 
    balanceSheetData, 
    cashFlowData, 
    selectedMetrics, 
    timePeriods, 
    sliderValue, 
    ticker, 
    timeFrame,
    isLoading
  ]);

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
          data={metricData}
          ticker={ticker}
          metricTypes={metricTypes}
          onMetricTypeChange={handleMetricTypeChange}
        />
      )}
      
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-2">
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