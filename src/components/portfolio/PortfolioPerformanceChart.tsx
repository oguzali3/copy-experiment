// Fixed PortfolioPerformanceChart.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine,
  ResponsiveContainer 
} from 'recharts';
import portfolioApi from '@/services/portfolioApi';
import { Loader2 } from 'lucide-react';
import { Portfolio } from './types';
import { ensureNumber } from '@/utils/portfolioDataUtils';

interface PortfolioPerformanceChartProps {
  portfolioId: string;
  className?: string;
  portfolio?: Portfolio;
  onUpdatePortfolio?: (portfolio: Portfolio) => void;
  excludedTickers?: string[]; // Add this line
}

// Defining timeframe type with additional short timeframes
type TimeframeType = '1D' | '5D' | '15D' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

export const PortfolioPerformanceChart = ({ 
  portfolioId,
  className = '',
  portfolio,
  onUpdatePortfolio,
  excludedTickers = []
}: PortfolioPerformanceChartProps) => {
  // Update default timeframe and add the new timeframe options
  const [timeframe, setTimeframe] = useState<TimeframeType>('5D');
  const [data, setData] = useState<Array<{
    date: string;
    performanceValue: number;
    performancePercent: number;
    displayDate: string;
  }>>([]);
  const [showPercent, setShowPercent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noDataAvailable, setNoDataAvailable] = useState(false);
  
  // Use a ref to track if a request is in progress to prevent duplicate requests
  const requestInProgress = useRef(false);
  
  // Keep track of last portfolio and timeframe to prevent unnecessary refetching
  const lastRequest = useRef<{
    portfolioId: string | null;
     timeframe: TimeframeType | null;
     exclusions: string;           // ← new
  }>({
     portfolioId: null,
     timeframe:  null,
     exclusions: '',               // canonicalised list
    });

  // Helper function to format dates based on timeframe
  const formatDateForDisplay = useCallback((dateString: string, tf: TimeframeType): string => {
    const date = new Date(dateString);
    
    switch (tf) {
      case '1D':
        // Format as "10:30 AM"
        return new Intl.DateTimeFormat('en-US', { 
          hour: 'numeric', 
          minute: 'numeric',
          hour12: true
        }).format(date);
      case '5D':
      case '15D':
        // Format as "Mar 10" or with weekday for shorter periods
        return new Intl.DateTimeFormat('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }).format(date);
      case '1M':
      case '3M':
        // Format as "Apr 15"
        return new Intl.DateTimeFormat('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }).format(date);
      case '6M':
      case '1Y':
        // Format as "Apr 2023"
        return new Intl.DateTimeFormat('en-US', { 
          month: 'short', 
          year: 'numeric' 
        }).format(date);
      case 'ALL':
        // Format as "2023"
        return new Intl.DateTimeFormat('en-US', { 
          year: 'numeric' 
        }).format(date);
      default:
        return dateString;
    }
  }, []);

  // Function to fetch portfolio performance data
  const fetchPortfolioPerformance = useCallback(async () => {
    // Skip if we're already loading or if portfolio ID is missing
    if (!portfolioId || requestInProgress.current) return;
    
    const exclSig = excludedTickers.slice().sort().join(',');   // e.g. "AAPL,AMZN"
    if (
      lastRequest.current.portfolioId === portfolioId &&
      lastRequest.current.timeframe  === timeframe &&
      lastRequest.current.exclusions === exclSig &&
      data.length > 0
    ) {
      console.log('Skipping duplicate performance request');
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
      
      switch (timeframe) {
        case '1D':
          // Today only
          startDate = endDate;
          break;
        case '5D':
          // 5 days ago
          startDate = new Date(
            new Date().setDate(new Date().getDate() - 5)
          ).toISOString().split('T')[0];
          break;
        case '15D':
          // 15 days ago
          startDate = new Date(
            new Date().setDate(new Date().getDate() - 15)
          ).toISOString().split('T')[0];
          break;
        case '1M':
          // 1 month ago
          startDate = new Date(
            new Date().setMonth(new Date().getMonth() - 1)
          ).toISOString().split('T')[0];
          break;
        case '3M':
          // 3 months ago
          startDate = new Date(
            new Date().setMonth(new Date().getMonth() - 3)
          ).toISOString().split('T')[0];
          break;
        case '6M':
          // 6 months ago
          startDate = new Date(
            new Date().setMonth(new Date().getMonth() - 6)
          ).toISOString().split('T')[0];
          break;
        case '1Y':
          // 1 year ago
          startDate = new Date(
            new Date().setFullYear(new Date().getFullYear() - 1)
          ).toISOString().split('T')[0];
          break;
        case 'ALL':
          // 5 years ago or from beginning
          startDate = new Date(
            new Date().setFullYear(new Date().getFullYear() - 5)
          ).toISOString().split('T')[0];
          break;
        default:
          startDate = new Date(
            new Date().setDate(new Date().getDate() - 5)
          ).toISOString().split('T')[0];
      }
      console.log(`Fetching portfolio performance with excluded tickers:`, excludedTickers);

      // Fetch performance data from API
      const response = await portfolioApi.getPortfolioPerformance(
        portfolioId,
        startDate,
        endDate,
        excludedTickers.length > 0 ? excludedTickers : undefined
      );
      
      if (!response || !response.data) {
        setNoDataAvailable(true);
        setData([]);
        return;
      }
      
      // Extract and process the data
      const { dates, portfolioValues, performanceValues, performancePercent } = response.data;
      
      // Check if we actually have non-zero performance data
      const hasNonZeroData = 
        performanceValues.some(val => ensureNumber(val) !== 0) || 
        performancePercent.some(val => ensureNumber(val) !== 0);
      
      if (!hasNonZeroData) {
        setNoDataAvailable(true);
        setData([]);
      } else {
        // Filter out points with invalid data and create dataset
        const validDataPoints = dates.map((date, index) => ({
          date,
          performanceValue: ensureNumber(performanceValues[index]),
          performancePercent: ensureNumber(performancePercent[index]),
          displayDate: formatDateForDisplay(date, timeframe)
        })).filter(point => {
          // Only include points with valid date
          return point.date;
        });
        
        // Only update state if we have valid data
        if (validDataPoints.length > 0) {
          setData(validDataPoints);
          setNoDataAvailable(false);
          
          // If we have updated portfolio data, use it to update the portfolio
          if (validDataPoints.length > 0 && portfolio && onUpdatePortfolio) {
            const latestPoint = validDataPoints[validDataPoints.length - 1];
            const latestValue = portfolioValues[portfolioValues.length - 1];
            const previousValue = portfolioValues.length > 1 ? portfolioValues[portfolioValues.length - 2] : portfolioValues[0];
            
            // Check if there's a significant difference in values
            if (Math.abs(latestValue - ensureNumber(portfolio.totalValue)) > 0.5) {
              console.log(`Performance data shows updated value: ${latestValue} vs current ${portfolio.totalValue}`);
              
              // Create updated portfolio with the latest value
              const updatedPortfolio = {
                ...portfolio,
                totalValue: latestValue,
                previousDayValue: previousValue,
                dayChange: latestValue - previousValue,
                dayChangePercent: previousValue > 0 ? ((latestValue - previousValue) / previousValue) * 100 : 0
              };
              
              // Call the update function
              console.log("Updating portfolio with latest performance data");
              onUpdatePortfolio(updatedPortfolio);
            }
          }
        } else {
          setNoDataAvailable(true);
          setData([]);
        }
      }
      
      // Update the last request ref
      lastRequest.current = {
        portfolioId,
        timeframe,
        exclusions: exclSig,

      };
    } catch (err) {
      console.error('Failed to fetch portfolio performance:', err);
      setError('Failed to load portfolio performance data.');
      
      // Reset last request on error
      lastRequest.current = {
        portfolioId: null,
        timeframe: null,
        exclusions: exclSig,
      };
    } finally {
      setLoading(false);
      requestInProgress.current = false;
    }
  }, [portfolioId, timeframe, data.length, excludedTickers, formatDateForDisplay, portfolio, onUpdatePortfolio]);

  useEffect(() => {
    if (portfolio && timeframe === '1D' && portfolio.totalValue > 0) {
      // For 1D timeframe, we can derive performance data from the portfolio itself
      
      // Convert values to numbers to ensure consistency
      const totalInvestment = portfolio.stocks.reduce((sum, stock) => 
        sum + (ensureNumber(stock.shares) * ensureNumber(stock.avgPrice)), 0);
      const currentValue = ensureNumber(portfolio.totalValue);
      
      if (currentValue > 0 && totalInvestment > 0) {
        // Calculate performance
        const performanceValue = currentValue - totalInvestment;
        const performancePercent = (performanceValue / totalInvestment) * 100;
        
        // Create a single-point dataset for today
        const today = new Date().toISOString().split('T')[0];
        
        const chartData = [
          {
            date: today,
            performanceValue,
            performancePercent,
            displayDate: formatDateForDisplay(today, timeframe)
          }
        ];
        
        setData(chartData);
        setNoDataAvailable(false);
        const exclSig = excludedTickers.slice().sort().join(',');   // e.g. "AAPL,AMZN"

        // Update the last request ref
        lastRequest.current = {
          portfolioId,
          timeframe,
          exclusions: exclSig,
        };
        
        // Don't proceed with API fetch
        return;
      }
    }
    
    // Otherwise, proceed with normal API fetch
    fetchPortfolioPerformance();
  }, [portfolio, portfolioId, timeframe, excludedTickers, fetchPortfolioPerformance, formatDateForDisplay]);

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

  const formatPercent = (value: number): string => {
    if (value === undefined || isNaN(value)) {
      return '0.00%';
    }
    
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Get current performance value
  const currentPerformance = data.length > 0 ? data[data.length - 1] : null;
  
  const isWeekend = (date: string) => {
    const d = new Date(date);
    return d.getDay() === 0 || d.getDay() === 6;
  };
  
  // Custom tooltip component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }
    
    const dataPoint = payload[0].payload;
    const isWeekendDate = dataPoint && isWeekend(dataPoint.date);
    
    return (
      <div className="bg-white border border-gray-200 rounded-md p-2 shadow-sm">
        <div className="text-sm">Date: {label}</div>
        <div className="text-sm font-medium">
          {showPercent 
            ? `${payload[0].value.toFixed(2)}%` 
            : formatCurrency(payload[0].value)
          }
        </div>
        {isWeekendDate && (
          <div className="text-xs text-gray-500">
            Weekend value (based on Friday's data)
          </div>
        )}
      </div>
    );
  };
  
  // Function to handle timeframe button clicks
  const handleTimeframeChange = (newTimeframe: TimeframeType) => {
    if (newTimeframe === timeframe) return; // Skip if same timeframe
    
    // Update timeframe state - will trigger useEffect
    setTimeframe(newTimeframe);
  };
  
  // Calculate latest performance
  const getLatestPerformance = () => {
    if (!currentPerformance) return { value: 0, percent: 0 };
    
    return {
      value: currentPerformance.performanceValue,
      percent: currentPerformance.performancePercent
    };
  };
  
  const { value, percent } = getLatestPerformance();
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Portfolio Performance</h3>
          {!loading && currentPerformance && (
            <div className="text-sm">
              <span className={`font-medium ${percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {showPercent 
                  ? formatPercent(percent)
                  : formatCurrency(value)
                }
              </span>
              <button 
                className="ml-2 text-xs text-blue-500 underline"
                onClick={() => setShowPercent(!showPercent)}
              >
                Show {showPercent ? 'Value' : 'Percent'}
              </button>
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
              onClick={() => fetchPortfolioPerformance()} // This will trigger a retry
            >
              Try Again
            </button>
          </div>
        ) : noDataAvailable || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No performance data available for this timeframe.</p>
            <p className="text-sm mt-2">This could be because the portfolio is new or hasn't experienced price changes yet.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="displayDate"
                stroke="#6B7280"
                tick={{ fill: '#374151' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
                tickMargin={10}
                minTickGap={30}
              />
              <YAxis
                stroke="#6B7280"
                tick={{ fill: '#374151' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
                tickFormatter={(value) => showPercent ? `${value}%` : formatCurrency(value)}
                domain={['auto', 'auto']}
                tickMargin={10}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine 
                y={0} 
                stroke="#9CA3AF" 
                strokeDasharray="3 3" 
              />
              <Line
                type="monotone"
                dataKey={showPercent ? "performancePercent" : "performanceValue"}
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#10B981', stroke: 'white', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        This chart shows true portfolio performance excluding the effect of deposits and withdrawals.
      </div>
    </div>
  );
};