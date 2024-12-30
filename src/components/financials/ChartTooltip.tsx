import { TooltipProps } from 'recharts';

interface CustomTooltipProps extends TooltipProps<any, any> {
  ticker?: string;
}

export const ChartTooltip = ({ active, payload, label, ticker }: CustomTooltipProps) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <span style={{ color: entry.color }}>
            {ticker ? `${ticker} - ${entry.name}` : entry.name}
          </span>
          <span className="font-medium">${entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};