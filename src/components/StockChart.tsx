import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { time: "9:30", price: 150 },
  { time: "10:00", price: 153 },
  { time: "10:30", price: 151 },
  { time: "11:00", price: 155 },
  { time: "11:30", price: 158 },
  { time: "12:00", price: 154 },
  { time: "12:30", price: 156 },
  { time: "13:00", price: 160 },
];

export const StockChart = () => {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="time" stroke="#888888" />
          <YAxis stroke="#888888" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1A1F2C",
              border: "none",
              borderRadius: "8px",
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#0EA5E9"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};