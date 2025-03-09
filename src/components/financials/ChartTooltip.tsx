import { TooltipProps } from 'recharts';
import { getMetricFormat, getMetricDisplayName } from '@/utils/metricDefinitions';

interface CustomTooltipProps extends TooltipProps<any, any> {
  ticker?: string;
}

export const ChartTooltip = ({ active, payload, label, ticker }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  // Group metrics by type for better tooltip organization
  const metricGroups = {
    currency: payload.filter(entry => getMetricFormat(entry.dataKey) === 'currency'),
    percentage: payload.filter(entry => getMetricFormat(entry.dataKey) === 'percentage'),
    ratio: payload.filter(entry => getMetricFormat(entry.dataKey) === 'ratio'),
    number: payload.filter(entry => getMetricFormat(entry.dataKey) === 'number')
  };

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
      return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      
      {/* Render currency metrics */}
      {metricGroups.currency.length > 0 && (
        <div className="mb-2">
          {metricGroups.currency.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span style={{ color: entry.color }}>
                {ticker ? `${ticker} - ${getMetricDisplayName(entry.dataKey)}` : getMetricDisplayName(entry.dataKey)}
              </span>
              <span className="font-medium">
                {formatValue(entry.dataKey, entry.value)}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Render percentage metrics */}
      {metricGroups.percentage.length > 0 && (
        <div className="mb-2">
          {metricGroups.percentage.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span style={{ color: entry.color }}>
                {ticker ? `${ticker} - ${getMetricDisplayName(entry.dataKey)}` : getMetricDisplayName(entry.dataKey)}
              </span>
              <span className="font-medium">
                {formatValue(entry.dataKey, entry.value)}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Render ratio metrics */}
      {metricGroups.ratio.length > 0 && (
        <div className="mb-2">
          {metricGroups.ratio.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span style={{ color: entry.color }}>
                {ticker ? `${ticker} - ${getMetricDisplayName(entry.dataKey)}` : getMetricDisplayName(entry.dataKey)}
              </span>
              <span className="font-medium">
                {formatValue(entry.dataKey, entry.value)}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Render number metrics */}
      {metricGroups.number.length > 0 && (
        <div>
          {metricGroups.number.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span style={{ color: entry.color }}>
                {ticker ? `${ticker} - ${getMetricDisplayName(entry.dataKey)}` : getMetricDisplayName(entry.dataKey)}
              </span>
              <span className="font-medium">
                {formatValue(entry.dataKey, entry.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};