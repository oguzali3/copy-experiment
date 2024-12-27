import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MetricChartProps {
  data: Array<{
    period: string;
    metrics: Array<{
      name: string;
      value: number;
    }>;
  }>;
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
  // Safely transform the data
  const transformedData = data.map(item => {
    const transformed: { [key: string]: string | number } = { period: item.period };
    item.metrics.forEach(metric => {
      if (metric && metric.name && typeof metric.value !== 'undefined') {
        transformed[metric.name] = metric.value;
      }
    });
    return transformed;
  });

  const getMetricColor = (index: number): string => {
    if (index === 0) return '#1A237E';
    if (index === 1) return '#FB8C00';
    if (index === 2) return '#7E57C2';
    return `hsl(${Math.random() * 360}, 50%, 45%)`;
  };

  const formatYAxis = (value: number) => {
    if (value === 0) return '$0';
    if (Math.abs(value) >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`;
    }
    if (Math.abs(value) >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1e3) {
      return `$${(value / 1e3).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  const renderChart = () => {
    const commonProps = {
      data: transformedData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    const commonChildren = (
      <>
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
        <Tooltip 
          formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            padding: '12px'
          }}
          labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
        />
      </>
    );

    return (
      <ComposedChart {...commonProps}>
        {commonChildren}
        {metrics.map((metric, index) => {
          const color = getMetricColor(index);
          if (metricTypes[metric] === 'bar') {
            return (
              <Bar
                key={metric}
                dataKey={metric}
                fill={color}
                name={ticker ? `${ticker} - ${metric}` : metric}
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
              name={ticker ? `${ticker} - ${metric}` : metric}
              dot={false}
              strokeWidth={2}
            />
          );
        })}
      </ComposedChart>
    );
  };

  if (!data || data.length === 0 || !metrics || metrics.length === 0) {
    return (
      <div className="w-full bg-white p-4 rounded-lg border flex items-center justify-center h-[300px]">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {metrics.map((metric, index) => (
          <div key={metric} className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <span className="font-medium text-sm text-gray-700">{metric}</span>
            <Select
              value={metricTypes[metric]}
              onValueChange={(value: 'bar' | 'line') => onMetricTypeChange(metric, value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
      <div className="w-full bg-white p-4 rounded-lg border">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};