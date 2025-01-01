import { useState } from "react";
import { ValuationMetricsChart } from "./ValuationMetricsChart";
import { ValuationMetricsTable } from "./ValuationMetricsTable";
import { mockValuationMetrics, mockChartData } from "./types";

export const ValuationMetrics = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [timeframe, setTimeframe] = useState("quarterly");
  const [metricTypes, setMetricTypes] = useState<Record<string, 'bar' | 'line'>>({});

  const handleMetricSelect = (metricName: string) => {
    if (selectedMetrics.includes(metricName)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== metricName));
      const newMetricTypes = { ...metricTypes };
      delete newMetricTypes[metricName];
      setMetricTypes(newMetricTypes);
    } else {
      setSelectedMetrics([...selectedMetrics, metricName]);
      setMetricTypes(prev => ({
        ...prev,
        [metricName]: metricName.toLowerCase().includes('margin') ? 'line' : 'bar'
      }));
    }
  };

  const handleMetricTypeChange = (metric: string, type: 'bar' | 'line') => {
    setMetricTypes(prev => ({
      ...prev,
      [metric]: type
    }));
  };

  return (
    <div className="space-y-6">
      <ValuationMetricsChart
        selectedMetrics={selectedMetrics}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        mockChartData={mockChartData}
        metricTypes={metricTypes}
        handleMetricTypeChange={handleMetricTypeChange}
      />
      <ValuationMetricsTable
        metrics={mockValuationMetrics}
        selectedMetrics={selectedMetrics}
        handleMetricSelect={handleMetricSelect}
      />
    </div>
  );
};