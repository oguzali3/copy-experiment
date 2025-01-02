import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { IncomeStatementLoading } from "./IncomeStatementLoading";
import { IncomeStatementError } from "./IncomeStatementError";
import { FinancialDataTable } from "./FinancialDataTable";

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
    return <IncomeStatementLoading />;
  }

  if (error) {
    return <IncomeStatementError error={error as Error} />;
  }

  if (!financialData || !Array.isArray(financialData) || financialData.length === 0) {
    return <IncomeStatementError ticker={ticker} />;
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

  const metrics = selectedMetrics.map(metricId => ({
    id: metricId,
    label: metricId,
    type: "value"
  }));

  return (
    <div className="space-y-6">
      <FinancialDataTable
        data={combinedData}
        metrics={metrics}
        timePeriods={periods}
      />
    </div>
  );
};