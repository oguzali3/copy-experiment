import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IncomeStatement } from "@/components/financials/IncomeStatement";
import { BalanceSheet } from "@/components/financials/BalanceSheet";
import { CashFlow } from "@/components/financials/CashFlow";
import { TimeRangePanel } from "@/components/financials/TimeRangePanel";
import { fetchFinancialData } from "@/utils/financialApi";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface FinancialStatementsProps {
  ticker: string;
}

export const FinancialStatements = ({ ticker }: FinancialStatementsProps) => {
  const [timeRange, setTimeRange] = useState("annual");
  const [selectedTab, setSelectedTab] = useState("income");

  const { data: incomeData, isLoading: incomeLoading, error: incomeError } = useQuery({
    queryKey: ['income-statement', ticker],
    queryFn: () => fetchFinancialData('income-statement', ticker),
    enabled: selectedTab === 'income'
  });

  const { data: balanceData, isLoading: balanceLoading, error: balanceError } = useQuery({
    queryKey: ['balance-sheet', ticker],
    queryFn: () => fetchFinancialData('balance-sheet', ticker),
    enabled: selectedTab === 'balance'
  });

  const { data: cashFlowData, isLoading: cashFlowLoading, error: cashFlowError } = useQuery({
    queryKey: ['cash-flow', ticker],
    queryFn: () => fetchFinancialData('cash-flow', ticker),
    enabled: selectedTab === 'cashflow'
  });

  const renderContent = () => {
    if (selectedTab === 'income' && incomeError) {
      return (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load income statement data. Please try again later.
          </AlertDescription>
        </Alert>
      );
    }

    if (selectedTab === 'balance' && balanceError) {
      return (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load balance sheet data. Please try again later.
          </AlertDescription>
        </Alert>
      );
    }

    if (selectedTab === 'cashflow' && cashFlowError) {
      return (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load cash flow data. Please try again later.
          </AlertDescription>
        </Alert>
      );
    }

    if ((selectedTab === 'income' && incomeLoading) || 
        (selectedTab === 'balance' && balanceLoading) || 
        (selectedTab === 'cashflow' && cashFlowLoading)) {
      return (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      );
    }

    switch (selectedTab) {
      case "income":
        return <IncomeStatement data={incomeData} timeRange={timeRange} />;
      case "balance":
        return <BalanceSheet data={balanceData} timeRange={timeRange} />;
      case "cashflow":
        return <CashFlow data={cashFlowData} timeRange={timeRange} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <TimeRangePanel timeRange={timeRange} onTimeRangeChange={setTimeRange} />
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="income">Income Statement</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
        </TabsList>
        <TabsContent value={selectedTab} className="mt-6">
          {renderContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
};