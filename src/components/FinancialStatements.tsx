import { useState } from "react";
import { Card } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { IncomeStatement } from "./financials/IncomeStatement";
import { BalanceSheet } from "./financials/BalanceSheet";
import { CashFlow } from "./financials/CashFlow";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { TimeRangePanel } from "./financials/TimeRangePanel";

export const FinancialStatements = ({ ticker }: { ticker: string }) => {
  const [timeFrame, setTimeFrame] = useState<"annual" | "quarterly" | "ttm">("annual");
  const [startDate, setStartDate] = useState("June 30, 2015");
  const [endDate, setEndDate] = useState("September 30, 2024");
  const [sliderValue, setSliderValue] = useState([0, 11]);

  // Define the available time periods
  const timePeriods = [
    "Jun '15",
    "Jun '16",
    "Jun '17",
    "Jun '18",
    "Jun '19",
    "Jun '20",
    "Jun '21",
    "Jun '22",
    "Jun '23",
    "LTM",
    "Jun '24",
    "Jun '26(E)",
  ];

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    setStartDate(`June 30, 20${15 + value[0]}`);
    setEndDate(value[1] === 11 ? "June 30, 2026" : `June 30, 20${15 + value[1]}`);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <Tabs defaultValue="income" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="income">Income Statement</TabsTrigger>
            <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          </TabsList>
          <TabsContent value="income">
            <div className="space-y-6">
              <IncomeStatement timeFrame={timeFrame} />
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

        <TimeRangePanel
          startDate={startDate}
          endDate={endDate}
          sliderValue={sliderValue}
          onSliderChange={handleSliderChange}
          timePeriods={timePeriods}
        />

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
      </div>
    </Card>
  );
};