import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface MetricChartProps {
  data: Array<{
    period: string;
    metrics: Array<{
      name: string;
      value: number;
    }>;
  }>;
  metrics: string[];
  chartType: 'bar' | 'line';
}

export const MetricChart = ({ data, metrics, chartType }: MetricChartProps) => {
  // Transform data for Recharts
  const transformedData = data.map(item => {
    const transformed: { [key: string]: string | number } = { period: item.period };
    item.metrics.forEach(metric => {
      transformed[metric.name] = metric.value;
    });
    return transformed;
  });

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
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} />
        <Tooltip 
          formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
        />
        <Legend />
      </>
    );

    if (chartType === 'bar') {
      return (
        <BarChart {...commonProps}>
          {commonChildren}
          {metrics.map((metric, index) => (
            <Bar
              key={metric}
              dataKey={metric}
              fill={`hsl(${index * (360 / metrics.length)}, 70%, 50%)`}
              name={metric}
            />
          ))}
        </BarChart>
      );
    }

    return (
      <LineChart {...commonProps}>
        {commonChildren}
        {metrics.map((metric, index) => (
          <Line
            key={metric}
            type="monotone"
            dataKey={metric}
            stroke={`hsl(${index * (360 / metrics.length)}, 70%, 50%)`}
            name={metric}
            dot={false}
          />
        ))}
      </LineChart>
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
    <div className="w-full bg-white p-4 rounded-lg border">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};