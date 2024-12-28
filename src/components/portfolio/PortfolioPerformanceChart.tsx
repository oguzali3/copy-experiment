import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PortfolioPerformanceChartProps {
  timeframe: string;
}

// Mock data - in a real app, this would come from an API
const generateMockData = (timeframe: string) => {
  const data = [];
  const points = timeframe === '5D' ? 5 : 30;
  let value = 10000;

  for (let i = 0; i < points; i++) {
    value = value * (1 + (Math.random() - 0.5) * 0.02);
    data.push({
      date: new Date(Date.now() - (points - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      value: value
    });
  }

  return data;
};

export const PortfolioPerformanceChart = ({ timeframe }: PortfolioPerformanceChartProps) => {
  const data = generateMockData(timeframe);

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis 
            dataKey="date"
            stroke="#6B7280"
            tick={{ fill: '#374151' }}
          />
          <YAxis
            stroke="#6B7280"
            tick={{ fill: '#374151' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(1)}K`}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Portfolio Value']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.5rem'
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};