
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useStockWebSocket } from "@/hooks/useStockWebSocket";

interface StockChartProps {
  ticker?: string;
}

export const StockChart = ({ ticker }: StockChartProps) => {
  const [timeframe, setTimeframe] = useState("1D");
  const { price: livePrice } = useStockWebSocket(ticker);

  const { data: chartData, isLoading, error } = useQuery({
    queryKey: ['stock-chart', ticker, timeframe],
    queryFn: async () => {
      if (!ticker) return [];
      
      console.log('Fetching chart data for:', ticker, 'timeframe:', timeframe);
      
      const { data, error } = await supabase.functions.invoke('fetch-stock-chart', {
        body: { 
          symbol: ticker, 
          timeframe,
          // Add timestamp to avoid caching issues
          timestamp: new Date().getTime()
        }
      });

      if (error) {
        console.error('Error fetching chart data:', error);
        throw error;
      }

      if (!data || !Array.isArray(data)) {
        console.error('Invalid chart data received:', data);
        throw new Error('Invalid data format received');
      }

      console.log('Chart data received:', data?.length, 'data points');
      return data;
    },
    enabled: !!ticker,
    retry: 2,
    retryDelay: 1000,
    // Refresh every minute for intraday data
    refetchInterval: timeframe === "1D" ? 60000 : false,
  });

  const timeframes = [
    { label: "1D", value: "1D" },
    { label: "1W", value: "1W" },
    { label: "1M", value: "1M" },
    { label: "3M", value: "3M" },
    { label: "6M", value: "6M" },
    { label: "YTD", value: "YTD" },
    { label: "1Y", value: "1Y" },
    { label: "5Y", value: "5Y" },
    { label: "MAX", value: "MAX" }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatXAxisTick = (time: string) => {
    if (!time) return '';
    
    const date = new Date(time);
    if (isNaN(date.getTime())) return '';
    
    try {
      switch (timeframe) {
        case "1D":
          return date.toLocaleTimeString('en-US', { 
            hour: 'numeric',
            minute: '2-digit',
            hour12: true 
          });
        case "1W":
        case "1M":
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
        case "3M":
        case "6M":
        case "YTD":
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
        case "1Y":
          return date.toLocaleDateString('en-US', { 
            month: 'short'
          });
        case "5Y":
        case "MAX":
          return date.getFullYear().toString();
        default:
          return date.toLocaleDateString('en-US', { 
            month: 'short',
            day: 'numeric'
          });
      }
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

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

  if (error || !chartData) {
    return (
      <div className="h-full w-full bg-white p-4 rounded-xl shadow-sm">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading chart data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const latestPrice = livePrice || (chartData && chartData.length > 0 ? chartData[chartData.length - 1].price : 0);
  const firstPrice = chartData && chartData.length > 0 ? chartData[0].price : 0;
  const priceChange = latestPrice - firstPrice;
  const priceChangePercent = (priceChange / firstPrice) * 100;
  const isPositive = priceChange >= 0;
  const chartColor = isPositive ? '#22c55e' : '#ef4444';

  return (
    <div className="h-full w-full bg-white p-4 rounded-xl shadow-sm">
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">
            {formatPrice(latestPrice)}
          </span>
          <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
          </span>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Updated: {new Date().toLocaleString()}
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {timeframes.map(({ label, value }) => (
          <button
            key={value}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              timeframe === value 
                ? "bg-blue-100 text-blue-700 font-medium" 
                : "hover:bg-gray-100 text-gray-600"
            }`}
            onClick={() => setTimeframe(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              tickFormatter={formatXAxisTick}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#888888', fontSize: 12 }}
              minTickGap={30}
            />
            <YAxis 
              domain={['auto', 'auto']}
              tickFormatter={(value) => formatPrice(value)}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#888888', fontSize: 12 }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                padding: "8px 12px"
              }}
              formatter={(value: number) => [formatPrice(value), "Price"]}
              labelFormatter={(label) => new Date(label).toLocaleString()}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              fillOpacity={1}
              fill="url(#colorPrice)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
