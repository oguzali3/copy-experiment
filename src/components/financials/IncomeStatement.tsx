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

  const getFiscalQuarterAndYear = (date: string, companyTicker: string) => {
    const dateObj = new Date(date);
    const month = dateObj.getMonth();
    const year = dateObj.getFullYear();

    // Define fiscal year ends for different companies
    const fiscalYearEnds: { [key: string]: number } = {
      'AAPL': 8,  // September
      'NVDA': 0,  // January
      'MSFT': 5,  // June
      'ORCL': 4,  // May
      'ADBE': 11, // December
      // Add more companies as needed
    };

    // Default to December fiscal year end if company not found
    const fiscalYearEnd = fiscalYearEnds[companyTicker] ?? 11;
    
    // Calculate fiscal year
    const fiscalYear = month > fiscalYearEnd ? year + 1 : year;

    // Calculate fiscal quarter
    let fiscalQuarter;
    const monthsAfterFiscalYearEnd = (month - fiscalYearEnd + 12) % 12;
    
    if (monthsAfterFiscalYearEnd < 3) {
      fiscalQuarter = 1;
    } else if (monthsAfterFiscalYearEnd < 6) {
      fiscalQuarter = 2;
    } else if (monthsAfterFiscalYearEnd < 9) {
      fiscalQuarter = 3;
    } else {
      fiscalQuarter = 4;
    }

    return { fiscalQuarter, fiscalYear };
  };

  const periods = combinedData.map((item: any) => {
    if (item.period === "TTM") return "TTM";
    if (timeFrame === 'quarterly') {
      const { fiscalQuarter, fiscalYear } = getFiscalQuarterAndYear(item.date, ticker);
      return `Q${fiscalQuarter} ${fiscalYear}`;
    }
    const { fiscalYear } = getFiscalQuarterAndYear(item.date, ticker);
    return fiscalYear.toString();
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