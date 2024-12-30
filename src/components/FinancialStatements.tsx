import React, { useState } from "react";
import { Card } from "./ui/card";
import { TimeRangePanel } from "./financials/TimeRangePanel";
import { TimeFrameSelector } from "./financials/TimeFrameSelector";
import { MetricsChartSection } from "./financials/MetricsChartSection";
import { FinancialStatementsTabs } from "./financials/FinancialStatementsTabs";
import { financialData } from "@/data/financialData";

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

  // Initialize chart type for new metrics
  React.useEffect(() => {
    const newMetricTypes = { ...metricTypes };
    selectedMetrics.forEach(metric => {
      if (!newMetricTypes[metric]) {
        if (metric.toLowerCase().includes('margin') || metric.toLowerCase().includes('growth')) {
          newMetricTypes[metric] = 'line';
        } else {
          newMetricTypes[metric] = 'bar';
        }
      }
    });
    setMetricTypes(newMetricTypes);
  }, [selectedMetrics]);

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

  const parseValue = (value: any): number => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    
    // Remove commas and dollar signs
    const cleanValue = value.toString().replace(/[$,]/g, '');
    
    // Handle billion format (e.g., "26.1B")
    if (cleanValue.endsWith('B')) {
      return parseFloat(cleanValue.replace('B', '')) * 1000000000;
    }
    
    // Handle million format (e.g., "26.1M")
    if (cleanValue.endsWith('M')) {
      return parseFloat(cleanValue.replace('M', '')) * 1000000;
    }
    
    return parseFloat(cleanValue);
  };

  // Map frontend metric IDs to their corresponding data keys
  const metricToDataKeyMap: Record<string, string> = {
    // Income Statement metrics
    revenue: "revenue",
    revenueGrowth: "revenueGrowth",
    costOfRevenue: "costOfRevenue",
    grossProfit: "grossProfit",
    sga: "sga",
    researchDevelopment: "researchDevelopment",
    operatingExpenses: "operatingExpenses",
    operatingIncome: "operatingIncome",
    netIncome: "netIncome",
    ebitda: "ebitda",
    sellingGeneralAndAdministrativeExpenses: "sga",
    
    // Balance Sheet metrics
    totalAssets: "totalAssets",
    totalLiabilities: "totalLiabilities",
    totalEquity: "totalEquity",
    
    // Cash Flow metrics
    operatingCashFlow: "operatingCashFlow",
    netCashFlow: "netCashFlow",
    cashAtEndOfPeriod: "cashAtEndOfPeriod",
    capitalExpenditure: "capitalExpenditure",
    freeCashFlow: "freeCashFlow",
    investingCashFlow: "netCashUsedForInvestingActivites",
    financingCashFlow: "netCashUsedProvidedByFinancingActivities",
    cashAtBeginningOfPeriod: "cashAtBeginningOfPeriod",
    changeInWorkingCapital: "changeInWorkingCapital",
    stockBasedCompensation: "stockBasedCompensation",
    depreciationAndAmortization: "depreciationAndAmortization",
    dividendsPaid: "dividendsPaid",
    commonStockRepurchased: "commonStockRepurchased",
    debtRepayment: "debtRepayment"
  };

  const getMetricData = (metrics: string[]) => {
    const data = financialData[ticker]?.[timeFrame] || [];
    const filteredData = data
      .filter(item => {
        if (item.period === 'TTM') return true;
        const year = parseInt(item.period);
        return year >= 2019 + sliderValue[0] && year <= 2019 + sliderValue[1];
      })
      .sort((a, b) => {
        if (a.period === 'TTM') return 1;  // TTM goes at the end
        if (b.period === 'TTM') return -1;
        return parseInt(a.period) - parseInt(b.period);
      })
      .map(item => ({
        period: item.period,
        metrics: metrics.map(metricId => {
          // Get the corresponding data key for this metric
          const dataKey = metricToDataKeyMap[metricId];
          if (!dataKey) {
            console.warn(`No data key mapping found for metric: ${metricId}`);
            return { name: getMetricLabel(metricId), value: 0 };
          }
          
          // Get the raw value using the mapped key
          const rawValue = item[dataKey as keyof typeof item];
          console.log(`Raw value for ${metricId} (using key ${dataKey}):`, rawValue);
          
          // Parse the value properly
          const parsedValue = parseValue(rawValue);
          console.log(`Parsed value for ${metricId}:`, parsedValue);
          
          return {
            name: getMetricLabel(metricId),
            value: parsedValue,
          };
        }),
      }));

    console.log('Filtered and transformed data:', filteredData);
    return filteredData;
  };

  const getMetricLabel = (metricId: string): string => {
    const metrics = {
      // Income Statement metrics
      revenue: "Revenue",
      revenueGrowth: "Revenue Growth",
      costOfRevenue: "Cost of Revenue",
      grossProfit: "Gross Profit",
      sga: "SG&A",
      researchDevelopment: "R&D",
      operatingExpenses: "Operating Expenses",
      operatingIncome: "Operating Income",
      netIncome: "Net Income",
      ebitda: "EBITDA",
      sellingGeneralAndAdministrativeExpenses: "SG&A Expenses",
      
      // Balance Sheet metrics
      totalAssets: "Total Assets",
      totalLiabilities: "Total Liabilities",
      totalEquity: "Total Equity",
      
      // Cash Flow metrics
      operatingCashFlow: "Operating Cash Flow",
      netCashFlow: "Net Cash Flow",
      cashAtEndOfPeriod: "Cash at End of Period",
      capitalExpenditure: "Capital Expenditure",
      freeCashFlow: "Free Cash Flow",
      investingCashFlow: "Investing Cash Flow",
      financingCashFlow: "Financing Cash Flow",
      cashAtBeginningOfPeriod: "Cash at Beginning of Period",
      changeInWorkingCapital: "Change in Working Capital",
      stockBasedCompensation: "Stock-based Compensation",
      depreciationAndAmortization: "Depreciation & Amortization",
      dividendsPaid: "Dividends Paid",
      commonStockRepurchased: "Stock Sale & Purchase",
      debtRepayment: "Debt Repayment"
    };
    return metrics[metricId as keyof typeof metrics] || metricId;
  };

  return (
    <div className="space-y-6">
      <MetricsChartSection 
        selectedMetrics={selectedMetrics}
        data={getMetricData(selectedMetrics)}
        ticker={ticker}
        metricTypes={metricTypes}
        onMetricTypeChange={handleMetricTypeChange}
        getMetricLabel={getMetricLabel}
      />
      
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