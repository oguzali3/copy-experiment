import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { FinancialRatiosTable } from "./FinancialRatiosTable";

interface FinancialRatiosProps {
  timeFrame: "annual" | "quarterly" | "ttm";
  ticker: string;
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
}

export const FinancialRatios = ({ 
  timeFrame,
  ticker,
  selectedMetrics,
  onMetricsChange
}: FinancialRatiosProps) => {
  const period = timeFrame === 'quarterly' ? 'quarter' : 'annual';
  
  const { data: financialRatios, isLoading, error } = useQuery({
    queryKey: ['financial-ratios', ticker, period],
    queryFn: async () => {
      const data = await fetchFinancialData('financial-ratios', ticker, period);
      console.log('Financial Ratios API Response:', data);
      return data;
    },
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
          Error loading financial ratios data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!financialRatios || !Array.isArray(financialRatios) || financialRatios.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No financial ratios data available for {ticker}.
        </AlertDescription>
      </Alert>
    );
  }

  // Sort data by date in descending order and limit to appropriate number of items
  const sortedData = [...financialRatios]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, period === 'quarter' ? 20 : 10);

  return (
    <div className="space-y-6">
      <FinancialRatiosTable 
        data={sortedData}
        ticker={ticker}
        selectedMetrics={selectedMetrics}
        onMetricToggle={handleMetricToggle}
        timeFrame={timeFrame}
      />
    </div>
  );
};