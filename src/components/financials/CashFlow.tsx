import { useCashFlowData } from "@/hooks/useCashFlowData";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { CashFlowTable } from "./CashFlowTable";

interface CashFlowProps {
  timeFrame: "annual" | "quarterly" | "ttm";
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
  ticker: string;
}

export const CashFlow = ({ 
  timeFrame,
  selectedMetrics, 
  onMetricsChange,
  ticker 
}: CashFlowProps) => {
  const period = timeFrame === 'quarterly' ? 'quarter' : 'annual';
  const { cashFlowData, isLoading, error } = useCashFlowData(ticker, period);

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

  if (error || !cashFlowData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error ? "Error loading cash flow data. Please try again later." : `No cash flow data available for ${ticker}.`}
        </AlertDescription>
      </Alert>
    );
  }

  // Sort data by date in descending order and limit to 20 items if quarterly
  const sortedData = [...cashFlowData]
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, period === 'quarter' ? 20 : 10);

  return (
    <div className="space-y-6">
      <CashFlowTable 
        data={sortedData}
        selectedMetrics={selectedMetrics}
        onMetricsChange={onMetricsChange}
        timeFrame={timeFrame}
      />
    </div>
  );
};