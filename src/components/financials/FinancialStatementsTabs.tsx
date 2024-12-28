import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { IncomeStatement } from "./IncomeStatement";
import { BalanceSheet } from "./BalanceSheet";
import { CashFlow } from "./CashFlow";

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
    </Tabs>
  );
};