import { TooltipProps } from 'recharts';
import { getMetricFormat } from '@/utils/metricDefinitions';

interface CustomTooltipProps extends TooltipProps<any, any> {
  ticker?: string;
}

export const ChartTooltip = ({ active, payload, label, ticker }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  // Format value based on metric type
  const formatValue = (name: string, value: number) => {
    const format = getMetricFormat(name);
    
    if (format === 'percentage') {
      return `${value.toFixed(2)}%`;
    } else if (format === 'ratio') {
      return value.toFixed(2);
    } else if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(value);
    } else {
      return value.toLocaleString();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((entry: any, index: number) => {
        // Extract the original metric name from the dataKey
        const metricName = entry.dataKey;
        
        return (
          <div key={index} className="flex items-center justify-between gap-4">
            <span style={{ color: entry.color }}>
              {ticker ? `${ticker} - ${entry.name}` : entry.name}
            </span>
            <span className="font-medium">
              {formatValue(metricName, entry.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
};