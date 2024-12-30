import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getMetricColor, formatYAxis } from './chartUtils';
import { ChartTooltip } from './ChartTooltip';

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

  return (
    <div className="w-full bg-white p-4 rounded-lg border">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
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
              if (metricTypes[metric] === 'line') {
                return (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={color}
                    name={metric}
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
                  name={metric}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};