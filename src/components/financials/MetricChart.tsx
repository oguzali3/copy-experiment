import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ChartTooltip } from './ChartTooltip';
import { ChartLegend } from './ChartLegend';
import { getMetricColor, calculateCAGR } from './chartUtils';

interface MetricChartProps {
  data: any[];
  metrics: string[];
  metricTypes: Record<string, 'bar' | 'line'>;
  ticker: string;
  onMetricTypeChange?: (metric: string, type: 'bar' | 'line') => void;
}

export const MetricChart = ({
  data,
  metrics,
  metricTypes,
  ticker,
  onMetricTypeChange,
}: MetricChartProps) => {
  const sortedData = [...data].sort((a, b) => {
    if (a.period === 'TTM') return 1;
    if (b.period === 'TTM') return -1;
    return parseInt(a.period) - parseInt(b.period);
  });

  // Calculate CAGR and total change for each metric
  const cagrResults: Record<string, number> = {};
  const totalChangeResults: Record<string, number> = {};
  metrics.forEach(metric => {
    const firstValue = sortedData[0][metric];
    const lastValue = sortedData[sortedData.length - 1][metric];
    const years = sortedData[sortedData.length - 1].period === 'TTM' 
      ? sortedData.length - 2 
      : sortedData.length - 1;
    cagrResults[metric] = calculateCAGR(firstValue, lastValue, years);
    totalChangeResults[metric] = ((lastValue - firstValue) / firstValue) * 100;
  });

  return (
    <div className="w-full">
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="period"
              tick={{ fill: '#6B7280' }}
              tickLine={{ stroke: '#6B7280' }}
            />
            <YAxis 
              tick={{ fill: '#6B7280' }}
              tickLine={{ stroke: '#6B7280' }}
              tickFormatter={(value) => {
                if (Math.abs(value) >= 1e12) {
                  return (value / 1e12).toFixed(1) + 'T';
                }
                if (Math.abs(value) >= 1e9) {
                  return (value / 1e9).toFixed(1) + 'B';
                }
                if (Math.abs(value) >= 1e6) {
                  return (value / 1e6).toFixed(1) + 'M';
                }
                if (Math.abs(value) >= 1e3) {
                  return (value / 1e3).toFixed(1) + 'K';
                }
                return value.toString();
              }}
            />
            <Tooltip content={<ChartTooltip />} />
            {metrics.map((metric, index) => {
              const ChartComponent = metricTypes[metric] === 'line' ? Line : Bar;
              return (
                <ChartComponent
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  stroke={getMetricColor(index)}
                  fill={metricTypes[metric] === 'bar' ? getMetricColor(index) : undefined}
                  strokeWidth={metricTypes[metric] === 'line' ? 2 : undefined}
                  dot={metricTypes[metric] === 'line'}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <ChartLegend
        metrics={metrics}
        ticker={ticker}
        cagrResults={cagrResults}
        totalChangeResults={totalChangeResults}
      />
    </div>
  );
};