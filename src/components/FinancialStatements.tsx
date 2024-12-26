import { useState } from "react";
import { Card } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { IncomeStatement } from "./financials/IncomeStatement";
import { BalanceSheet } from "./financials/BalanceSheet";
import { CashFlow } from "./financials/CashFlow";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { MetricsSearch } from "./MetricsSearch";
import { Button } from "./ui/button";
import { RefreshCcw, RotateCcw } from "lucide-react";
import { Slider } from "./ui/slider";

export const FinancialStatements = ({ ticker }: { ticker: string }) => {
  const [timeFrame, setTimeFrame] = useState<"annual" | "quarterly" | "ttm">("annual");
  const [startDate, setStartDate] = useState("June 30, 2015");
  const [endDate, setEndDate] = useState("September 30, 2024");
  const [sliderValue, setSliderValue] = useState([0, 100]);

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    // Here you would typically calculate the actual dates based on the slider values
    // and update startDate and endDate accordingly
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Time Range Panel */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="bg-gray-100 px-3 py-1.5 rounded-md text-sm flex items-center gap-2">
              {startDate}
              <button className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="bg-gray-100 px-3 py-1.5 rounded-md text-sm flex items-center gap-2">
              {endDate}
              <button className="text-gray-400 hover:text-gray-600">×</button>
            </div>
          </div>

          {/* Time Range Slider */}
          <div className="px-2 py-4">
            <div className="relative">
              <Slider
                defaultValue={[0, 100]}
                max={100}
                step={1}
                value={sliderValue}
                onValueChange={handleSliderChange}
                className="w-full"
              />
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                <span>Jun '15</span>
                <span>Jun '17</span>
                <span>Jun '19</span>
                <span>Jun '21</span>
                <span>Jun '23</span>
                <span>LTM</span>
                <span>Jun '26(E)</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <MetricsSearch />
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Existing Header */}
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

        <Tabs defaultValue="income" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="income">Income Statement</TabsTrigger>
            <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          </TabsList>
          <TabsContent value="income">
            <IncomeStatement timeFrame={timeFrame} />
          </TabsContent>
          <TabsContent value="balance">
            <BalanceSheet timeFrame={timeFrame} />
          </TabsContent>
          <TabsContent value="cashflow">
            <CashFlow timeFrame={timeFrame} />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};