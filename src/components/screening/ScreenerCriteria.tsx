import React from "react";
import { Card } from "@/components/ui/card";
import { ScreeningSearch } from "./ScreeningSearch";
import { MetricInput } from "./MetricInput";
import { ScreeningMetric } from "@/types/screening";

interface ScreenerCriteriaProps {
  selectedMetrics: ScreeningMetric[];
  onMetricAdd: (metric: ScreeningMetric) => void;
  onMetricRemove: (metricId: string) => void;
  onMetricRangeChange: (metricId: string, min: string, max: string) => void;
}

export const ScreenerCriteria = ({
  selectedMetrics,
  onMetricAdd,
  onMetricRemove,
  onMetricRangeChange,
}: ScreenerCriteriaProps) => {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Screener Criteria</h2>
      <ScreeningSearch
        type="metrics"
        onMetricSelect={onMetricAdd}
      />
      {selectedMetrics.length > 0 && (
        <div className="mt-4 space-y-4">
          {selectedMetrics.map(metric => (
            <MetricInput
              key={metric.id}
              metric={metric}
              onRemove={onMetricRemove}
              onChange={onMetricRangeChange}
            />
          ))}
        </div>
      )}
    </Card>
  );
};