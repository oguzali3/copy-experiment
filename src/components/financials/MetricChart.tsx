import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getMetricColor, formatYAxis, calculateCAGR } from './chartUtils';
import { ChartTooltip } from './ChartTooltip';
import { Button } from "@/components/ui/button";
import { BarChart3, LineChart } from "lucide-react";
import { getMetricDisplayName } from '@/utils/metricDefinitions';

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
  console.log('MetricChart received data:', data);
  console.log('MetricChart received metrics:', metrics);

  if (!data?.length || !metrics?.length) {
    return (
      <div className="w-full bg-white p-4 rounded-lg border flex items-center justify-center h-[300px]">
        <p className="text-gray-500">
          {!metrics?.length ? 'Select metrics to visualize' : 'No data available'}
        </p>
      </div>
    );
  }

  // Sort data chronologically
  const sortedData = [...data].sort((a, b) => {
    if (a.period === 'TTM') return 1;
    if (b.period === 'TTM') return -1;
    return parseInt(a.period) - parseInt(b.period);
  });

  // Calculate CAGR for each metric
  const cagrResults: Record<string, number> = {};
  metrics.forEach(metric => {
    const firstValue = sortedData[0][metric];
    const lastValue = sortedData[sortedData.length - 1][metric];
    const years = sortedData[sortedData.length - 1].period === 'TTM' 
      ? sortedData.length - 2 
      : sortedData.length - 1;
    cagrResults[metric] = calculateCAGR(firstValue, lastValue, years);
  });

  return (
    <div className="w-full bg-white p-4 rounded-lg border space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2 items-center">
          {metrics.map((metric) => (
            <div key={metric} className="flex items-center gap-2">
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
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={sortedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              interval={0}  // Show all ticks
              angle={-45}   // Rotate labels for better readability
              textAnchor="end"  // Align rotated text
              height={20}   // Reduced from 30 to 20 to decrease spacing further
              dy={5}        // Reduced from 8 to 5 to bring labels even closer to axis
            />
            <YAxis 
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip ticker={ticker} />} />
            
            {metrics.map((metric, index) => {
              const color = getMetricColor(index);
              const displayName = getMetricDisplayName(metric);
              
              if (metricTypes[metric] === 'line') {
                return (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={color}
                    name={displayName}
                    dot={false}
                    strokeWidth={2}
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
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">{ticker}</span>
            <span className="text-gray-500">
              {sortedData[0].period} - {sortedData[sortedData.length - 1].period}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {metrics.map((metric, index) => (
              <div key={metric} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: getMetricColor(index) }}
                />
                <span className="font-medium" style={{ color: getMetricColor(index) }}>
                  {getMetricDisplayName(metric)}: {cagrResults[metric].toFixed(1)}% CAGR
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};