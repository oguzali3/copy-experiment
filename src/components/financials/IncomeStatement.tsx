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

  const getQuarterFromDate = (date: string) => {
    const dateObj = new Date(date);
    const month = dateObj.getMonth();
    const year = dateObj.getFullYear();
    const quarter = Math.floor(month / 3) + 1;
    
    // Log the date parsing for debugging
    console.log('Parsing date:', {
      originalDate: date,
      parsedDate: dateObj,
      month,
      year,
      quarter,
      ticker
    });

    // For NVDA specifically, ensure we're not showing future quarters
    if (ticker === 'NVDA') {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;
      
      // If the parsed date is in the future relative to current date
      if (year > currentYear || (year === currentYear && quarter > currentQuarter)) {
        console.log('Adjusting future quarter for NVDA:', {
          from: `Q${quarter} ${year}`,
          to: `Q${currentQuarter} ${currentYear}`
        });
        return `Q${currentQuarter} ${currentYear}`;
      }
    }
    
    return `Q${quarter} ${year}`;
  };

  const periods = combinedData.map((item: any) => {
    if (item.period === "TTM") return "TTM";
    if (timeFrame === 'quarterly') {
      // Log the raw date before processing
      console.log('Processing item date:', item.date);
      return getQuarterFromDate(item.date);
    }
    return new Date(item.date).getFullYear().toString();
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