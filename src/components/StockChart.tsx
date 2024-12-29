import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StockChartProps {
  ticker?: string;
}

export const StockChart = ({ ticker }: StockChartProps) => {
  const [timeframe, setTimeframe] = useState("1D");

  const { data: chartData, isLoading } = useQuery({
    queryKey: ['stock-chart', ticker, timeframe],
    queryFn: async () => {
      if (!ticker) return [];
      
      const { data, error } = await supabase.functions.invoke('fetch-stock-chart', {
        body: { symbol: ticker, timeframe }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!ticker,
  });

  const timeframes = ["5D", "1M", "3M", "6M", "YTD", "1Y", "3Y", "5Y", "MAX"];

  if (!ticker) {
    return (
      <div className="h-full w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-center">
        <p className="text-gray-500">Select a stock to view its chart</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-center">
        <p className="text-gray-500">Loading chart data...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white p-4 rounded-xl shadow-sm">
      <div className="flex gap-2 mb-4 flex-wrap px-2">
        {timeframes.map((tf) => (
          <button
            key={tf}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeframe === tf 
                ? "bg-blue-100 text-blue-700" 
                : "hover:bg-gray-100"
            }`}
            onClick={() => setTimeframe(tf)}
          >
            {tf}
          </button>
        ))}
      </div>
      <div className="h-[calc(100%-60px)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
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
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
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