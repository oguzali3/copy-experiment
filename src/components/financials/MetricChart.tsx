import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getMetricColor, formatYAxis, transformChartData } from './chartUtils';
import { ChartTooltip } from './ChartTooltip';

interface MetricData {
  name: string;
  value: string | number;
}

interface ChartData {
  period: string;
  metrics: MetricData[];
}

interface MetricChartProps {
  data: ChartData[];
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
  if (!data || data.length === 0 || !metrics || metrics.length === 0) {
    return (
      <div className="w-full bg-white p-4 rounded-lg border flex items-center justify-center h-[300px]">
        No data available
      </div>
    );
  }

  const transformedData = transformChartData(data, metrics);

  return (
    <div className="w-full bg-white p-4 rounded-lg border">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={transformedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E5E7EB" 
              vertical={false}
            />
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
              if (metricTypes[metric] === 'bar') {
                return (
                  <Bar
                    key={metric}
                    dataKey={metric}
                    fill={color}
                    name={metric}
                    radius={[0, 0, 0, 0]}
                    maxBarSize={50}
                  />
                );
              }
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
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};