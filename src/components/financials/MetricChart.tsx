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

  const getMetricColor = (index: number): string => {
    // Professional color palette
    if (index === 0) return '#1A237E'; // Navy blue
    if (index === 1) return '#FB8C00'; // Matte orange
    if (index === 2) return '#7E57C2'; // Matte purple
    
    // Random muted colors for subsequent metrics
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
        <Legend 
          formatter={(value, entry) => (
            <span style={{ color: '#374151', marginLeft: '8px' }}>
              {`${entry?.payload?.ticker || ''} - ${value}`}
            </span>
          )}
          wrapperStyle={{ 
            paddingTop: '20px',
            fontSize: '13px',
            fontWeight: 500
          }}
          iconType="square"
          align="left"
        />
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
              fill={getMetricColor(index)}
              name={metric}
              radius={[0, 0, 0, 0]} // Sharp edges
              maxBarSize={50}
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
            stroke={getMetricColor(index)}
            name={metric}
            dot={false}
            strokeWidth={2}
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