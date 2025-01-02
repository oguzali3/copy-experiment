import { BalanceSheetLoading } from "./BalanceSheetLoading";
import { BalanceSheetError } from "./BalanceSheetError";
import { BalanceSheetTable } from "./BalanceSheetTable";
import { useBalanceSheetData } from "@/hooks/useBalanceSheetData";
import { MetricsChartSection } from "./MetricsChartSection";
import { useState } from "react";

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
  const [metricTypes, setMetricTypes] = useState<Record<string, 'bar' | 'line'>>({});

  const handleMetricTypeChange = (metric: string, type: 'bar' | 'line') => {
    setMetricTypes(prev => ({
      ...prev,
      [metric]: type
    }));
  };

  // Initialize chart type for new metrics
  React.useEffect(() => {
    const newMetricTypes = { ...metricTypes };
    selectedMetrics.forEach(metric => {
      if (!newMetricTypes[metric]) {
        // Default to bar chart for balance sheet items
        newMetricTypes[metric] = 'bar';
      }
    });
    setMetricTypes(newMetricTypes);
  }, [selectedMetrics]);

  if (isLoading) {
    return <BalanceSheetLoading />;
  }

  if (error || !filteredData) {
    return <BalanceSheetError error={error as Error} ticker={ticker} />;
  }

  // Transform data for the chart
  const chartData = filteredData.map(item => ({
    period: item.date,
    ...selectedMetrics.reduce((acc, metric) => ({
      ...acc,
      [metric]: parseFloat(item[metric]?.toString().replace(/,/g, '') || '0')
    }), {})
  }));

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