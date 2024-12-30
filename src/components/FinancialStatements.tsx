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
    
    const cleanValue = value.toString().replace(/[$,]/g, '');
    
    if (cleanValue.endsWith('B')) {
      return parseFloat(cleanValue.replace('B', '')) * 1000000000;
    }
    
    if (cleanValue.endsWith('M')) {
      return parseFloat(cleanValue.replace('M', '')) * 1000000;
    }
    
    return parseFloat(cleanValue);
  };

  const getMetricData = (metrics: string[]) => {
    if (!metrics || metrics.length === 0) {
      console.log('No metrics selected');
      return [];
    }

    const data = financialData[ticker]?.[timeFrame] || [];
    console.log('Raw financial data for ticker:', ticker, data);
    
    if (!data || data.length === 0) {
      console.log('No data available for ticker:', ticker);
      return [];
    }

    // Transform data for chart
    const transformedData = data
      .filter(item => {
        const year = parseInt(item.period);
        return year >= 2019 + sliderValue[0] && year <= 2019 + sliderValue[1];
      })
      .sort((a, b) => parseInt(a.period) - parseInt(b.period))
      .map(item => {
        const chartPoint: any = { period: item.period };
        
        metrics.forEach(metricId => {
          const rawValue = item[metricId];
          console.log(`Processing ${metricId} for period ${item.period}:`, rawValue);
          const value = parseValue(rawValue);
          const label = getMetricLabel(metricId);
          chartPoint[label] = value;
        });
        
        return chartPoint;
      });

    console.log('Transformed chart data:', transformedData);
    return transformedData;
  };

  const getMetricLabel = (metricId: string): string => {
    const metrics = {
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
      totalAssets: "Total Assets",
      totalLiabilities: "Total Liabilities",
      totalEquity: "Total Equity",
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