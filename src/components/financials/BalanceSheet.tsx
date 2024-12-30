import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { Checkbox } from "@/components/ui/checkbox";
import { BalanceSheetLoading } from "./BalanceSheetLoading";
import { BalanceSheetError } from "./BalanceSheetError";
import { BalanceSheetHeader } from "./BalanceSheetHeader";
import { formatValue, parseNumber, metrics } from "./BalanceSheetUtils";

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
  const { data: financialData, isLoading, error } = useQuery({
    queryKey: ['balance-sheet', ticker],
    queryFn: () => fetchFinancialData('balance-sheet', ticker),
    enabled: !!ticker,
  });

  const handleMetricToggle = (metricId: string) => {
    const newMetrics = selectedMetrics.includes(metricId)
      ? selectedMetrics.filter(id => id !== metricId)
      : [...selectedMetrics, metricId];
    onMetricsChange(newMetrics);
  };

  if (isLoading) {
    return <BalanceSheetLoading />;
  }

  if (error || !financialData || !Array.isArray(financialData) || financialData.length === 0) {
    return <BalanceSheetError error={error as Error} ticker={ticker} />;
  }

  // Get TTM data first
  const ttmData = financialData.find((item: any) => item.period === 'TTM');
  
  // Get annual data sorted by date
  const annualData = financialData
    .filter((item: any) => item.period === 'FY')
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10); // Get last 10 years

  // Combine TTM with annual data
  const filteredData = ttmData ? [ttmData, ...annualData] : annualData;

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
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
                    {formatValue(parseNumber(row[metric.id]))}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};