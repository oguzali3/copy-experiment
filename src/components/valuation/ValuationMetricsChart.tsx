import { Button } from "@/components/ui/button";
import { MetricChart } from "../financials/MetricChart";

interface ValuationMetricsChartProps {
  selectedMetrics: string[];
  timeframe: string;
  setTimeframe: (period: string) => void;
  mockChartData: any[];
  metricTypes: Record<string, 'bar' | 'line'>;
  handleMetricTypeChange: (metric: string, type: 'bar' | 'line') => void;
}

export const ValuationMetricsChart = ({
  selectedMetrics,
  timeframe,
  setTimeframe,
  mockChartData,
  metricTypes,
  handleMetricTypeChange
}: ValuationMetricsChartProps) => {
  if (selectedMetrics.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["1M", "3M", "6M", "1Y", "2Y", "5Y"].map((period) => (
          <Button
            key={period}
            variant={timeframe === period ? "default" : "outline"}
            onClick={() => setTimeframe(period)}
            size="sm"
          >
            {period}
          </Button>
        ))}
      </div>
      <MetricChart
        data={mockChartData}
        metrics={selectedMetrics}
        metricTypes={metricTypes}
        onMetricTypeChange={handleMetricTypeChange}
      />
    </div>
  );
};