import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { IncomeStatement } from "./IncomeStatement";
import { BalanceSheet } from "./BalanceSheet";
import { CashFlow } from "./CashFlow";
import { KeyMetrics } from "./KeyMetrics";
import { FinancialRatios } from "./FinancialRatios";

interface FinancialStatementsTabsProps {
  timeFrame: "annual" | "quarterly" | "ttm";
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
  ticker: string;
}

export const FinancialStatementsTabs = ({
  timeFrame,
  selectedMetrics,
  onMetricsChange,
  ticker
}: FinancialStatementsTabsProps) => {
  return (
    <Tabs defaultValue="income" className="w-full">
      <TabsList className="w-full justify-start mb-4 flex-wrap">
        <TabsTrigger value="income">Income Statement</TabsTrigger>
        <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
        <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
        <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
        <TabsTrigger value="ratios">Financial Ratios</TabsTrigger>
      </TabsList>
      <TabsContent value="income">
        <div className="space-y-6">
          <IncomeStatement 
            timeFrame={timeFrame} 
            selectedMetrics={selectedMetrics}
            onMetricsChange={onMetricsChange}
            ticker={ticker}
          />
        </div>
      </TabsContent>
      <TabsContent value="balance">
        <div className="space-y-6">
          <BalanceSheet 
            timeFrame={timeFrame} 
            selectedMetrics={selectedMetrics}
            onMetricsChange={onMetricsChange}
            ticker={ticker}
          />
        </div>
      </TabsContent>
      <TabsContent value="cashflow">
        <div className="space-y-6">
          <CashFlow 
            timeFrame={timeFrame}
            selectedMetrics={selectedMetrics}
            onMetricsChange={onMetricsChange}
            ticker={ticker}
          />
        </div>
      </TabsContent>
      <TabsContent value="metrics">
        <div className="space-y-6">
          <KeyMetrics 
            timeFrame={timeFrame}
            ticker={ticker}
            selectedMetrics={selectedMetrics}
            onMetricsChange={onMetricsChange}
          />
        </div>
      </TabsContent>
      <TabsContent value="ratios">
        <div className="space-y-6">
          <FinancialRatios 
            timeFrame={timeFrame}
            ticker={ticker}
            selectedMetrics={selectedMetrics}
            onMetricsChange={onMetricsChange}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};