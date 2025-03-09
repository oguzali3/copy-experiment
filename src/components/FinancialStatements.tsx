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
  // Note: For TTM mode, we still need quarterly data because it contains the TTM period
  const period = timeFrame === 'annual' ? 'annual' : 'quarter';
  
  // Fetch data from all financial statement sources
  const { financialData, isLoading: isIncomeStatementLoading } = useFinancialData(ticker, period);
  const { filteredData: balanceSheetData, isLoading: isBalanceSheetLoading } = useBalanceSheetData(ticker, period);
  const { cashFlowData, isLoading: isCashFlowLoading } = useCashFlowData(ticker, period);
  const { keyMetricsData, isLoading: isKeyMetricsLoading } = useKeyMetricsData(ticker, period);
  const { financialRatiosData, isLoading: isFinancialRatiosLoading } = useFinancialRatiosData(ticker, period);

  // Debug log to check time frame and data
  useEffect(() => {
    console.log(`TimeFrame: ${timeFrame}, API Period: ${period}`);
    console.log('Data loaded:', {
      incomeStatement: financialData?.length || 0,
      balanceSheet: balanceSheetData?.length || 0,
      cashFlow: cashFlowData?.length || 0,
      keyMetrics: keyMetricsData?.length || 0,
      financialRatios: financialRatiosData?.length || 0
    });
    
    // Check data for TTM entries and period formats
    if (financialData?.length > 0) {
      // Look for TTM entry
      const ttmEntry = financialData.find(item => item.period === 'TTM');
      console.log('TTM entry found:', ttmEntry ? 'Yes' : 'No');
      
      // Count period types
      const periodTypes = {
        annual: financialData.filter(item => !item.period?.includes('Q') && item.period !== 'TTM').length,
        quarterly: financialData.filter(item => item.period?.includes('Q')).length,
        ttm: financialData.filter(item => item.period === 'TTM').length
      };
      console.log('Period types count:', periodTypes);
      
      // Log first few items to check format
      console.log('First few items:', financialData.slice(0, 3).map(item => ({
        period: item.period,
        date: item.date,
        revenue: item.revenue
      })));
    }
  }, [timeFrame, period, financialData]);

  // Pass timeFrame to useTimePeriods for proper period extraction
  const {
    startDate,
    endDate,
    sliderValue,
    timePeriods,
    handleSliderChange
  } = useTimePeriods(financialData, ticker, timeFrame);

  const {
    selectedMetrics,
    setSelectedMetrics,
    metricTypes,
    handleMetricTypeChange,
    handleRemoveMetric,
  } = useMetrics(ticker);

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
      console.log(`Transforming data for ${timeFrame} view with ${selectedMetrics.length} metrics...`);
      console.log('Time periods from slider:', timePeriods);
      console.log('Slider values:', sliderValue);
      
      // Transform the data using our updated transformer
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
      
      // Update the state with the transformed data
      setMetricData(transformedData);
      
      // Log periods in transformed data
      if (transformedData.length > 0) {
        console.log(`Transformed data: ${transformedData.length} periods:`, 
          transformedData.map(item => item.period)
        );
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
          timeFrame={timeFrame}
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