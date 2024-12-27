import { useState } from "react";
import { Card } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { IncomeStatement } from "./financials/IncomeStatement";
import { BalanceSheet } from "./financials/BalanceSheet";
import { CashFlow } from "./financials/CashFlow";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { TimeRangePanel } from "./financials/TimeRangePanel";
import { MetricChart } from "./financials/MetricChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export const FinancialStatements = ({ ticker }: { ticker: string }) => {
  const [timeFrame, setTimeFrame] = useState<"annual" | "quarterly" | "ttm">("annual");
  const [startDate, setStartDate] = useState("December 31, 2019");
  const [endDate, setEndDate] = useState("December 31, 2023");
  const [sliderValue, setSliderValue] = useState([0, 4]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  // Define the available time periods
  const timePeriods = [
    "2019", "2020", "2021", "2022", "2023"
  ];

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    setStartDate(`December 31, 20${19 + value[0]}`);
    setEndDate(`December 31, 20${19 + value[1]}`);
  };

  const getMetricData = (metrics: string[]) => {
    const data = {
      annual: [
        { period: "2023", revenue: "60922", revenueGrowth: "125.85", costOfRevenue: "16621", grossProfit: "44301", totalAssets: "110716", totalLiabilities: "42781", totalEquity: "67935", operatingCashFlow: "27021", investingCashFlow: "-15783", financingCashFlow: "-8762", freeCashFlow: "27021", sga: "2654", researchDevelopment: "8675", operatingExpenses: "11329", operatingIncome: "32972", netIncome: "29760", ebitda: "34480" },
        { period: "2022", revenue: "26974", revenueGrowth: "0.22", costOfRevenue: "11618", grossProfit: "15356", totalAssets: "44187", totalLiabilities: "15892", totalEquity: "28295", operatingCashFlow: "3808", investingCashFlow: "-7225", financingCashFlow: "-10413", freeCashFlow: "3808", sga: "2440", researchDevelopment: "7339", operatingExpenses: "9779", operatingIncome: "5577", netIncome: "4368", ebitda: "7121" },
        { period: "2021", revenue: "26914", revenueGrowth: "61.40", costOfRevenue: "9439", grossProfit: "17475", totalAssets: "44187", totalLiabilities: "15892", totalEquity: "28295", operatingCashFlow: "8132", investingCashFlow: "-4485", financingCashFlow: "-3128", freeCashFlow: "8132", sga: "2166", researchDevelopment: "5268", operatingExpenses: "7434", operatingIncome: "10041", netIncome: "9752", ebitda: "11215" },
        { period: "2020", revenue: "16675", revenueGrowth: "52.73", costOfRevenue: "6118", grossProfit: "10557", totalAssets: "28791", totalLiabilities: "10418", totalEquity: "18373", operatingCashFlow: "4694", investingCashFlow: "-3892", financingCashFlow: "-2654", freeCashFlow: "4694", sga: "1912", researchDevelopment: "3924", operatingExpenses: "5836", operatingIncome: "4721", netIncome: "4332", ebitda: "5819" },
        { period: "2019", revenue: "10918", revenueGrowth: "-6.81", costOfRevenue: "4150", grossProfit: "6768", totalAssets: "17315", totalLiabilities: "6232", totalEquity: "11083", operatingCashFlow: "4272", investingCashFlow: "-2987", financingCashFlow: "-1876", freeCashFlow: "4272", sga: "1093", researchDevelopment: "2829", operatingExpenses: "3922", operatingIncome: "2846", netIncome: "2796", ebitda: "3227" }
      ]
    };

    // Filter data based on the selected time range
    const filteredData = data.annual
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Selected Metrics</h2>
            <Select value={chartType} onValueChange={(value: "bar" | "line") => setChartType(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <MetricChart 
            data={getMetricData(selectedMetrics)}
            metrics={selectedMetrics.map(getMetricLabel)}
            chartType={chartType}
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
                />
              </div>
            </TabsContent>
            <TabsContent value="balance">
              <div className="space-y-6">
                <BalanceSheet 
                  timeFrame={timeFrame} 
                  selectedMetrics={selectedMetrics}
                  onMetricsChange={setSelectedMetrics}
                />
              </div>
            </TabsContent>
            <TabsContent value="cashflow">
              <div className="space-y-6">
                <CashFlow 
                  timeFrame={timeFrame}
                  selectedMetrics={selectedMetrics}
                  onMetricsChange={setSelectedMetrics}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};