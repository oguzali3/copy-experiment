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

export const FinancialStatements = ({ ticker }: { ticker: string }) => {
  const [timeFrame, setTimeFrame] = useState<"annual" | "quarterly" | "ttm">("annual");
  const [startDate, setStartDate] = useState("December 31, 2019");
  const [endDate, setEndDate] = useState("December 31, 2023");
  const [sliderValue, setSliderValue] = useState([0, 4]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  // Define the available time periods
  const timePeriods = [
    "2019", "2020", "2021", "2022", "2023"
  ];

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    setStartDate(`December 31, 20${19 + value[0]}`);
    setEndDate(`December 31, 20${19 + value[1]}`);
  };

  // Sample data for metrics (this would normally come from your data source)
  const getMetricData = (metricId: string) => {
    const data = {
      annual: [
        { period: "2023", revenue: "60922", revenueGrowth: "125.85", costOfRevenue: "16621", grossProfit: "44301" },
        { period: "2022", revenue: "26974", revenueGrowth: "0.22", costOfRevenue: "11618", grossProfit: "15356" },
        { period: "2021", revenue: "26914", revenueGrowth: "61.40", costOfRevenue: "9439", grossProfit: "17475" },
        { period: "2020", revenue: "16675", revenueGrowth: "52.73", costOfRevenue: "6118", grossProfit: "10557" },
        { period: "2019", revenue: "10918", revenueGrowth: "-6.81", costOfRevenue: "4150", grossProfit: "6768" }
      ]
    };

    return data.annual.map(item => ({
      period: item.period,
      value: parseFloat(item[metricId as keyof typeof item].replace(/,/g, '')),
    }));
  };

  // Get metric label
  const getMetricLabel = (metricId: string): string => {
    const metrics = {
      revenue: "Revenue",
      revenueGrowth: "Revenue Growth",
      costOfRevenue: "Cost of Revenue",
      grossProfit: "Gross Profit"
    };
    return metrics[metricId as keyof typeof metrics] || metricId;
  };

  return (
    <div className="space-y-6">
      {selectedMetrics.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Selected Metrics</h2>
          <div className="space-y-4">
            {selectedMetrics.map(metricId => (
              <MetricChart 
                key={metricId}
                data={getMetricData(metricId)}
                metric={getMetricLabel(metricId)}
              />
            ))}
          </div>
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
                <BalanceSheet timeFrame={timeFrame} />
              </div>
            </TabsContent>
            <TabsContent value="cashflow">
              <div className="space-y-6">
                <CashFlow timeFrame={timeFrame} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};