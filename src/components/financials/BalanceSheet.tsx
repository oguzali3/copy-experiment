import { BalanceSheetLoading } from "./BalanceSheetLoading";
import { BalanceSheetError } from "./BalanceSheetError";
import { BalanceSheetTable } from "./BalanceSheetTable";
import { useBalanceSheetData } from "@/hooks/useBalanceSheetData";
import { MetricsChartSection } from "./MetricsChartSection";
import { useMetrics } from "@/hooks/useMetrics";

interface BalanceSheetProps {
  timeFrame: "annual" | "quarterly" | "ttm";
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
  ticker: string;
}

export const BalanceSheet = ({ 
  selectedMetrics, 
  onMetricsChange,
  ticker 
}: BalanceSheetProps) => {
  const { filteredData, isLoading, error } = useBalanceSheetData(ticker);
  const {
    metricTypes,
    handleMetricTypeChange,
  } = useMetrics(ticker);

  if (isLoading) {
    return <BalanceSheetLoading />;
  }

  if (error || !filteredData) {
    return <BalanceSheetError error={error as Error} ticker={ticker} />;
  }

  // Transform data for the chart
  const chartData = filteredData.map(item => {
    const dataPoint: Record<string, any> = {
      period: item.date ? new Date(item.date).getFullYear().toString() : 'TTM'
    };

    selectedMetrics.forEach(metric => {
      const value = parseFloat(item[metric]?.toString().replace(/[^0-9.-]/g, '') || '0');
      dataPoint[metric] = isNaN(value) ? 0 : value;
    });

    return dataPoint;
  });

  return (
    <div className="space-y-6">
      {selectedMetrics.length > 0 && (
        <MetricsChartSection 
          selectedMetrics={selectedMetrics}
          data={chartData}
          ticker={ticker}
          metricTypes={metricTypes}
          onMetricTypeChange={handleMetricTypeChange}
        />
      )}
      <BalanceSheetTable 
        filteredData={filteredData}
        selectedMetrics={selectedMetrics}
        onMetricsChange={onMetricsChange}
      />
    </div>
  );
};