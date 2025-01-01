import { Table, TableBody } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { IncomeStatementHeader } from "./IncomeStatementHeader";
import { IncomeStatementMetrics } from "./IncomeStatementMetrics";
import { formatMetricLabel, parseNumber } from "./IncomeStatementUtils";
import { INCOME_STATEMENT_METRICS, calculateMetricValue, getMetricDisplayName, formatValue } from "@/utils/metricDefinitions";

interface IncomeStatementProps {
  timeFrame: "annual" | "quarterly" | "ttm";
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
  ticker: string;
}

export const IncomeStatement = ({ 
  selectedMetrics, 
  onMetricsChange, 
  ticker 
}: IncomeStatementProps) => {
  const { data: financialData, isLoading, error } = useQuery({
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading financial data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!financialData || !Array.isArray(financialData) || financialData.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No financial data available for {ticker}.
        </AlertDescription>
      </Alert>
    );
  }

  const ttmData = financialData.find((item: any) => item.period === "TTM");
  const annualData = financialData
    .filter((item: any) => item.period === "FY")
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const combinedData = ttmData ? [ttmData, ...annualData] : annualData;

  const periods = combinedData.map((item: any) => {
    if (item.period === "TTM") return "TTM";
    return new Date(item.date).getFullYear().toString();
  });

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <Table>
          <IncomeStatementHeader periods={periods} />
          <TableBody>
            {INCOME_STATEMENT_METRICS.map((metric) => {
              const values = combinedData.map((current, index) => {
                const previous = combinedData[index + 1];
                return calculateMetricValue(metric, current, previous);
              });

              return (
                <IncomeStatementMetrics
                  key={metric.id}
                  metricId={metric.id}
                  label={getMetricDisplayName(metric.id)}
                  values={values.map(v => parseNumber(v))}
                  isSelected={selectedMetrics.includes(metric.id)}
                  onToggle={handleMetricToggle}
                  formatValue={formatValue}
                  isGrowthMetric={metric.format === 'percentage'}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};