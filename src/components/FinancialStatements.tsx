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
import { transformFinancialData } from "@/utils/financialDataTransform";

export const FinancialStatements = ({ ticker }: { ticker: string }) => {
  const [timeFrame, setTimeFrame] = useState<"annual" | "quarterly" | "ttm">("annual");
  const { financialData, isLoading: isIncomeStatementLoading } = useFinancialData(ticker);
  const { filteredData: balanceSheetData, isLoading: isBalanceSheetLoading } = useBalanceSheetData(ticker);
  
  // Mock cash flow data for now - in a real app this would come from an API
  const cashFlowData = [
    {
      date: "2023-12-31",
      period: "2023",
      investmentsInPropertyPlantAndEquipment: "25000000000"
    },
    {
      date: "2022-12-31",
      period: "2022",
      investmentsInPropertyPlantAndEquipment: "24000000000"
    },
    {
      date: "2021-12-31",
      period: "2021",
      investmentsInPropertyPlantAndEquipment: "23000000000"
    },
    {
      date: "2020-12-31",
      period: "2020",
      investmentsInPropertyPlantAndEquipment: "22000000000"
    },
    {
      date: "2019-12-31",
      period: "2019",
      investmentsInPropertyPlantAndEquipment: "21000000000"
    }
  ];
  
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

  const metricData = transformFinancialData(
    financialData,
    balanceSheetData,
    cashFlowData,
    selectedMetrics,
    timePeriods,
    sliderValue,
    ticker
  );

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