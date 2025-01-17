import { BalanceSheetLoading } from "./BalanceSheetLoading";
import { BalanceSheetError } from "./BalanceSheetError";
import { BalanceSheetTable } from "./BalanceSheetTable";
import { useBalanceSheetData } from "@/hooks/useBalanceSheetData";

interface BalanceSheetProps {
  timeFrame: "annual" | "quarterly" | "ttm";
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
  ticker: string;
}

export const BalanceSheet = ({ 
  timeFrame,
  selectedMetrics, 
  onMetricsChange,
  ticker 
}: BalanceSheetProps) => {
  const period = timeFrame === 'quarterly' ? 'quarter' : 'annual';
  const { filteredData, isLoading, error } = useBalanceSheetData(ticker, period);

  if (isLoading) {
    return <BalanceSheetLoading />;
  }

  if (error || !filteredData) {
    return <BalanceSheetError error={error as Error} ticker={ticker} />;
  }

  return (
    <div className="space-y-6">
      <BalanceSheetTable 
        filteredData={filteredData}
        selectedMetrics={selectedMetrics}
        onMetricsChange={onMetricsChange}
        timeFrame={timeFrame}
      />
    </div>
  );
};