
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface MiniChartProps {
  data: { time: string; price: number }[];
  isPositive: boolean;
}

export const MiniChart = ({ data, isPositive }: MiniChartProps) => {
  return (
    <div className="w-24 h-12">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <Area
            type="monotone"
            dataKey="price"
            stroke={isPositive ? '#22c55e' : '#ef4444'}
            fill={isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
            strokeWidth={1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
