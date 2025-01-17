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
  const { data: financialData, isLoading, error } = useQuery({
    queryKey: ['income-statement', ticker, timeFrame],
    queryFn: () => fetchFinancialData('income-statement', ticker, timeFrame === 'quarterly' ? 'quarter' : 'annual'),
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
  const regularData = financialData
    .filter((item: any) => item.period !== "TTM")
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, timeFrame === 'quarterly' ? 20 : 10);

  const combinedData = ttmData ? [ttmData, ...regularData] : regularData;

  const getFiscalQuarter = (date: string) => {
    const month = new Date(date).getMonth();
    // Apple's fiscal quarters:
    // Q1: Oct-Dec (months 9-11)
    // Q2: Jan-Mar (months 0-2)
    // Q3: Apr-Jun (months 3-5)
    // Q4: Jul-Sep (months 6-8)
    if (month >= 9) return 1;
    if (month >= 6) return 4;
    if (month >= 3) return 3;
    return 2;
  };

  const getFiscalYear = (date: string) => {
    const dateObj = new Date(date);
    const month = dateObj.getMonth();
    const year = dateObj.getFullYear();
    // If the month is October or later (fiscal Q1), it's part of the next fiscal year
    return month >= 9 ? year + 1 : year;
  };

  const periods = combinedData.map((item: any) => {
    if (item.period === "TTM") return "TTM";
    if (timeFrame === 'quarterly') {
      const fiscalQuarter = getFiscalQuarter(item.date);
      const fiscalYear = getFiscalYear(item.date);
      return `Q${fiscalQuarter} ${fiscalYear}`;
    }
    return getFiscalYear(item.date).toString();
  });

  return (
    <div className="space-y-6">
      <FinancialDataTable
        combinedData={combinedData}
        periods={periods}
        selectedMetrics={selectedMetrics}
        onMetricToggle={handleMetricToggle}
        annualData={regularData}
      />
    </div>
  );
};