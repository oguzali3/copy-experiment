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
    revenue: "revenue",
    revenueGrowth: "revenueGrowth",
    costOfRevenue: "costOfRevenue",
    grossProfit: "grossProfit",
    totalAssets: "totalAssets",
    totalLiabilities: "totalLiabilities",
    totalEquity: "totalEquity",
    operatingCashFlow: "operatingCashFlow",
    investingCashFlow: "investingCashFlow",
    financingCashFlow: "financingCashFlow",
    freeCashFlow: "freeCashFlow",
    sga: "sga",
    researchDevelopment: "researchDevelopment",
    operatingExpenses: "operatingExpenses",
    operatingIncome: "operatingIncome",
    netIncome: "netIncome",
    ebitda: "ebitda",
    sellingGeneralAndAdministrativeExpenses: "sga" // Map to the correct key in the data
  };

  const getMetricData = (metrics: string[]) => {
    const data = financialData[ticker]?.[timeFrame] || [];
    const filteredData = data
      .filter(item => {
        const year = parseInt(item.period);
        return year >= 2019 + sliderValue[0] && year <= 2019 + sliderValue[1];
      })
      .map(item => ({
        period: item.period,
        metrics: metrics.map(metricId => {
          // Get the corresponding data key for this metric
          const dataKey = metricToDataKeyMap[metricId];
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
      revenue: "Revenue",
      revenueGrowth: "Revenue Growth",
      costOfRevenue: "Cost of Revenue",
      grossProfit: "Gross Profit",
      totalAssets: "Total Assets",
      totalLiabilities: "Total Liabilities",
      totalEquity: "Total Equity",
      operatingCashFlow: "Operating Cash Flow",
      investingCashFlow: "Investing Cash Flow",
      financingCashFlow: "Financing Cash Flow",
      freeCashFlow: "Free Cash Flow",
      sga: "SG&A",
      researchDevelopment: "R&D",
      operatingExpenses: "Operating Expenses",
      operatingIncome: "Operating Income",
      netIncome: "Net Income",
      ebitda: "EBITDA",
      sellingGeneralAndAdministrativeExpenses: "SG&A Expenses"
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