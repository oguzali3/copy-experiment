
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getMetricColor, formatYAxis } from './chartUtils';
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
  if (!data?.length || !metrics?.length) {
    return (
      <div className="w-full bg-white p-4 rounded-lg flex items-center justify-center h-[300px]">
        <p className="text-gray-500">
          {!metrics?.length ? 'Select metrics to visualize' : 'No data available'}
        </p>
      </div>
    );
  }

  // Sort data chronologically, handling both quarterly and annual formats
  const sortedData = [...data].sort((a, b) => {
    if (a.period === 'TTM') return 1;
    if (b.period === 'TTM') return -1;
    
    // Handle quarterly format (Q1 2023, Q2 2023, etc.)
    if (a.period.includes('Q') && b.period.includes('Q')) {
      const [aQ, aYear] = a.period.split(' ');
      const [bQ, bYear] = b.period.split(' ');
      
      if (aYear !== bYear) {
        return parseInt(aYear) - parseInt(bYear);
      }
      return parseInt(aQ.slice(1)) - parseInt(bQ.slice(1));
    }
    
    // Handle annual format
    return parseInt(a.period) - parseInt(b.period);
  });

  console.log('Sorted chart data:', sortedData);

  return (
    <div className="w-full bg-white p-4 rounded-lg space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2 items-center">
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
            data={sortedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E5E7EB" 
              vertical={false}
              opacity={0.4}
            />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={20}
              dy={5}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              width={80}
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
          {metrics.map((metric, index) => {
            // Calculate growth rates
            const firstValue = sortedData[sortedData.length - 1][metric];
            const lastValue = sortedData[0][metric];
            const totalChange = ((lastValue - firstValue) / Math.abs(firstValue)) * 100;
            const periods = sortedData.length - 1;
            const cagr = periods > 0 ? 
              (Math.pow(lastValue / firstValue, 1 / periods) - 1) * 100 : 
              0;

            return (
              <div key={metric} className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getMetricColor(index) }}
                />
                <span className="text-gray-900 font-medium">
                  {ticker} - {getMetricDisplayName(metric)} {' '}
                  (Total Change: {totalChange.toFixed(2)}%) {' '}
                  {periods > 0 && `(CAGR: ${cagr.toFixed(2)}%)`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
