import React from 'react';
import { ChartLegendItem } from './ChartLegendItem';
import { getMetricColor, getMetricDisplayName } from './chartUtils';

interface ChartLegendProps {
  metrics: string[];
  ticker: string;
  cagrResults: Record<string, number>;
  totalChangeResults: Record<string, number>;
}

export const ChartLegend = ({ 
  metrics, 
  ticker, 
  cagrResults, 
  totalChangeResults 
}: ChartLegendProps) => {
  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex flex-col gap-2">
        {metrics.map((metric, index) => (
          <ChartLegendItem
            key={metric}
            color={getMetricColor(index)}
            ticker={ticker}
            metricName={getMetricDisplayName(metric)}
            totalChange={totalChangeResults[metric]}
            cagr={cagrResults[metric]}
          />
        ))}
      </div>
    </div>
  );
};