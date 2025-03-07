import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { KeyMetricsTable } from "./KeyMetricsTable";

interface KeyMetricsProps {
  timeFrame: "annual" | "quarterly" | "ttm";
  ticker: string;
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
}

export const KeyMetrics = ({ 
  timeFrame,
  ticker,
  selectedMetrics,
  onMetricsChange
}: KeyMetricsProps) => {
  const period = timeFrame === 'quarterly' ? 'quarter' : 'annual';
  
  const { data: keyMetrics, isLoading, error } = useQuery({
    queryKey: ['key-metrics', ticker, period],
    queryFn: async () => {
      const data = await fetchFinancialData('key-metrics', ticker, period);
      console.log('Key Metrics API Response:', data);
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
          Error loading key metrics data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!keyMetrics || !Array.isArray(keyMetrics) || keyMetrics.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No key metrics data available for {ticker}.
        </AlertDescription>
      </Alert>
    );
  }

  // Sort data by date in descending order and limit to appropriate number of items
  const sortedData = [...keyMetrics]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, period === 'quarter' ? 20 : 10);

  return (
    <div className="space-y-6">
      <KeyMetricsTable 
        data={sortedData}
        ticker={ticker}
        selectedMetrics={selectedMetrics}
        onMetricToggle={handleMetricToggle}
        timeFrame={timeFrame}
      />
    </div>
  );
};