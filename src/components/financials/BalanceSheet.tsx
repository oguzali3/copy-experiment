import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { Checkbox } from "@/components/ui/checkbox";
import { BalanceSheetLoading } from "./BalanceSheetLoading";
import { BalanceSheetError } from "./BalanceSheetError";
import { BalanceSheetHeader } from "./BalanceSheetHeader";
import { formatValue, parseNumber, metrics } from "./BalanceSheetUtils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface BalanceSheetProps {
  timeFrame: "annual" | "quarterly" | "ttm";
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
  ticker: string;
}

export const BalanceSheet = ({ 
  selectedMetrics, 
  onMetricsChange,
  ticker 
}: BalanceSheetProps) => {
  // Fetch balance sheet data
  const { data: balanceSheetData, isLoading: isBalanceSheetLoading, error: balanceSheetError } = useQuery({
    queryKey: ['balance-sheet', ticker],
    queryFn: () => fetchFinancialData('balance-sheet', ticker),
    enabled: !!ticker,
  });

  // Fetch income statement data for shares outstanding
  const { data: incomeStatementData, isLoading: isIncomeStatementLoading } = useQuery({
    queryKey: ['income-statement', ticker],
    queryFn: () => fetchFinancialData('income-statement', ticker),
    enabled: !!ticker,
  });

  const handleMetricToggle = (metricId: string) => {
    const newMetrics = selectedMetrics.includes(metricId)
      ? selectedMetrics.filter(id => id !== metricId)
      : [...selectedMetrics, metricId];
    onMetricsChange(newMetrics);
  };

  const isLoading = isBalanceSheetLoading || isIncomeStatementLoading;

  if (isLoading) {
    return <BalanceSheetLoading />;
  }

  if (balanceSheetError || !balanceSheetData || !Array.isArray(balanceSheetData) || balanceSheetData.length === 0) {
    return <BalanceSheetError error={balanceSheetError as Error} ticker={ticker} />;
  }

  // Get TTM data first
  const ttmBalanceSheet = balanceSheetData.find((item: any) => item.period === 'TTM');
  const ttmIncomeStatement = incomeStatementData?.find((item: any) => item.period === 'TTM');
  
  // Get annual data sorted by date
  const annualBalanceSheet = balanceSheetData
    .filter((item: any) => item.period === 'FY')
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Get corresponding income statement data
  const annualIncomeStatement = incomeStatementData
    ?.filter((item: any) => item.period === 'FY')
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Combine balance sheet and income statement data by date
  const combinedData = annualBalanceSheet.map((balanceSheet: any) => {
    const matchingIncomeStatement = annualIncomeStatement?.find(
      (income: any) => new Date(income.date).getFullYear() === new Date(balanceSheet.date).getFullYear()
    );
    return {
      ...balanceSheet,
      weightedAverageShsOutDil: matchingIncomeStatement?.weightedAverageShsOutDil
    };
  });

  // Add TTM data if available
  const filteredData = ttmBalanceSheet 
    ? [{ 
        ...ttmBalanceSheet, 
        weightedAverageShsOutDil: ttmIncomeStatement?.weightedAverageShsOutDil 
      }, 
      ...combinedData
    ] 
    : combinedData;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border">
        <ScrollArea className="w-full rounded-md">
          <div className="max-w-full overflow-auto">
            <Table>
              <BalanceSheetHeader filteredData={filteredData} />
              <TableBody>
                {metrics.map((metric) => (
                  <TableRow key={metric.id}>
                    <TableCell className="w-[50px] sticky left-0 z-20 bg-white pr-0">
                      <Checkbox
                        id={`checkbox-${metric.id}`}
                        checked={selectedMetrics.includes(metric.id)}
                        onCheckedChange={() => handleMetricToggle(metric.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium sticky left-[50px] z-20 bg-gray-50">
                      {metric.label}
                    </TableCell>
                    {filteredData.map((row: any) => (
                      <TableCell key={`${row.date}-${metric.id}`} className="text-right">
                        {metric.type === "calculated" 
                          ? formatValue(metric.calculate(row))
                          : formatValue(parseNumber(row[metric.id]))}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};