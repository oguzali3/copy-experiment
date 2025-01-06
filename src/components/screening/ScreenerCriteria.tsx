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

const FINANCIAL_METRICS = [
  { id: 'marketCap', name: 'Market Cap', description: 'Total market value of company shares', category: 'Valuation' },
  { id: 'price', name: 'Stock Price', description: 'Current stock price', category: 'Price' },
  { id: 'beta', name: 'Beta', description: 'Stock volatility relative to market', category: 'Risk' },
  { id: 'volume', name: 'Volume', description: 'Trading volume', category: 'Trading' },
  { id: 'dividend', name: 'Dividend Yield', description: 'Annual dividend yield percentage', category: 'Income' },
  { id: 'sector', name: 'Sector', description: 'Company sector classification', category: 'Classification' },
  { id: 'industry', name: 'Industry', description: 'Specific industry within sector', category: 'Classification' },
  { id: 'isEtf', name: 'ETF', description: 'Exchange Traded Fund', category: 'Type' },
  { id: 'isFund', name: 'Mutual Fund', description: 'Mutual Fund', category: 'Type' },
  { id: 'isActivelyTrading', name: 'Actively Trading', description: 'Currently actively trading', category: 'Status' }
];

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
        availableMetrics={FINANCIAL_METRICS}
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