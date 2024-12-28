import { Card } from "@/components/ui/card";
import { MetricChart } from "./MetricChart";

interface MetricsChartSectionProps {
  selectedMetrics: string[];
  data: any[];
  ticker: string;
  metricTypes: Record<string, 'bar' | 'line'>;
  onMetricTypeChange: (metric: string, type: 'bar' | 'line') => void;
  getMetricLabel: (metricId: string) => string;
}

export const MetricsChartSection = ({
  selectedMetrics,
  data,
  ticker,
  metricTypes,
  onMetricTypeChange,
  getMetricLabel
}: MetricsChartSectionProps) => {
  if (selectedMetrics.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Selected Metrics</h2>
      </div>
      <MetricChart 
        data={data}
        metrics={selectedMetrics.map(getMetricLabel)}
        ticker={ticker}
        metricTypes={metricTypes}
        onMetricTypeChange={onMetricTypeChange}
      />
    </Card>
  );
};