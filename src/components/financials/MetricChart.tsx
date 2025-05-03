import React, { useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine
} from 'recharts';
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
  onMetricsReorder?: (metrics: string[]) => void;
}

export const MetricChart = ({ 
  data, 
  metrics, 
  ticker,
  metricTypes,
  onMetricTypeChange,
  onMetricsReorder
}: MetricChartProps) => {
  // Group metrics by format type for proper scaling
  const metricGroups = useMemo(() => {
    const groups: Record<string, string[]> = {
      currency: [],
      percentage: [],
      ratio: [],
      number: []
    };
    
    metrics.forEach(metric => {
      const format = getMetricFormat(metric);
      groups[format].push(metric);
    });
    
    return groups;
  }, [metrics]);

  // Determine if we need a dual y-axis
  const needsDualAxis = useMemo(() => {
    // We need a dual axis if we have both currency and percentage/ratio metrics
    return (
      (metricGroups.currency.length > 0 && 
        (metricGroups.percentage.length > 0 || metricGroups.ratio.length > 0))
      ||
      (metricGroups.number.length > 0 && 
        (metricGroups.percentage.length > 0 || metricGroups.ratio.length > 0))
    );
  }, [metricGroups]);

  // Assign metrics to primary or secondary axis
  const { primaryMetrics, secondaryMetrics, primaryFormat, secondaryFormat } = useMemo(() => {
    let primary: string[] = [];
    let secondary: string[] = [];
    let primaryFmt = 'currency';
    let secondaryFmt = 'percentage';
    
    if (!needsDualAxis) {
      // If no dual axis needed, all metrics go to primary
      primary = metrics;
      
      // Determine single axis format
      if (metricGroups.currency.length > 0) {
        primaryFmt = 'currency';
      } else if (metricGroups.percentage.length > 0) {
        primaryFmt = 'percentage';
      } else if (metricGroups.ratio.length > 0) {
        primaryFmt = 'ratio';
      } else {
        primaryFmt = 'number';
      }
    } else {
      // With dual axis, prioritize assignment
      if (metricGroups.currency.length > 0) {
        // If we have currency metrics, put them on primary axis
        primary = metricGroups.currency;
        primaryFmt = 'currency';
        
        // Put other metrics on secondary axis
        if (metricGroups.percentage.length > 0) {
          secondary = metricGroups.percentage;
          secondaryFmt = 'percentage';
        } else if (metricGroups.ratio.length > 0) {
          secondary = metricGroups.ratio;
          secondaryFmt = 'ratio';
        } else {
          secondary = metricGroups.number;
          secondaryFmt = 'number';
        }
      } else {
        // No currency metrics, put number on primary
        primary = metricGroups.number;
        primaryFmt = 'number';
        
        // Put percentage/ratio on secondary
        if (metricGroups.percentage.length > 0) {
          secondary = metricGroups.percentage;
          secondaryFmt = 'percentage';
        } else {
          secondary = metricGroups.ratio;
          secondaryFmt = 'ratio';
        }
      }
    }
    
    return {
      primaryMetrics: primary,
      secondaryMetrics: secondary,
      primaryFormat: primaryFmt,
      secondaryFormat: secondaryFmt
    };
  }, [metrics, metricGroups, needsDualAxis]);

  // Log initial props for debugging
  useEffect(() => {
    console.log('MetricChart props:', {
      dataLength: data?.length || 0,
      metrics,
      metricTypes,
      needsDualAxis,
      primaryMetrics,
      secondaryMetrics
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
    }
  }, [data, metrics, metricTypes, needsDualAxis, primaryMetrics, secondaryMetrics]);

  if (!data?.length || !metrics?.length) {
    return (
      <div className="w-full bg-white p-4 rounded-lg flex items-center justify-center h-[300px] border border-gray-200">
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

  // Calculate domain for both axes
  const calculateDomain = (format: string, axisMetrics: string[]) => {
    if (axisMetrics.length === 0) return ['auto', 'auto'];
    
    let minValue = Number.MAX_VALUE;
    let maxValue = Number.MIN_VALUE;
    
    filteredData.forEach(item => {
      axisMetrics.forEach(metric => {
        if (item[metric] !== undefined && item[metric] !== null) {
          const value = Number(item[metric]);
          if (!isNaN(value)) {
            minValue = Math.min(minValue, value);
            maxValue = Math.max(maxValue, value);
          }
        }
      });
    });
    
    if (minValue === Number.MAX_VALUE) minValue = 0;
    if (maxValue === Number.MIN_VALUE) maxValue = 100;
    
    // Add padding to the domain
    const range = maxValue - minValue;
    const padding = range * 0.1;
    
    // Special handling for percentage axis starting at zero
    if (format === 'percentage' || format === 'ratio') {
      // For percentages, prefer starting at 0 unless negative values
      return [Math.min(0, minValue - padding), maxValue + padding];
    }
    
    // For currency/number, use automatic scaling if range is large
    const domainStart = minValue < 0 ? minValue - padding : 0;
    return [domainStart, maxValue + padding];
  };
  
  const primaryDomain = calculateDomain(primaryFormat, primaryMetrics);
  const secondaryDomain = calculateDomain(secondaryFormat, secondaryMetrics);

  // Function to format Y-axis values based on metric type
  const formatYAxisValue = (value: number, format: string) => {
    if (format === 'percentage') {
      return `${value.toFixed(1)}%`;
    } else if (format === 'ratio') {
      return value.toFixed(2);
    } else if (format === 'currency') {
      return formatYAxis(value);
    } else {
      return value.toLocaleString();
    }
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {metrics.map((metric, index) => {
            const isOnSecondaryAxis = secondaryMetrics.includes(metric);
            return (
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
                  {isOnSecondaryAxis && (
                    <span className="text-xs text-gray-500">(right axis)</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-[400px]">
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
            {/* Primary Y-Axis (left) */}
            <YAxis 
              yAxisId="left"
              tickFormatter={(value) => formatYAxisValue(value, primaryFormat)}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              domain={primaryDomain}
            />
            
            {/* Secondary Y-Axis (right) - Only shown if needed */}
            {needsDualAxis && (
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => formatYAxisValue(value, secondaryFormat)}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
                domain={secondaryDomain}
              />
            )}
            
            <Tooltip content={<ChartTooltip ticker={ticker} />} />
            <Legend />
            
            {/* Reference line at y=0 if any metrics include negative values */}
            <ReferenceLine y={0} stroke="#777" strokeDasharray="3 3" yAxisId="left" />
            {needsDualAxis && (
              <ReferenceLine y={0} stroke="#777" strokeDasharray="3 3" yAxisId="right" />
            )}
            
            {/* Render metrics on appropriate axes */}
            {metrics.map((metric, index) => {
              const color = getMetricColor(index);
              const displayName = getMetricDisplayName(metric);
              const chartType = metricTypes[metric] || 'bar';
              const yAxisId = secondaryMetrics.includes(metric) ? 'right' : 'left';
              
              if (chartType === 'line') {
                return (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={color}
                    name={displayName}
                    yAxisId={yAxisId}
                    dot={{ fill: color, r: 4 }}
                    activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
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
                  yAxisId={yAxisId}
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
