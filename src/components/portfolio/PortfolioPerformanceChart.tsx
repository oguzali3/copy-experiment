// Modified code for PortfolioPerformanceChart.tsx to filter non-trading days for all timeframes

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
  excludedTickers?: string[];
}

type TimeframeType = '1D' | '5D' | '15D' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

export const PortfolioPerformanceChart = ({ 
  portfolioId,
  className = '',
  portfolio,
  onUpdatePortfolio,
  excludedTickers = []
}: PortfolioPerformanceChartProps) => {
  const [timeframe, setTimeframe] = useState<TimeframeType>('5D');
  const [data, setData] = useState<Array<{
    date: string;
    performanceValue: number;
    performancePercent: number;
    displayDate: string;
    isMarketClosed?: boolean;
    isBeforeNonTrading?: boolean; // Flag for points before non-trading periods
    isAfterNonTrading?: boolean;  // Flag for points after non-trading periods
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noDataAvailable, setNoDataAvailable] = useState(false);
  
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

  // Helper function to determine if a date is a weekend
  const isWeekend = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.getDay() === 0 || date.getDay() === 6; // 0 = Sunday, 6 = Saturday
  }, []);

  // Helper function to determine if a date is a US market holiday
  const isHoliday = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // New Year's Day (observed on Monday if Jan 1 is Sunday)
    if ((month === 0 && day === 1) || 
        (month === 0 && day === 2 && date.getDay() === 1)) return true;
    
    // Martin Luther King Jr. Day (3rd Monday in January)
    if (month === 0 && date.getDay() === 1 && day >= 15 && day <= 21) return true;
    
    // Presidents Day (3rd Monday in February)
    if (month === 1 && date.getDay() === 1 && day >= 15 && day <= 21) return true;
    
    // Memorial Day (last Monday in May)
    if (month === 4 && date.getDay() === 1 && day >= 25) return true;
    
    // Juneteenth (June 19, observed on Monday if falls on Sunday, Friday if falls on Saturday)
    if ((month === 5 && day === 19) || 
        (month === 5 && day === 20 && date.getDay() === 1) || 
        (month === 5 && day === 18 && date.getDay() === 5)) return true;
    
    // Independence Day (July 4, observed accordingly)
    if ((month === 6 && day === 4) || 
        (month === 6 && day === 5 && date.getDay() === 1) || 
        (month === 6 && day === 3 && date.getDay() === 5)) return true;
    
    // Labor Day (1st Monday in September)
    if (month === 8 && date.getDay() === 1 && day <= 7) return true;
    
    // Thanksgiving (4th Thursday in November)
    if (month === 10 && date.getDay() === 4 && day >= 22 && day <= 28) return true;
    
    // Christmas (December 25, observed accordingly)
    if ((month === 11 && day === 25) || 
        (month === 11 && day === 26 && date.getDay() === 1) || 
        (month === 11 && day === 24 && date.getDay() === 5)) return true;
    
    return false;
  }, []);

  // Combined function to check if markets are closed for a given date
  const isMarketClosed = useCallback((dateString: string) => {
    return isWeekend(dateString) || isHoliday(dateString);
  }, [isWeekend, isHoliday]);

  const formatDateForDisplay = useCallback((dateString: string, tf: TimeframeType): string => {
    const date = new Date(dateString);
    
    switch (tf) {
      case '1D':
        return new Intl.DateTimeFormat('en-US', { 
          hour: 'numeric', 
          minute: 'numeric',
          hour12: true
        }).format(date);
      case '5D':
      case '15D':
        return new Intl.DateTimeFormat('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }).format(date);
      case '1M':
      case '3M':
        return new Intl.DateTimeFormat('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }).format(date);
      case '6M':
      case '1Y':
        return new Intl.DateTimeFormat('en-US', { 
          month: 'short', 
          year: 'numeric' 
        }).format(date);
      case 'ALL':
        return new Intl.DateTimeFormat('en-US', { 
          year: 'numeric' 
        }).format(date);
      default:
        return dateString;
    }
  }, []);

  const fetchPortfolioPerformance = useCallback(async () => {
    if (!portfolioId || requestInProgress.current) return;
    
    const exclSig = excludedTickers.slice().sort().join(',');
    if (
      lastRequest.current.portfolioId === portfolioId &&
      lastRequest.current.timeframe === timeframe &&
      lastRequest.current.exclusions === exclSig &&
      data.length > 0
    ) {
      console.log('Skipping duplicate performance request');
      return;
    }
    
    requestInProgress.current = true;
    setLoading(true);
    setError(null);
    setNoDataAvailable(false);
    
    try {
      const endDate = new Date().toISOString().split('T')[0];
      let startDate: string;
      
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
          break;
        case '1Y':
          startDate = new Date(
            new Date().setFullYear(new Date().getFullYear() - 1)
          ).toISOString().split('T')[0];
          break;
        case 'ALL':
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
      
      const { dates, portfolioValues, performanceValues, performancePercent } = response.data;
      
      const hasNonZeroData = 
        performanceValues.some(val => ensureNumber(val) !== 0) || 
        performancePercent.some(val => ensureNumber(val) !== 0);
      
      if (!hasNonZeroData) {
        setNoDataAvailable(true);
        setData([]);
      } else {
        // First create dataset with market closed flag
        const initialDataPoints = dates.map((date, index) => ({
          date,
          performanceValue: ensureNumber(performanceValues[index]),
          performancePercent: ensureNumber(performancePercent[index]),
          displayDate: formatDateForDisplay(date, timeframe),
          isMarketClosed: isMarketClosed(date)
        }));
        
        // Filter out market closed days
        const tradingDays = initialDataPoints.filter(point => !point.isMarketClosed);
        
        if (tradingDays.length === 0) {
          setNoDataAvailable(true);
          setData([]);
          return;
        }
        
        // Now mark points before/after non-trading periods
        const dataPointsWithFlags = tradingDays.map((point, index, array) => {
          if (index === 0) {
            return { ...point, isAfterNonTrading: true };
          }
          
          if (index === array.length - 1) {
            return { ...point, isBeforeNonTrading: true };
          }
          
          // Check if there's a gap between this point and the previous one
          const currentDate = new Date(point.date);
          const prevDate = new Date(array[index - 1].date);
          
          // Calculate day difference (more than 1 day means non-trading days in between)
          const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Check if there's a gap before the next point
          const nextDate = new Date(array[index + 1].date);
          const nextDayDiff = Math.floor((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            ...point,
            isAfterNonTrading: dayDiff > 1,
            isBeforeNonTrading: nextDayDiff > 1
          };
        });
        
        if (dataPointsWithFlags.length > 0) {
          setData(dataPointsWithFlags);
          setNoDataAvailable(false);
          
          if (portfolio && onUpdatePortfolio) {
            const latestPoint = dataPointsWithFlags[dataPointsWithFlags.length - 1];
            const latestValue = portfolioValues[portfolioValues.length - 1];
            const previousValue = portfolioValues.length > 1 ? portfolioValues[portfolioValues.length - 2] : portfolioValues[0];
            
            if (Math.abs(latestValue - ensureNumber(portfolio.totalValue)) > 0.5) {
              console.log(`Performance data shows updated value: ${latestValue} vs current ${portfolio.totalValue}`);
              
              const updatedPortfolio = {
                ...portfolio,
                totalValue: latestValue,
                previousDayValue: previousValue,
                dayChange: latestValue - previousValue,
                dayChangePercent: previousValue > 0 ? ((latestValue - previousValue) / previousValue) * 100 : 0
              };
              
              console.log("Updating portfolio with latest performance data");
              onUpdatePortfolio(updatedPortfolio);
            }
          }
        } else {
          setNoDataAvailable(true);
          setData([]);
        }
      }
      
      lastRequest.current = {
        portfolioId,
        timeframe,
        exclusions: exclSig,
      };
    } catch (err) {
      console.error('Failed to fetch portfolio performance:', err);
      setError('Failed to load portfolio performance data.');
      
      lastRequest.current = {
        portfolioId: null,
        timeframe: null,
        exclusions: exclSig,
      };
    } finally {
      setLoading(false);
      requestInProgress.current = false;
    }
  }, [portfolioId, timeframe, data.length, excludedTickers, formatDateForDisplay, portfolio, onUpdatePortfolio, isMarketClosed]);

  useEffect(() => {
    if (portfolio && timeframe === '1D' && portfolio.totalValue > 0) {
      const totalInvestment = portfolio.stocks.reduce((sum, stock) => 
        sum + (ensureNumber(stock.shares) * ensureNumber(stock.avgPrice)), 0);
      const currentValue = ensureNumber(portfolio.totalValue);
      
      if (currentValue > 0 && totalInvestment > 0) {
        const performanceValue = currentValue - totalInvestment;
        const performancePercent = (performanceValue / totalInvestment) * 100;
        
        const today = new Date().toISOString().split('T')[0];
        
        const chartData = [
          {
            date: today,
            performanceValue,
            performancePercent,
            displayDate: formatDateForDisplay(today, timeframe),
            isMarketClosed: isMarketClosed(today)
          }
        ];
        
        setData(chartData);
        setNoDataAvailable(false);
        const exclSig = excludedTickers.slice().sort().join(',');

        lastRequest.current = {
          portfolioId,
          timeframe,
          exclusions: exclSig,
        };
        
        return;
      }
    }
    
    fetchPortfolioPerformance();
  }, [portfolio, portfolioId, timeframe, excludedTickers, fetchPortfolioPerformance, formatDateForDisplay, isMarketClosed]);

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

  const currentPerformance = data.length > 0 ? data[data.length - 1] : null;
  
  // Custom tooltip component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }
    
    const dataPoint = payload[0].payload;
    
    return (
      <div className="bg-white border border-gray-200 rounded-md p-2 shadow-sm">
        <div className="text-sm">Date: {dataPoint.displayDate}</div>
        <div className="text-sm font-medium">
            ${payload[0].value.toFixed(2)}%
        </div>
        {(dataPoint.isBeforeNonTrading || dataPoint.isAfterNonTrading) && (
          <div className="text-xs text-gray-500">
            {dataPoint.isBeforeNonTrading && dataPoint.isAfterNonTrading 
              ? 'Trading day surrounded by non-trading days'
              : dataPoint.isBeforeNonTrading 
                ? 'Last trading day before weekend/holiday' 
                : 'First trading day after weekend/holiday'}
          </div>
        )}
      </div>
    );
  };
  
  const handleTimeframeChange = (newTimeframe: TimeframeType) => {
    if (newTimeframe === timeframe) return;
    setTimeframe(newTimeframe);
  };
  
  const getLatestPerformance = () => {
    if (!currentPerformance) return { value: 0, percent: 0 };
    
    return {
      value: currentPerformance.performanceValue,
      percent: currentPerformance.performancePercent
    };
  };
  
  const { value, percent } = getLatestPerformance();

  // Custom dot component to show special dots before/after non-trading days
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomDot = (props: any) => {
    const { cx, cy, payload, value } = props;
    
    // For active dots (when hovering), use a larger dot
    if (props.active) {
      return (
        <circle 
          cx={cx} 
          cy={cy} 
          r={6} 
          fill="#10B981" 
          stroke="white" 
          strokeWidth={2} 
        />
      );
    }
    
    // Show smaller dots for points before/after non-trading days
    if (payload.isBeforeNonTrading || payload.isAfterNonTrading) {
      return (
        <circle 
          cx={cx} 
          cy={cy} 
          r={2} 
          fill="#10B981" 
          opacity={0.6}
        />
      );
    }
    
    // No dots for regular points
    return null;
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Portfolio Performance</h3>
          {!loading && currentPerformance && (
            <div className="text-sm">
              <span className={`font-medium ${percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(percent)}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap space-x-1 text-sm">
          
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
              onClick={() => fetchPortfolioPerformance()}
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
                tickFormatter={(value) => `${value}%`}
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
                dataKey="performancePercent"
                stroke="#10B981"
                strokeWidth={2}
                dot={CustomDot}
                activeDot={{ r: 6, fill: "#10B981", stroke: "white", strokeWidth: 2 }}
                connectNulls={true}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        This chart shows true portfolio performance excluding the effect of deposits and withdrawals.
        Non-trading days (weekends and holidays) are excluded from the chart.
        Small dots indicate trading days before or after weekends/holidays.
      </div>
    </div>
  );
};