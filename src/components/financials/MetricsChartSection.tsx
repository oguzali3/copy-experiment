import { Card } from "@/components/ui/card";
import { MetricChart } from "./MetricChart";

interface MetricsChartSectionProps {
  selectedMetrics: string[];
  data: any[];
  ticker: string;
  metricTypes: Record<string, 'bar' | 'line'>;
  onMetricTypeChange: (metric: string, type: 'bar' | 'line') => void;
}

export const MetricsChartSection = ({
  selectedMetrics,
  data,
  ticker,
  metricTypes,
  onMetricTypeChange,
}: MetricsChartSectionProps) => {
  if (selectedMetrics.length === 0) {
    return null;
  }

  console.log('MetricsChartSection data:', data);

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Selected Metrics</h2>
      </div>
      <MetricChart 
        data={data}
        metrics={selectedMetrics}
        ticker={ticker}
        metricTypes={metricTypes}
        onMetricTypeChange={onMetricTypeChange}
      />
    </Card>
  );
};