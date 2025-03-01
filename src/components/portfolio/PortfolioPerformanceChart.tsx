import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

interface PortfolioPerformanceChartProps {
  timeframe: string;
  portfolioValue?: number;
}

// Generate more realistic mock data based on the starting value
const generateMockData = (timeframe: string, startingValue: number = 10000) => {
  // Ensure startingValue is a valid number
  if (startingValue === undefined || startingValue === null || isNaN(startingValue)) {
    console.warn('Invalid starting value for performance chart, using default');
    startingValue = 10000; // Default fallback
  }
  
  // Convert string to number if needed (defensive coding)
  if (typeof startingValue === 'string') {
    startingValue = parseFloat(startingValue);
    if (isNaN(startingValue)) {
      startingValue = 10000; // Default fallback if conversion fails
    }
  }
  
  const data = [];
  const points = timeframe === '5D' ? 5 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : 180;
  let currentValue = startingValue;
  
  // Base volatility on timeframe
  const volatility = timeframe === '5D' ? 0.01 : timeframe === '1M' ? 0.015 : 0.02;
  
  // Create a slightly upward trend
  const trend = timeframe === '5D' ? 0.001 : timeframe === '1M' ? 0.002 : 0.003;
  
  const now = new Date();
  for (let i = points; i >= 0; i--) {
    // Calculate date for this point
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Random walk with slight upward bias
    const randomChange = (Math.random() - 0.5) * 2 * volatility + trend;
    currentValue = currentValue * (1 + randomChange);
    
    // Ensure no NaN values are created
    if (isNaN(currentValue)) {
      currentValue = startingValue * (1 + (Math.random() * 0.1 - 0.05)); // Fallback calculation
    }
    
    data.push({
      date: date.toLocaleDateString(),
      fullDate: date.toISOString().split('T')[0],
      value: currentValue,
      change: i === points ? 0 : data[data.length - 1] ? ((currentValue / data[data.length - 1].value) - 1) * 100 : 0
    });
  }

  return data;
};

export const PortfolioPerformanceChart = ({ timeframe, portfolioValue }: PortfolioPerformanceChartProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [data, setData] = useState<Array<{
    date: string;
    fullDate: string;
    value: number;
    change: number;
  }>>([]);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  
  useEffect(() => {
    // Ensure portfolioValue is a number and has a valid default
    const safePortfolioValue = typeof portfolioValue === 'number' && !isNaN(portfolioValue) 
      ? portfolioValue 
      : 10000;
      
    // Update data when timeframe changes or portfolio value changes
    setData(generateMockData(selectedTimeframe, safePortfolioValue));
  }, [selectedTimeframe, portfolioValue]);
  
  // Calculate total performance (with safeguards against NaN)
  const startValue = data.length > 0 ? data[0].value : 0;
  const endValue = data.length > 0 ? data[data.length - 1].value : 0;
  const totalGain = endValue - startValue;
  
  // Prevent division by zero
  let totalGainPercent = 0;
  if (startValue > 0) {
    totalGainPercent = (totalGain / startValue) * 100;
  }
  
  // Ensure we don't display NaN
  if (isNaN(totalGainPercent)) {
    totalGainPercent = 0;
  }
  
  const formatCurrency = (value: number) => {
    // Handle NaN or undefined values
    if (value === undefined || isNaN(value)) {
      return '$0.00';
    }
    
    return value >= 1000000
      ? `$${(value / 1000000).toFixed(2)}M`
      : value >= 1000
      ? `$${(value / 1000).toFixed(1)}K`
      : `$${value.toFixed(2)}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <div className="text-lg font-semibold">
          {formatCurrency(endValue)}
          <span className={`ml-2 text-sm ${totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)} ({totalGainPercent.toFixed(2)}%)
          </span>
        </div>
        <div className="flex space-x-2 text-sm">
          <button 
            className={`px-2 py-1 rounded ${selectedTimeframe === '5D' ? 'bg-blue-500 text-white' : 'text-blue-500'}`}
            onClick={() => setSelectedTimeframe('5D')}
          >
            5D
          </button>
          <button 
            className={`px-2 py-1 rounded ${selectedTimeframe === '1M' ? 'bg-blue-500 text-white' : 'text-blue-500'}`}
            onClick={() => setSelectedTimeframe('1M')}
          >
            1M
          </button>
          <button 
            className={`px-2 py-1 rounded ${selectedTimeframe === '3M' ? 'bg-blue-500 text-white' : 'text-blue-500'}`}
            onClick={() => setSelectedTimeframe('3M')}
          >
            3M
          </button>
          <button 
            className={`px-2 py-1 rounded ${selectedTimeframe === '6M' ? 'bg-blue-500 text-white' : 'text-blue-500'}`}
            onClick={() => setSelectedTimeframe('6M')}
          >
            6M
          </button>
        </div>
      </div>
      
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            onMouseMove={(e) => {
              if (e.activeTooltipIndex !== undefined) {
                setHoveredPoint(e.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="date"
              stroke="#6B7280"
              tick={{ fill: '#374151' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              tickMargin={10}
              minTickGap={30}
              tickFormatter={(date, index) => {
                // Show fewer dates depending on timeframe
                if (selectedTimeframe === '5D') {
                  return date; // Show all dates for 5D
                } else if (selectedTimeframe === '1M') {
                  return index % 7 === 0 ? date : ''; // Show weekly for 1M
                } else {
                  return index % 15 === 0 ? date : ''; // Show bi-weekly for 3M and 6M
                }
              }}
            />
            <YAxis
              stroke="#6B7280"
              tick={{ fill: '#374151' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              tickFormatter={(value) => formatCurrency(value)}
              domain={['auto', 'auto']}
              tickMargin={10}
            />
            <Tooltip
              formatter={(value: number) => {
                // Handle NaN values in tooltip
                if (isNaN(value)) return ["$0.00", "Value"];
                return [formatCurrency(value), 'Value'];
              }}
              labelFormatter={(label) => `Date: ${label}`}
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
              activeDot={{ r: 6, fill: '#2563eb', stroke: 'white', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};