import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScreeningSearch } from "./ScreeningSearch";
import { MetricInput } from "./MetricInput";
import { ScreeningMetric } from "@/types/screening";
import { Lightbulb } from "lucide-react";

interface ScreenerCriteriaProps {
  selectedMetrics: ScreeningMetric[];
  onMetricAdd: (metric: ScreeningMetric) => void;
  onMetricRemove: (metricId: string) => void;
  onMetricRangeChange: (metricId: string, min: string, max: string) => void;
}

const EXAMPLE_METRICS = [
  {
    name: "High Growth Companies",
    metrics: [
      { id: "revenueGrowth", name: "Revenue Growth (%)", min: "20", max: "", category: "growth" },
      { id: "operatingMargin", name: "Operating Margin (%)", min: "15", max: "", category: "profitability" },
      { id: "marketCap", name: "Market Cap ($M)", min: "1000", max: "", category: "valuation" }
    ]
  },
  {
    name: "Value Stocks",
    metrics: [
      { id: "peRatio", name: "P/E Ratio", min: "", max: "15", category: "valuation" },
      { id: "dividendYield", name: "Dividend Yield (%)", min: "3", max: "", category: "dividend" },
      { id: "priceToBook", name: "Price to Book", min: "", max: "2", category: "valuation" }
    ]
  },
  {
    name: "Quality Companies",
    metrics: [
      { id: "roe", name: "Return on Equity (%)", min: "15", max: "", category: "profitability" },
      { id: "currentRatio", name: "Current Ratio", min: "1.5", max: "", category: "liquidity" },
      { id: "debtToEquity", name: "Debt to Equity", min: "", max: "1", category: "leverage" }
    ]
  }
];

export const ScreenerCriteria = ({
  selectedMetrics,
  onMetricAdd,
  onMetricRemove,
  onMetricRangeChange,
}: ScreenerCriteriaProps) => {
  const handleExampleClick = (metrics: ScreeningMetric[]) => {
    // Clear existing metrics
    selectedMetrics.forEach(metric => onMetricRemove(metric.id));
    // Add new metrics
    metrics.forEach(metric => onMetricAdd(metric));
  };

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
      
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          <h3 className="text-sm font-medium">Example Screens</h3>
        </div>
        <div className="grid gap-2">
          {EXAMPLE_METRICS.map((example) => (
            <Button
              key={example.name}
              variant="outline"
              className="justify-start text-left"
              onClick={() => handleExampleClick(example.metrics)}
            >
              {example.name}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};