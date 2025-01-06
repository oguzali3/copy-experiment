import { PieChart as PieChartRechart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Stock } from './types';

interface PortfolioAllocationChartProps {
  stocks: Stock[];
}

const COLORS = [
  '#2563eb', // Blue
  '#f97316', // Orange
  '#7c3aed', // Purple
  '#10b981', // Green
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
];

export const PortfolioAllocationChart = ({ stocks }: PortfolioAllocationChartProps) => {
  const data = stocks.map(stock => ({
    name: stock.ticker,
    value: stock.percentOfPortfolio
  }));

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChartRechart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `${value.toFixed(2)}%`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.5rem'
            }}
          />
        </PieChartRechart>
      </ResponsiveContainer>
    </div>
  );
};
