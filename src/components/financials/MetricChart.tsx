import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MetricChartProps {
  data: Array<{
    period: string;
    metrics: Array<{
      name: string;
      value: number;
    }>;
  }>;
  metrics: string[];
  chartType: "bar" | "line";
}

const COLORS = [
  "#0EA5E9", // sky blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EC4899", // pink
  "#8B5CF6", // violet
  "#14B8A6", // teal
  "#F43F5E", // rose
  "#6366F1", // indigo
];

export const MetricChart = ({ data, metrics, chartType }: MetricChartProps) => {
  const formatYAxis = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  const ChartComponent = chartType === 'bar' ? BarChart : LineChart;
  const DataComponent = chartType === 'bar' ? Bar : Line;

  return (
    <div className="w-full bg-white p-4 rounded-lg border">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12 }}
            />
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
            {metrics.map((metric, index) => (
              <DataComponent
                key={metric}
                type={chartType === 'line' ? "monotone" : undefined}
                dataKey={`metrics[${index}].value`}
                name={metric}
                stroke={chartType === 'line' ? COLORS[index % COLORS.length] : undefined}
                fill={chartType === 'bar' ? COLORS[index % COLORS.length] : undefined}
                dot={chartType === 'line' ? false : undefined}
                strokeWidth={chartType === 'line' ? 2 : undefined}
                radius={chartType === 'bar' ? [4, 4, 0, 0] : undefined}
              />
            ))}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  );
};