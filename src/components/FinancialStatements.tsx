import { useState } from "react";
import { Card } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { IncomeStatement } from "./financials/IncomeStatement";
import { BalanceSheet } from "./financials/BalanceSheet";
import { CashFlow } from "./financials/CashFlow";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

export const FinancialStatements = ({ ticker }: { ticker: string }) => {
  const [timeFrame, setTimeFrame] = useState<"annual" | "quarterly" | "ttm">("annual");

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
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
    </Card>
  );
};