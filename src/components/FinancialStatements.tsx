import React, { useState, useEffect, useCallback } from "react";
import { Card } from "./ui/card";
import { TimeFrameSelector } from "./financials/TimeFrameSelector";
import { MetricsChartSection } from "./financials/MetricsChartSection";
import { FinancialStatementsTabs } from "./financials/FinancialStatementsTabs";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useTimePeriods } from "@/hooks/useTimePeriods";
import { useMetrics } from "@/hooks/useMetrics";
import { useBalanceSheetData } from "@/hooks/useBalanceSheetData";
import { transformFinancialData } from "@/utils/financialDataTransform";
import { useCashFlowData } from "@/hooks/useCashFlowData";
import { useKeyMetricsData } from "@/hooks/useKeyMetricsData";
import { useFinancialRatiosData } from "@/hooks/useFinancialRatiosData";

export const FinancialStatements = ({ ticker }: { ticker: string }) => {
  const [timeFrame, setTimeFrame] = useState<"annual" | "quarterly" | "ttm">("annual");
  
  // Update period parameter based on timeFrame
  const period = timeFrame === 'quarterly' ? 'quarter' : 'annual';
  
  // Fetch data from all financial statement sources
  const { financialData, isLoading: isIncomeStatementLoading } = useFinancialData(ticker, period);
  const { filteredData: balanceSheetData, isLoading: isBalanceSheetLoading } = useBalanceSheetData(ticker, period);
  const { cashFlowData, isLoading: isCashFlowLoading } = useCashFlowData(ticker, period);
  const { keyMetricsData, isLoading: isKeyMetricsLoading } = useKeyMetricsData(ticker, period);
  const { financialRatiosData, isLoading: isFinancialRatiosLoading } = useFinancialRatiosData(ticker, period);

  // Debug log to check if we're getting data
  useEffect(() => {
    console.log('Data loaded:', {
      incomeStatement: financialData?.length || 0,
      balanceSheet: balanceSheetData?.length || 0,
      cashFlow: cashFlowData?.length || 0,
      keyMetrics: keyMetricsData?.length || 0,
      financialRatios: financialRatiosData?.length || 0
    });
    
    // Check first items of key metrics and financial ratios
    if (keyMetricsData?.length > 0) {
      console.log('First Key Metrics item sample properties:', 
        Object.keys(keyMetricsData[0]).slice(0, 10)
      );
    }
    
    if (financialRatiosData?.length > 0) {
      console.log('First Financial Ratios item sample properties:', 
        Object.keys(financialRatiosData[0]).slice(0, 10)
      );
    }
  }, [financialData, balanceSheetData, cashFlowData, keyMetricsData, financialRatiosData]);

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
    handleRemoveMetric,
  } = useMetrics(ticker);

  // Debug log to check which metrics are selected
  useEffect(() => {
    if (selectedMetrics.length > 0) {
      console.log('Currently selected metrics:', selectedMetrics);
    }
  }, [selectedMetrics]);

  // Check if any data source is still loading
  const isLoading = 
    isIncomeStatementLoading || 
    isBalanceSheetLoading || 
    isCashFlowLoading || 
    isKeyMetricsLoading || 
    isFinancialRatiosLoading;

  // Store transformed data
  const [metricData, setMetricData] = useState<any[]>([]);
  
  // Transform data when inputs change
  useEffect(() => {
    if (isLoading || selectedMetrics.length === 0) {
      setMetricData([]);
      return;
    }
    
    try {
      const transformedData = transformFinancialData(
        financialData || [],
        balanceSheetData || [],
        cashFlowData || [],
        keyMetricsData || [],
        financialRatiosData || [],
        selectedMetrics,
        timePeriods,
        sliderValue,
        ticker,
        timeFrame
      );
      
      setMetricData(transformedData);
      
      // Debug log to check if data contains selected metrics
      if (transformedData.length > 0 && selectedMetrics.length > 0) {
        const firstItem = transformedData[0];
        const metricsFound = selectedMetrics.filter(metric => firstItem[metric] !== undefined);
        const metricsNotFound = selectedMetrics.filter(metric => firstItem[metric] === undefined);
        
        console.log(`Metrics found in data: ${metricsFound.length}/${selectedMetrics.length}`);
        if (metricsNotFound.length > 0) {
          console.log('Metrics not found in transformed data:', metricsNotFound);
        }
      }
    } catch (error) {
      console.error('Error transforming financial data:', error);
      setMetricData([]);
    }
  }, [
    financialData, 
    balanceSheetData, 
    cashFlowData, 
    keyMetricsData,
    financialRatiosData,
    selectedMetrics, 
    timePeriods, 
    sliderValue, 
    ticker, 
    timeFrame,
    isLoading
  ]);

  // Check for empty data - skip rendering the chart if no data
  const hasData = metricData && metricData.length > 0;

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
      {/* Chart section includes both the chart and the time range controls */}
      {selectedMetrics.length > 0 && hasData && (
        <MetricsChartSection 
          selectedMetrics={selectedMetrics}
          data={metricData}
          ticker={ticker}
          metricTypes={metricTypes}
          onMetricTypeChange={handleMetricTypeChange}
          timePeriods={timePeriods}
          sliderValue={sliderValue}
          onSliderChange={handleSliderChange}
          startDate={startDate}
          endDate={endDate}
          onRemoveMetric={handleRemoveMetric}
        />
      )}
      
      {selectedMetrics.length > 0 && !hasData && (
        <Card className="p-6">
          <div className="py-8 text-center">
            <p className="text-gray-500">No data available for the selected metrics</p>
          </div>
        </Card>
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