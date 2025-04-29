// Enhanced PortfolioValueChart component with intraday data support

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import portfolioApi, { IntradayResponse } from '@/services/portfolioApi';
import { Loader2 } from 'lucide-react';
import { Portfolio } from './types';
import { ensureNumber } from '@/utils/portfolioDataUtils';

interface PortfolioValueChartProps {
  portfolioId: string;
  className?: string;
  portfolio?: Portfolio;
  onUpdatePortfolio?: (portfolio: Portfolio) => void;
  excludedTickers?: string[];
}
type TimeframeType = '1D' | '5D' | '15D' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

export const PortfolioValueChart = ({ 
  portfolioId,
  className = '',
  portfolio,
  onUpdatePortfolio,
  excludedTickers = []
}: PortfolioValueChartProps) => {
  // State definitions
  const [timeframe, setTimeframe] = useState<TimeframeType>('5D');
  const [data, setData] = useState<Array<{
    date: string;
    value: number;
    dayChange?: number;
    dayChangePercent?: number;
    displayDate: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noDataAvailable, setNoDataAvailable] = useState(false);
  
  // Refs for request tracking
  const requestInProgress = useRef(false);
  const lastRequest = useRef<{
      portfolioId: string | null;
      timeframe: TimeframeType | null;
      exclusions: string;
    }>({
      portfolioId: null,
      timeframe: null,
      exclusions: '',
    });

  const formatDateForDisplay = (dateString: string, timeframe: TimeframeType): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid date
    }
    
    switch (timeframe) {
      case '1D':
        return new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          timeZone: 'America/New_York' // Specify US Eastern Time Zone
        }).format(date);
      case '5D':
      case '15D':
        return new Intl.DateTimeFormat('en-US', { 
          weekday: 'short', month: 'short', day: 'numeric' 
        }).format(date);
      case '1M':
      case '3M':
        return new Intl.DateTimeFormat('en-US', { 
          month: 'short', day: 'numeric' 
        }).format(date);
      case '6M':
      case '1Y':
        return new Intl.DateTimeFormat('en-US', { 
          month: 'short', year: 'numeric' 
        }).format(date);
      case 'ALL':
        return new Intl.DateTimeFormat('en-US', { 
          year: 'numeric' 
        }).format(date);
      default:
        return dateString;
    }
  };
  const fetchIntradayData = useCallback(async () => {
    if (!portfolioId || requestInProgress.current) return;
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    const exclSig = excludedTickers.slice().sort().join(',');

    // Duplicate request check remains the same
    if (
      lastRequest.current.portfolioId === portfolioId &&
      lastRequest.current.timeframe === timeframe &&
      lastRequest.current.exclusions === exclSig &&
      data.length > 0
    ) {
      console.log('Skipping duplicate intraday request');
      return;
    }

    requestInProgress.current = true;
    setLoading(true);
    setError(null);
    setNoDataAvailable(false);

    try {
      console.log(`Fetching intraday data for portfolio ${portfolioId} excluding:`, excludedTickers); // Log exclusions

      // --- Pass excludedTickers to the API call ---
      const responseData = await portfolioApi.getPortfolioIntraday(
          portfolioId,
          excludedTickers,
          today
      ) as IntradayResponse;
      // --- End Change ---

      // ... (rest of the function remains the same: checking response, processing data, setting state) ...

      if (!responseData || !responseData.data || !Array.isArray(responseData.data)) {
        setNoDataAvailable(true);
        setData([]);
         lastRequest.current = { portfolioId, timeframe, exclusions: exclSig };
        return;
      }

      const processedData = responseData.data.map(item => ({
        date: item.timestamp,
        value: ensureNumber(item.value),
        displayDate: formatDateForDisplay(item.timestamp, timeframe)
      }));

      //  let lastUniqueIndex = processedData.length - 1;
      //  if (lastUniqueIndex >=0) {
      //      const lastValue = processedData[lastUniqueIndex]?.value;
      //      while (lastUniqueIndex > 0 &&
      //             processedData[lastUniqueIndex - 1]?.value === lastValue) {
      //        lastUniqueIndex--;
      //      }
      //  } else {
      //      lastUniqueIndex = -1;
      //  }

      //  const filteredData = lastUniqueIndex < processedData.length - 1 && lastUniqueIndex !== -1
      //    ? [...processedData.slice(0, lastUniqueIndex + 1), processedData[processedData.length - 1]]
      //    : processedData;


      const dataToSet = processedData; // Use the unfiltered data
      console.log(`Setting chart data with ${dataToSet.length} points.`); // <-- Add this log
   console.log("First point:", dataToSet[0]);                          // <-- Add this log
   console.log("Last point:", dataToSet[dataToSet.length - 1]);       // <-- Add this log

      const hasValidData = dataToSet.some(item => item.value > 0);
      if (!hasValidData) {
        setNoDataAvailable(true);
        setData([]);
      } else {
        setData(dataToSet); // Set the data without the aggressive filtering
        setNoDataAvailable(false);
      }

      lastRequest.current = {
        portfolioId,
        timeframe,
        exclusions: exclSig,
      };
    } catch (error) {
      console.error('Failed to fetch intraday data:', error);
      setError('Failed to load intraday portfolio data.');
      lastRequest.current = { portfolioId, timeframe, exclusions: exclSig };
    } finally {
      setLoading(false);
      requestInProgress.current = false;
    }
  }, [portfolioId, timeframe, excludedTickers]); // Keep excludedTickers in dependency array

  // Enhanced fetch function with improved validation
  const fetchPortfolioHistory = useCallback(async () => {
    // Skip if we're already loading or if portfolio ID is missing
    if (!portfolioId || requestInProgress.current) return;
    const exclSig = excludedTickers.slice().sort().join(',');

    // Check if this is a duplicate request for the same data
    if (
      lastRequest.current.portfolioId === portfolioId &&
      lastRequest.current.timeframe === timeframe &&
      lastRequest.current.exclusions === exclSig &&
      data.length > 0
    ) {
      console.log('Skipping duplicate history request');
      return;
    }
    
    // Mark request as in progress
    requestInProgress.current = true;
    setLoading(true);
    setError(null);
    setNoDataAvailable(false);
    
    try {
      // Calculate date range based on timeframe
      const endDate = new Date().toISOString().split('T')[0]; // Today
      let startDate: string;
      let interval: 'daily' | 'weekly' | 'monthly' = 'daily';
      
      // Set startDate and interval based on timeframe
      switch (timeframe) {
        case '1D':
          startDate = endDate;
          break;
        case '5D':
          startDate = new Date(
            new Date().setDate(new Date().getDate() - 5)
          ).toISOString().split('T')[0];
          break;
        case '15D':
          startDate = new Date(
            new Date().setDate(new Date().getDate() - 15)
          ).toISOString().split('T')[0];
          break;
        case '1M':
          startDate = new Date(
            new Date().setMonth(new Date().getMonth() - 1)
          ).toISOString().split('T')[0];
          break;
        case '3M':
          startDate = new Date(
            new Date().setMonth(new Date().getMonth() - 3)
          ).toISOString().split('T')[0];
          break;
        case '6M':
          startDate = new Date(
            new Date().setMonth(new Date().getMonth() - 6)
          ).toISOString().split('T')[0];
          interval = 'weekly';
          break;
        case '1Y':
          startDate = new Date(
            new Date().setFullYear(new Date().getFullYear() - 1)
          ).toISOString().split('T')[0];
          interval = 'weekly';
          break;
        case 'ALL':
          startDate = new Date(
            new Date().setFullYear(new Date().getFullYear() - 5)
          ).toISOString().split('T')[0];
          interval = 'monthly';
          break;
        default:
          startDate = new Date(
            new Date().setDate(new Date().getDate() - 5)
          ).toISOString().split('T')[0];
      }
      
      // Log request info for debugging
      console.log(`Fetching history for portfolio ${portfolioId} from ${startDate} to ${endDate} (${interval})`);
      
      const response = await portfolioApi.getPortfolioPerformance(
        portfolioId,
        startDate,
        endDate,
        excludedTickers.length > 0 ? excludedTickers : undefined
      );
      
      if (!response || !response.data || !response.data.dates || !response.data.portfolioValues) {
        setNoDataAvailable(true);
        setData([]);
        return;
      }
      
      // Process the data to ensure all values are numeric
      const processedData = response.data.dates.map((date, index) => ({
        date,
        value: ensureNumber(response.data.portfolioValues[index]),
        displayDate: formatDateForDisplay(date, timeframe)
      })).filter(item => item.date);
      // Check for valid data
      const hasValidData = processedData.some(item => item.value > 0);
      
      if (!hasValidData) {
        setNoDataAvailable(true);
        setData([]);
      } else {
        setData(processedData);
        setNoDataAvailable(false);
      }
      
      // Update the last request ref
      lastRequest.current = {
        portfolioId,
        timeframe,
        exclusions: exclSig,
      };
    } catch (error) {
      console.error('Failed to fetch portfolio history:', error);
      setError('Failed to load portfolio history data.');
      
      // Reset last request on error
      lastRequest.current = {
        portfolioId,
        timeframe,
        exclusions: exclSig,
      };
    } finally {
      setLoading(false);
      requestInProgress.current = false;
    }
  }, [portfolioId, timeframe, excludedTickers]);

  // Effect to trigger fetch on dependencies change
  useEffect(() => {
    if (portfolioId) {
      console.log(`Triggering portfolio data fetch for ${portfolioId} with timeframe ${timeframe}`);
      
      // Use appropriate data fetch method based on timeframe
      if (timeframe === '1D') {
        fetchIntradayData();
      } else {
        fetchPortfolioHistory();
      }
    }
  }, [portfolioId, timeframe, fetchPortfolioHistory, fetchIntradayData]);

  // Helper function to format currency values
  const formatCurrency = (value: number): string => {
    if (value === undefined || isNaN(value)) {
      return '$0.00';
    }
    
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  // Calculate performance metrics with validation
  const calculatePerformance = () => {
    if (data.length < 2) return { change: 0, percentChange: 0 };
    
    // Get first and last valid values
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    
    // Validate values
    if (isNaN(firstValue) || isNaN(lastValue) || firstValue <= 0) {
      return { change: 0, percentChange: 0 };
    }
    
    const change = lastValue - firstValue;
    const percentChange = (change / firstValue) * 100;
    
    return { change, percentChange };
  };

  const { change, percentChange } = calculatePerformance();
  
  // Helper to determine if a date is a weekend
  const isWeekend = (date: string) => {
    const d = new Date(date);
    return !isNaN(d.getTime()) && (d.getDay() === 0 || d.getDay() === 6);
  };

  // Helper to determine if a time is after market hours
  const isAfterMarketHours = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    
    // Market closes at 4:00 PM ET (16:00)
    // Check if this time is after 16:00
    const hours = date.getUTCHours();
    return hours >= 20; // 4:00 PM ET is 20:00 UTC (during standard time)
  };

  // Custom tooltip component with improved validation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    const dataPoint = payload[0]?.payload;
    if (!dataPoint) return null;

    // --- Add console log for debugging ---
    // console.log("Tooltip Data:", {
    //     label: label, // What label is Recharts providing?
    //     payload: payload, // What's the full payload?
    //     dataPoint: dataPoint, // What's in the specific data point?
    //     displayTime: dataPoint.displayDate // What is the calculated displayDate?
    // });
    // --- End console log ---

    const displayTime = dataPoint.displayDate;
    const value = payload[0]?.value;
    const isWeekendDate = dataPoint.date && isWeekend(dataPoint.date);
    const isAfterHours = dataPoint.date && isAfterMarketHours(dataPoint.date);


    return (
      <div className="bg-white border border-gray-200 rounded-md p-2 shadow-sm">
         {/* Make sure you are definitely using displayTime here */}
        <div className="text-sm">Time: {displayTime}</div>
        <div className="text-sm font-medium">{typeof value === 'number' ? formatCurrency(value) : 'N/A'}</div>
        {/* ... other conditional text ... */}
      </div>
    );
  };

  // Function to handle timeframe button clicks
  const handleTimeframeChange = (newTimeframe: TimeframeType) => {
    if (newTimeframe === timeframe) return; // Skip if same timeframe
    setTimeframe(newTimeframe);
  };

  // Get the latest value for display
  const getLatestValue = () => {
    if (data.length === 0) return 0;
    const latest = data[data.length - 1]?.value;
    return typeof latest === 'number' && !isNaN(latest) ? latest : 0;
  };

  // Adjust tick formatting for X axis based on timeframe
  const formatXAxisTick = (value: string) => { // Now 'value' will be the ISO string (e.g., "2025-04-25T13:30:00.000Z")
    if (timeframe === '1D') {
      const date = new Date(value); // Parse the ISO string
      if (isNaN(date.getTime())) return ''; // Return empty string for invalid dates

      // Format to show hour in Eastern Time
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        // minute: 'numeric', // Optional: Add minutes if needed
        hour12: true,
        timeZone: 'America/New_York' // Ensure formatting uses ET
      }).format(date);
    }
    // For other timeframes, 'value' is likely the displayDate already,
    // but it might be safer to format based on the original 'date' prop if available
    // For simplicity, we'll assume the 'value' is okay for non-1D here.
    // If you see issues with other timeframes, adjust this part.
    return value;
  };

  // Configure X axis tick intervals
  const getXAxisTickInterval = () => {
    if (timeframe === '1D') {
      // For intraday data, show fewer ticks
      return 60; // Show a tick every 60 minutes (or data points)
    } else if (timeframe === '5D' || timeframe === '15D') {
      return 1;
    } else if (timeframe === '1M' || timeframe === '3M') {
      return 7;
    } else {
      return 30;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Portfolio Value</h3>
          {!loading && data.length > 0 && (
            <div className="text-sm">
              <span className="font-medium">
                {formatCurrency(getLatestValue())}
              </span>
              <span className={`ml-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{formatCurrency(Math.abs(change))} ({percentChange.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap space-x-1 text-sm">
          <button 
            className={`px-2 py-1 rounded ${timeframe === '1D' ? 'bg-blue-500 text-white' : 'text-blue-600'}`}
            onClick={() => handleTimeframeChange('1D')}
          >
            1D
          </button>
          <button 
            className={`px-2 py-1 rounded ${timeframe === '5D' ? 'bg-blue-500 text-white' : 'text-blue-600'}`}
            onClick={() => handleTimeframeChange('5D')}
          >
            5D
          </button>
          <button 
            className={`px-2 py-1 rounded ${timeframe === '15D' ? 'bg-blue-500 text-white' : 'text-blue-600'}`}
            onClick={() => handleTimeframeChange('15D')}
          >
            15D
          </button>
          <button 
            className={`px-2 py-1 rounded ${timeframe === '1M' ? 'bg-blue-500 text-white' : 'text-blue-600'}`}
            onClick={() => handleTimeframeChange('1M')}
          >
            1M
          </button>
          <button 
            className={`px-2 py-1 rounded ${timeframe === '3M' ? 'bg-blue-500 text-white' : 'text-blue-600'}`}
            onClick={() => handleTimeframeChange('3M')}
          >
            3M
          </button>
          <button 
            className={`px-2 py-1 rounded ${timeframe === '6M' ? 'bg-blue-500 text-white' : 'text-blue-600'}`}
            onClick={() => handleTimeframeChange('6M')}
          >
            6M
          </button>
          <button 
            className={`px-2 py-1 rounded ${timeframe === '1Y' ? 'bg-blue-500 text-white' : 'text-blue-600'}`}
            onClick={() => handleTimeframeChange('1Y')}
          >
            1Y
          </button>
          <button 
            className={`px-2 py-1 rounded ${timeframe === 'ALL' ? 'bg-blue-500 text-white' : 'text-blue-600'}`}
            onClick={() => handleTimeframeChange('ALL')}
          >
            ALL
          </button>
        </div>
      </div>
      
      <div className="h-[250px] w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-red-500">{error}</p>
            <button 
              className="mt-2 text-blue-500 underline"
              onClick={() => timeframe === '1D' ? fetchIntradayData() : fetchPortfolioHistory()}
            >
              Try Again
            </button>
          </div>
        ) : noDataAvailable || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No historical data available for this timeframe.</p>
            <p className="text-sm mt-2">This could be because the portfolio is new or price history hasn't been recorded yet.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="displayDate"  // Change this from "date" to "displayDate"
                stroke="#6B7280"
                tick={{ fill: '#374151' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
                tickMargin={10}
                minTickGap={timeframe === '1D' ? 80 : 30}
                interval={getXAxisTickInterval()}  // This is fine, the function exists
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
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false} // Simplified: don't show dots for cleaner visuals
                activeDot={{ r: 6, fill: '#2563eb', stroke: 'white', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        {timeframe === '1D' 
          ? "This chart shows minute-by-minute portfolio value throughout the trading day." 
          : "This chart shows total portfolio value over time, including deposits and withdrawals."}
      </div>
    </div>
  );
};