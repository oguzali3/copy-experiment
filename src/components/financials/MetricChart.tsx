import React, { useEffect } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getMetricColor, formatYAxis } from './chartUtils';
import { ChartTooltip } from './ChartTooltip';
import { Button } from "@/components/ui/button";
import { BarChart3, LineChart } from "lucide-react";
import { getMetricFormat, getMetricDisplayName } from '@/utils/metricDefinitions';

interface MetricChartProps {
  data: any[];
  metrics: string[];
  ticker?: string;
  metricTypes: Record<string, 'bar' | 'line'>;
  onMetricTypeChange: (metric: string, type: 'bar' | 'line') => void;
}

export const MetricChart = ({ 
  data, 
  metrics, 
  ticker,
  metricTypes,
  onMetricTypeChange
}: MetricChartProps) => {
  // Log initial props for debugging
  useEffect(() => {
    console.log('MetricChart props:', {
      dataLength: data?.length || 0,
      metrics,
      metricTypes
    });
    
    // Check if we have the metrics we're looking for in the data
    if (data?.length > 0 && metrics?.length > 0) {
      const firstItem = data[0];
      const metricsInData = metrics.filter(metric => firstItem[metric] !== undefined);
      const missingMetrics = metrics.filter(metric => firstItem[metric] === undefined);
      
      console.log(`Metrics in chart data: ${metricsInData.length}/${metrics.length}`);
      if (missingMetrics.length > 0) {
        console.log('Missing metrics in chart data:', missingMetrics);
      }
      
      // Log values for a few metrics to check
      metricsInData.forEach(metric => {
        console.log(`${metric} values:`, data.slice(0, 2).map(item => item[metric]));
      });
    }
  }, [data, metrics]);

  if (!data?.length || !metrics?.length) {
    return (
      <div className="w-full bg-white p-4 rounded-lg flex items-center justify-center h-[300px]">
        <p className="text-gray-500">
          {!metrics?.length ? 'Select metrics to visualize' : 'No data available'}
        </p>
      </div>
    );
  }

  // Filter out data points that don't have any values for the selected metrics
  const filteredData = data.filter(item => {
    return metrics.some(metric => {
      return item[metric] !== undefined && item[metric] !== null;
    });
  });

  if (filteredData.length === 0) {
    return (
      <div className="w-full bg-white p-4 rounded-lg flex items-center justify-center h-[300px]">
        <p className="text-gray-500">No data available for the selected metrics</p>
      </div>
    );
  }

  // Determine if we need a percentage Y-axis or a currency Y-axis
  const hasPercentageMetrics = metrics.some(metric => getMetricFormat(metric) === 'percentage');
  const hasRatioMetrics = metrics.some(metric => getMetricFormat(metric) === 'ratio');
  const hasCurrencyMetrics = metrics.some(metric => getMetricFormat(metric) === 'currency');
  
  // Group similar metrics together
  const metricGroups: Record<string, string[]> = {
    currency: metrics.filter(m => getMetricFormat(m) === 'currency'),
    percentage: metrics.filter(m => getMetricFormat(m) === 'percentage'),
    ratio: metrics.filter(m => getMetricFormat(m) === 'ratio'),
    number: metrics.filter(m => getMetricFormat(m) === 'number')
  };
  
  // If we have mixed types, we might need multiple y-axes (simplified for now)
  const primaryMetricType = 
    metricGroups.currency.length > 0 ? 'currency' :
    metricGroups.percentage.length > 0 ? 'percentage' :
    metricGroups.ratio.length > 0 ? 'ratio' : 'number';

  // Function to format Y-axis values based on metric type
  const formatYAxisValue = (value: number) => {
    if (primaryMetricType === 'percentage') {
      return `${value.toFixed(1)}%`;
    } else if (primaryMetricType === 'ratio') {
      return value.toFixed(2);
    } else if (primaryMetricType === 'currency') {
      return formatYAxis(value);
    } else {
      return value.toLocaleString();
    }
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {metrics.map((metric) => (
            <div key={metric} className="flex items-center gap-2">
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-md" 
                style={{ backgroundColor: `${getMetricColor(metrics.indexOf(metric))}20` }}
              >
                <span className="font-medium">{getMetricDisplayName(metric)}</span>
                <div className="flex gap-1">
                  <Button
                    variant={metricTypes[metric] === 'bar' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => onMetricTypeChange(metric, 'bar')}
                    className="h-8 w-8"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={metricTypes[metric] === 'line' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => onMetricTypeChange(metric, 'line')}
                    className="h-8 w-8"
                  >
                    <LineChart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={50}
              dy={20}
            />
            <YAxis 
              tickFormatter={formatYAxisValue}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              domain={primaryMetricType === 'percentage' ? [0, 'auto'] : ['auto', 'auto']}
            />
            <Tooltip content={<ChartTooltip ticker={ticker} />} />
            
            {metrics.map((metric, index) => {
              const color = getMetricColor(index);
              const displayName = getMetricDisplayName(metric);
              
              // Use line chart for percentage and ratio metrics by default unless explicitly set to bar
              const defaultType = 
                (getMetricFormat(metric) === 'percentage' || getMetricFormat(metric) === 'ratio') 
                  ? 'line' : 'bar';
              
              const chartType = metricTypes[metric] || defaultType;
              
              if (chartType === 'line') {
                return (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={color}
                    name={displayName}
                    dot={{ fill: color, r: 4 }}
                    strokeWidth={2}
                    connectNulls={true}
                  />
                );
              }
              return (
                <Bar
                  key={metric}
                  dataKey={metric}
                  fill={color}
                  name={displayName}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 border-t pt-4">
        <div className="flex flex-col gap-2">
          {metrics.map((metric, index) => {
            // Calculate average, max, min
            const values = filteredData
              .map(item => typeof item[metric] === 'number' ? item[metric] : null)
              .filter(val => val !== null && !isNaN(val));
            
            const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            const max = values.length ? Math.max(...values) : 0;
            const min = values.length ? Math.min(...values) : 0;
            
            // Format based on metric type
            const format = getMetricFormat(metric);
            const formatValue = (val: number) => {
              if (format === 'percentage') return `${val.toFixed(2)}%`;
              if (format === 'ratio') return val.toFixed(2);
              if (format === 'currency') return new Intl.NumberFormat('en-US', {
                style: 'currency', currency: 'USD', notation: 'compact'
              }).format(val);
              return val.toLocaleString();
            };
            
            return (
              <div key={metric} className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getMetricColor(index) }}
                />
                <span className="text-gray-900 font-medium">
                  {ticker} - {getMetricDisplayName(metric)} {' '}
                  (Avg: {formatValue(avg)}) {' '}
                  (Range: {formatValue(min)} - {formatValue(max)})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};