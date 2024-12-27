import React, { useState } from "react";
import { Card } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { IncomeStatement } from "./financials/IncomeStatement";
import { BalanceSheet } from "./financials/BalanceSheet";
import { CashFlow } from "./financials/CashFlow";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { TimeRangePanel } from "./financials/TimeRangePanel";
import { MetricChart } from "./financials/MetricChart";
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
        // Set default chart type based on metric name
        if (metric.toLowerCase().includes('margin') || metric.toLowerCase().includes('growth')) {
          newMetricTypes[metric] = 'line';
        } else {
          newMetricTypes[metric] = 'bar';
        }
      }
    });
    setMetricTypes(newMetricTypes);
  }, [selectedMetrics]);

  // Define the available time periods
  const timePeriods = [
    "2019", "2020", "2021", "2022", "2023"
  ];

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

  const getMetricData = (metrics: string[]) => {
    const data = financialData[ticker]?.[timeFrame] || [];

    // Filter data based on the selected time range
    const filteredData = data
      .filter(item => {
        const year = parseInt(item.period);
        return year >= 2019 + sliderValue[0] && year <= 2019 + sliderValue[1];
      });

    return filteredData.map(item => ({
      period: item.period,
      metrics: metrics.map(metricId => ({
        name: getMetricLabel(metricId),
        value: parseFloat((item[metricId as keyof typeof item] || "0").replace(/,/g, '')),
      })),
    }));
  };

  // Get metric label
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
      ebitda: "EBITDA"
    };
    return metrics[metricId as keyof typeof metrics] || metricId;
  };

  return (
    <div className="space-y-6">
      {selectedMetrics.length > 0 && (
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Selected Metrics</h2>
          </div>
          <MetricChart 
            data={getMetricData(selectedMetrics)}
            metrics={selectedMetrics.map(getMetricLabel)}
            ticker={ticker}
            metricTypes={metricTypes}
            onMetricTypeChange={handleMetricTypeChange}
          />
        </Card>
      )}
      
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Financial Statements</h2>
            <RadioGroup
              defaultValue="annual"
              onValueChange={(value) => setTimeFrame(value as "annual" | "quarterly" | "ttm")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="annual" id="annual" />
                <Label htmlFor="annual">Annual</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quarterly" id="quarterly" />
                <Label htmlFor="quarterly">Quarterly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ttm" id="ttm" />
                <Label htmlFor="ttm">TTM</Label>
              </div>
            </RadioGroup>
          </div>

          <TimeRangePanel
            startDate={startDate}
            endDate={endDate}
            sliderValue={sliderValue}
            onSliderChange={handleSliderChange}
            timePeriods={timePeriods}
          />

          <Tabs defaultValue="income" className="w-full">
            <TabsList className="w-full justify-start mb-4">
              <TabsTrigger value="income">Income Statement</TabsTrigger>
              <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
              <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
            </TabsList>
            <TabsContent value="income">
              <div className="space-y-6">
                <IncomeStatement 
                  timeFrame={timeFrame} 
                  selectedMetrics={selectedMetrics}
                  onMetricsChange={setSelectedMetrics}
                  ticker={ticker}
                />
              </div>
            </TabsContent>
            <TabsContent value="balance">
              <div className="space-y-6">
                <BalanceSheet 
                  timeFrame={timeFrame} 
                  selectedMetrics={selectedMetrics}
                  onMetricsChange={setSelectedMetrics}
                  ticker={ticker}
                />
              </div>
            </TabsContent>
            <TabsContent value="cashflow">
              <div className="space-y-6">
                <CashFlow 
                  timeFrame={timeFrame}
                  selectedMetrics={selectedMetrics}
                  onMetricsChange={setSelectedMetrics}
                  ticker={ticker}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};