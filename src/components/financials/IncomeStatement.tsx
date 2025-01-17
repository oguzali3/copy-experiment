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
  timeFrame,
  selectedMetrics, 
  onMetricsChange, 
  ticker 
}: IncomeStatementProps) => {
  // Update period based on timeFrame
  const period = timeFrame === 'quarterly' ? 'quarter' : 'annual';

  const { data: financialData, isLoading, error } = useQuery({
    queryKey: ['income-statement', ticker, period],
    queryFn: () => fetchFinancialData('income-statement', ticker, period),
    enabled: !!ticker,
  });

  console.log('Income Statement Data:', { timeFrame, period, financialData });

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
  const periodData = financialData
    .filter((item: any) => {
      if (period === 'quarter') {
        return item.period !== "TTM";
      }
      return item.period === "FY";
    })
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, period === 'quarter' ? 20 : 10);

  const combinedData = ttmData ? [ttmData, ...periodData] : periodData;

  const periods = combinedData.map((item: any) => {
    if (item.period === "TTM") return "TTM";
    const date = new Date(item.date);
    return period === 'quarter' 
      ? `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`
      : date.getFullYear().toString();
  });

  return (
    <div className="space-y-6">
      <FinancialDataTable
        combinedData={combinedData}
        periods={periods}
        selectedMetrics={selectedMetrics}
        onMetricToggle={handleMetricToggle}
        annualData={periodData}
      />
    </div>
  );
};