import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface StockChartProps {
  ticker?: string;
}

const data = [
  { time: "9:30", price: 150.25 },
  { time: "10:00", price: 152.75 },
  { time: "10:30", price: 151.50 },
  { time: "11:00", price: 154.25 },
  { time: "11:30", price: 153.75 },
  { time: "12:00", price: 155.50 },
  { time: "12:30", price: 154.25 },
  { time: "13:00", price: 156.75 },
  { time: "13:30", price: 158.25 },
  { time: "14:00", price: 157.50 },
  { time: "14:30", price: 159.75 },
  { time: "15:00", price: 160.25 },
  { time: "15:30", price: 162.50 },
  { time: "16:00", price: 161.75 },
];

export const StockChart = ({ ticker }: StockChartProps) => {
  return (
    <div className="h-full w-full bg-white p-4 rounded-xl shadow-sm">
      <div className="flex gap-2 mb-4 flex-wrap px-2">
        {["5D", "1M", "3M", "6M", "YTD", "1Y", "3Y", "5Y", "MAX"].map((timeframe) => (
          <button
            key={timeframe}
            className="px-3 py-1 text-sm rounded-md hover:bg-gray-100 transition-colors"
          >
            {timeframe}
          </button>
        ))}
      </div>
      <div className="h-[calc(100%-60px)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
          >
            <XAxis 
              dataKey="time" 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value) => [`$${value}`, "Price"]}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#0EA5E9"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
