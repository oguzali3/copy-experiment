import { useState, useEffect, useRef, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
  // Removed ReferenceLine as it's not used here
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

// --- Update data state type to include flags for dots ---
interface ChartDataPoint {
    date: string; // Keep original date string (ISO format likely) for calculations/axis
    value: number;
    displayDate: string; // Formatted date/time for display (e.g., tooltip)
    // Flags for non-trading day adjacency (only relevant for > 1D timeframes)
    isBeforeNonTrading?: boolean;
    isAfterNonTrading?: boolean;
}


export const PortfolioValueChart = ({
  portfolioId,
  className = '',
  portfolio,
  onUpdatePortfolio,
  excludedTickers = []
}: PortfolioValueChartProps) => {
  // State definitions
  const [timeframe, setTimeframe] = useState<TimeframeType>('5D');
  const [data, setData] = useState<ChartDataPoint[]>([]); // Use updated type
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

   // --- Use shared isWeekend, isHoliday, isMarketClosed helpers if defined elsewhere ---
   // --- Or copy them from PortfolioPerformanceChart if needed ---
   const isWeekend = useCallback((dateString: string) => {
       if (!dateString || typeof dateString !== 'string' || !dateString.match(/^\d{4}-\d{2}-\d{2}/)) return false;
       try { const date = new Date(dateString + 'T00:00:00Z'); return date.getUTCDay() === 0 || date.getUTCDay() === 6; }
       catch (e) { return false; }
   }, []);

   const isHoliday = useCallback((dateString: string) => {
      // (Keep the existing robust holiday logic here - same as in Performance chart)
      if (!dateString || typeof dateString !== 'string' || !dateString.match(/^\d{4}-\d{2}-\d{2}/)) return false;
      try { /* ... holiday check logic ... */
          const date = new Date(dateString + 'T00:00:00Z'); // Assuming UTC dates
          const year = date.getUTCFullYear(); const month = date.getUTCMonth(); const day = date.getUTCDate(); const dayOfWeek = date.getUTCDay();
          const isNthWeekdayOfMonth = (n: number, weekday: number, m: number, d: number, dow: number) => (month === m && dayOfWeek === weekday && Math.floor((d - 1) / 7) === (n - 1));
          if ((month === 0 && day === 1) || (month === 0 && day === 2 && dayOfWeek === 1) || (month === 11 && day === 31 && dayOfWeek === 5 && new Date(`${year}-01-01T00:00:00Z`).getUTCDay() === 6)) return true; // New Year
          if ((month === 5 && day === 19) || (month === 5 && day === 20 && dayOfWeek === 1) || (month === 5 && day === 18 && dayOfWeek === 5 && new Date(`${year}-06-19T00:00:00Z`).getUTCDay() === 6)) return true; // Juneteenth
          if ((month === 6 && day === 4) || (month === 6 && day === 5 && dayOfWeek === 1) || (month === 6 && day === 3 && dayOfWeek === 5 && new Date(`${year}-07-04T00:00:00Z`).getUTCDay() === 6)) return true; // Independence Day
          if ((month === 11 && day === 25) || (month === 11 && day === 26 && dayOfWeek === 1) || (month === 11 && day === 24 && dayOfWeek === 5 && new Date(`${year}-12-25T00:00:00Z`).getUTCDay() === 6)) return true; // Christmas
          if (isNthWeekdayOfMonth(3, 1, 0, day, dayOfWeek)) return true; // MLK Jr. Day
          if (isNthWeekdayOfMonth(3, 1, 1, day, dayOfWeek)) return true; // Presidents Day
          if (year === 2025 && month === 3 && day === 18 && dayOfWeek === 5) return true; // Good Friday 2025 Placeholder
          if (month === 4 && dayOfWeek === 1) { const next = new Date(date); next.setUTCDate(day + 7); if (next.getUTCMonth() !== 4) return true; } // Memorial Day
          if (isNthWeekdayOfMonth(1, 1, 8, day, dayOfWeek)) return true; // Labor Day
          if (isNthWeekdayOfMonth(4, 4, 10, day, dayOfWeek)) return true; // Thanksgiving
          return false;
        } catch (e) { return false; }
   }, []);

   const isMarketClosed = useCallback((dateString: string) => {
     // Only considers full days closed, not intraday market hours for this check
     return isWeekend(dateString.split('T')[0]) || isHoliday(dateString.split('T')[0]);
   }, [isWeekend, isHoliday]);
   // --- End Helpers ---


  const formatDateForDisplay = useCallback((dateString: string, tf: TimeframeType): string => {
    // This function now primarily formats for the TOOLTIP display
    // The axis formatting is handled separately by formatXAxisTick
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid date
    }

    switch (tf) {
      case '1D': // Intraday: Show Time HH:MM AM/PM ET
        return new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          timeZone: 'America/New_York'
        }).format(date);
      case '5D':
      case '15D': // Short term: Show Weekday Mon D
        return new Intl.DateTimeFormat('en-US', {
           month: 'short', day: 'numeric' // Simpler format consistent with performance chart
        }).format(date);
      case '1M':
      case '3M': // Medium term: Show Mon D
        return new Intl.DateTimeFormat('en-US', {
          month: 'short', day: 'numeric'
        }).format(date);
      case '6M':
      case '1Y': // Longer term: Show Mon YYYY
        return new Intl.DateTimeFormat('en-US', {
          month: 'short', year: 'numeric'
        }).format(date);
      case 'ALL': // Longest term: Show YYYY (or Mon YYYY)
        return new Intl.DateTimeFormat('en-US', {
          month: 'short', year: 'numeric' // Match performance chart 'ALL'
        }).format(date);
      default:
        // Fallback: ISO Date part
        return dateString.split('T')[0];
    }
  }, []); // Added tf to dependency array


  const fetchIntradayData = useCallback(async () => {
    // (Keep existing logic, but ensure data structure matches ChartDataPoint without flags)
    if (!portfolioId || requestInProgress.current) return;
    const today = new Date().toISOString().split('T')[0];
    const exclSig = excludedTickers.slice().sort().join(',');
    if (lastRequest.current.portfolioId === portfolioId && lastRequest.current.timeframe === timeframe && lastRequest.current.exclusions === exclSig && data.length > 0 ) {
        console.log('Skipping duplicate intraday request'); return;
    }

    requestInProgress.current = true; setLoading(true); setError(null); setNoDataAvailable(false);

    try {
        console.log(`Workspaceing intraday data for portfolio ${portfolioId} excluding:`, excludedTickers);
        const responseData = await portfolioApi.getPortfolioIntraday(portfolioId, excludedTickers, today) as IntradayResponse;

        if (!responseData || !responseData.data || !Array.isArray(responseData.data)) {
            setNoDataAvailable(true); setData([]); lastRequest.current = { portfolioId, timeframe, exclusions: exclSig }; return;
        }

        // Map to ChartDataPoint structure (flags will be undefined)
        const processedData: ChartDataPoint[] = responseData.data.map(item => ({
            date: item.timestamp, // Keep original timestamp
            value: ensureNumber(item.value),
            displayDate: formatDateForDisplay(item.timestamp, timeframe), // Format for tooltip
            // isBeforeNonTrading/isAfterNonTrading remain undefined for 1D
        }));

        const hasValidData = processedData.some(item => item.value > 0);
        if (!hasValidData) {
            setNoDataAvailable(true); setData([]);
        } else {
            setData(processedData); setNoDataAvailable(false);
        }
        lastRequest.current = { portfolioId, timeframe, exclusions: exclSig };
    } catch (error) {
        console.error('Failed to fetch intraday data:', error); setError('Failed to load intraday portfolio data.');
        lastRequest.current = { portfolioId: null, timeframe: null, exclusions: '' }; // Reset on error
    } finally {
        setLoading(false); requestInProgress.current = false;
    }
  }, [portfolioId, timeframe, excludedTickers, formatDateForDisplay]); // Added formatDateForDisplay dependency


  // --- Modify fetchPortfolioHistory to add flags ---
  const fetchPortfolioHistory = useCallback(async () => {
    if (!portfolioId || requestInProgress.current) return;
    const exclSig = excludedTickers.slice().sort().join(',');
    if ( lastRequest.current.portfolioId === portfolioId && lastRequest.current.timeframe === timeframe && lastRequest.current.exclusions === exclSig && data.length > 0 ) {
       console.log('Skipping duplicate history request'); return;
    }

    requestInProgress.current = true; setLoading(true); setError(null); setNoDataAvailable(false);

    try {
       const endDate = new Date().toISOString().split('T')[0];
       let startDate: string; // interval removed as API determines it based on range? Check API docs.
       // Use slightly larger buffers to ensure we capture the *real* start date if it falls just outside the nominal range
       switch (timeframe) {
            case '5D': startDate = new Date(new Date().setDate(new Date().getDate() - 10)).toISOString().split('T')[0]; break; // Wider buffer
            case '15D': startDate = new Date(new Date().setDate(new Date().getDate() - 25)).toISOString().split('T')[0]; break; // Wider buffer
            case '1M': startDate = new Date(new Date().setMonth(new Date().getMonth() - 1, new Date().getDate() - 7)).toISOString().split('T')[0]; break; // Buffer days too
            case '3M': startDate = new Date(new Date().setMonth(new Date().getMonth() - 3, new Date().getDate() - 7)).toISOString().split('T')[0]; break;
            case '6M': startDate = new Date(new Date().setMonth(new Date().getMonth() - 6, new Date().getDate() - 7)).toISOString().split('T')[0]; break;
            case '1Y': startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate() - 7)).toISOString().split('T')[0]; break;
            case 'ALL': startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 10)).toISOString().split('T')[0]; break; // Fetch more for ALL if needed
            default: startDate = new Date(new Date().setDate(new Date().getDate() - 10)).toISOString().split('T')[0];
        }

       console.log(`Workspaceing history for portfolio ${portfolioId} from ${startDate} to ${endDate} (Timeframe: ${timeframe})`);
       // Assuming getPortfolioPerformance returns dates and portfolioValues
       const response = await portfolioApi.getPortfolioPerformance(portfolioId, startDate, endDate, excludedTickers.length > 0 ? excludedTickers : undefined);

       if (!response || !response.data || !response.data.dates || !response.data.portfolioValues || response.data.dates.length === 0) {
            console.log('No history data returned from API or data structure invalid.');
            setNoDataAvailable(true); setData([]); return;
        }

       // 1. Create initial dataset with value and market closed flag
       const initialDataPoints = response.data.dates
           .map((date, index) => ({
               date, // Keep original date string
               value: ensureNumber(response.data.portfolioValues[index]),
               isMarketClosed: isMarketClosed(date.split('T')[0]) // Check based on date part
           }))
           .filter(item => item.date && typeof item.value === 'number'); // Ensure date exists and value is a number

       // 2. Filter out non-trading days
       const tradingDays = initialDataPoints.filter(point => !point.isMarketClosed);

       if (tradingDays.length === 0) {
            console.log('No trading days found in the fetched history range.');
            setNoDataAvailable(true); setData([]); return;
        }

       // --- START: Added Logic to find first non-zero value day ---
       // 3. Find the index of the first trading day with a non-zero portfolio value
       const firstNonZeroValueIndex = tradingDays.findIndex(point => point.value > 0);

       // Handle case where all trading days have zero or invalid value
       if (firstNonZeroValueIndex === -1) {
           console.log('No non-zero portfolio values found in trading days.');
           setNoDataAvailable(true); setData([]); return; // Exit
       }

       // 4. Slice the array to start from the first non-zero point
       const relevantTradingDays = tradingDays.slice(firstNonZeroValueIndex);
       // --- END: Added Logic ---


       // 5. Map RELEVANT days to final chart data, adding flags and displayDate
       const finalChartData: ChartDataPoint[] = relevantTradingDays.map((point, index, array) => {
            let isAfterNonTrading = false;
            let isBeforeNonTrading = false;

            // Check gap BEFORE this point (needs careful check against ORIGINAL tradingDays for the first point)
            if (index > 0) {
                // Standard check: Compare current relevant day to previous relevant day
                const currentDate = new Date(point.date.split('T')[0] + 'T00:00:00Z');
                const prevDate = new Date(array[index - 1].date.split('T')[0] + 'T00:00:00Z');
                const dayDiff = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
                if (dayDiff > 1) isAfterNonTrading = true;
            } else {
                // First point in relevantTradingDays: Check its gap relative to the day *before it* in the ORIGINAL tradingDays list
                const originalIndex = tradingDays.findIndex(td => td.date === point.date); // Find index in the unfiltered list
                if (originalIndex > 0) { // If it wasn't the absolute first trading day overall
                    const currentDate = new Date(point.date.split('T')[0] + 'T00:00:00Z');
                    const originalPrevDate = new Date(tradingDays[originalIndex - 1].date.split('T')[0] + 'T00:00:00Z');
                    const dayDiff = Math.round((currentDate.getTime() - originalPrevDate.getTime()) / (1000 * 60 * 60 * 24));
                    if (dayDiff > 1) isAfterNonTrading = true; // Gap existed before this point in the original sequence
                } else {
                   // This point was the very first trading day in the fetched range
                   isAfterNonTrading = true; // Treat as coming after a non-trading period (the period before data started)
                }
            }

            // Check gap AFTER this point (within relevantTradingDays)
            if (index < array.length - 1) {
                const currentDate = new Date(point.date.split('T')[0] + 'T00:00:00Z');
                const nextDate = new Date(array[index + 1].date.split('T')[0] + 'T00:00:00Z');
                const nextDayDiff = Math.round((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
                if (nextDayDiff > 1) isBeforeNonTrading = true;
            } else {
                // This is the last point in relevantTradingDays
                isBeforeNonTrading = true; // Treat as being before a non-trading period (the future)
            }

            return {
                date: point.date, // Keep original date string
                value: point.value,
                displayDate: formatDateForDisplay(point.date, timeframe), // Format for tooltip
                isAfterNonTrading,
                isBeforeNonTrading,
            };
        });

       // 6. Final check and state update (no need to check hasValidData again, as the first point is guaranteed > 0)
       if (finalChartData.length > 0) {
            setData(finalChartData);
            setNoDataAvailable(false);
        } else {
            // This case should technically not be reached if firstNonZeroValueIndex was found,
            // but keep as a fallback.
            console.log("Filtered data resulted in no points after removing leading zeros.");
            setNoDataAvailable(true);
            setData([]);
        }
        lastRequest.current = { portfolioId, timeframe, exclusions: exclSig };
    } catch (error) {
        console.error('Failed to fetch portfolio history:', error);
        setError(error instanceof Error ? `Failed to load history: ${error.message}` : 'Failed to load portfolio history data.');
        setData([]); // Clear data on error
        setNoDataAvailable(false); // Show error message
        lastRequest.current = { portfolioId: null, timeframe: null, exclusions: '' }; // Reset on error
    } finally {
        setLoading(false); requestInProgress.current = false;
    }
  }, [portfolioId, timeframe, excludedTickers, isMarketClosed, formatDateForDisplay, data.length]);

  // Effect to trigger fetch
  useEffect(() => {
    if (portfolioId) {
      if (timeframe === '1D') {
        fetchIntradayData();
      } else {
        fetchPortfolioHistory();
      }
    }
  }, [portfolioId, timeframe, excludedTickers, fetchIntradayData, fetchPortfolioHistory]); // Added excludedTickers dependency


  // Helper function to format currency values (Style consistent with performance chart)
  const formatCurrency = (value: number): string => {
     if (value === undefined || isNaN(value)) return '$0.00';
     const absValue = Math.abs(value); const sign = value < 0 ? '-' : '';
     if (absValue >= 1_000_000) return `${sign}$${(absValue / 1_000_000).toFixed(2)}M`;
     if (absValue >= 1_000) return `${sign}$${(absValue / 1_000).toFixed(1)}K`;
     return `${sign}$${absValue.toFixed(2)}`;
  };

  // Calculate performance metrics (remains the same logic)
  const calculatePerformance = () => {
     if (data.length < 1) return { change: 0, percentChange: 0, firstValue: 0, lastValue: 0 }; // Handle empty data
     const firstValidPoint = data.find(d => typeof d.value === 'number' && !isNaN(d.value));
     const lastValidPoint = [...data].reverse().find(d => typeof d.value === 'number' && !isNaN(d.value));

     const firstValue = firstValidPoint?.value ?? 0;
     const lastValue = lastValidPoint?.value ?? 0;


     if (firstValue <= 0) return { change: 0, percentChange: 0, firstValue, lastValue }; // Avoid division by zero or nonsensical percentages

     const change = lastValue - firstValue;
     const percentChange = (change / firstValue) * 100;

     return { change, percentChange, firstValue, lastValue };
  };


  const { change, percentChange } = calculatePerformance();

  // --- Update Tooltip Style ---
  const CustomTooltip = ({ active, payload }: any) => { // Removed label as it's not used directly
    if (!active || !payload || !payload.length) return null;
    const dataPoint = payload[0]?.payload as ChartDataPoint; // Type assertion
    if (!dataPoint) return null;

    const displayTime = dataPoint.displayDate; // Use the pre-formatted display date/time
    const value = payload[0]?.value;

    return (
      <div className="bg-white border border-gray-300 rounded-md p-3 shadow-lg text-sm"> {/* Matched Style */}
        <div className="font-semibold mb-1">{displayTime}</div> {/* Use displayDate */}
        <div className="text-gray-800 font-medium mb-1"> {/* Adjusted color/weight */}
            Value: {typeof value === 'number' ? formatCurrency(value) : 'N/A'}
        </div>
        {/* Display non-trading flags if they exist (for historical) */}
        {(dataPoint.isBeforeNonTrading || dataPoint.isAfterNonTrading) && (
          <div className="text-xs text-gray-500 mt-1 italic">
            {dataPoint.isBeforeNonTrading && dataPoint.isAfterNonTrading
              ? 'Isolated trading day'
              : dataPoint.isBeforeNonTrading
                ? 'Before non-trading period'
                : 'After non-trading period'}
          </div>
        )}
      </div>
    );
  };

  const handleTimeframeChange = (newTimeframe: TimeframeType) => {
    if (newTimeframe === timeframe) return;
    setTimeframe(newTimeframe);
  };

  const getLatestValue = () => {
     const lastValidPoint = [...data].reverse().find(d => typeof d.value === 'number' && !isNaN(d.value));
     return lastValidPoint?.value ?? 0;
  };
   const latestValue = getLatestValue(); // Get latest value once

  // --- Define Custom Dot Component (Similar to Performance Chart) ---
  const CustomDotValueChart = (props: any) => {
     const { cx, cy, stroke, payload, active } = props;

     // Active dot style
     if (active) {
         return <circle cx={cx} cy={cy} r={5} fill={stroke} stroke="#fff" strokeWidth={2} />;
     }

     // Dot style for non-trading adjacent days (only if flags exist)
     if (payload.isBeforeNonTrading || payload.isAfterNonTrading) {
         return <circle cx={cx} cy={cy} r={2} fill={stroke} />;
     }

     // No dot for regular points or intraday points (where flags are undefined)
     return null;
  };

  // --- XAxis Tick Formatting (Only for 1D) ---
  const formatXAxisTick = (value: string) => { // value is the original 'date' string
     if (timeframe === '1D') {
       const date = new Date(value);
       if (isNaN(date.getTime())) return '';
       // Format time in ET, show only the hour
       return new Intl.DateTimeFormat('en-US', {
         hour: 'numeric',
         hour12: true,
         timeZone: 'America/New_York'
       }).format(date);
     }
     // For other timeframes, Recharts usually handles picking appropriate date ticks
     // based on the data density. We pass the original date string.
     // If formatting is needed, use formatDateForDisplay or similar logic.
     // Returning the date part might be okay for daily/weekly.
      return value.split('T')[0]; // Default: return just the date part for history
   };

   // --- XAxis Tick Interval (Simplified) ---
    const getXAxisInterval = () => {
        // Let Recharts automatically determine the interval ('preserveStartEnd' is often good)
        // Or use specific logic if needed:
        if (timeframe === '1D') return 'preserveStartEnd'; // Auto for intraday often works well
        // You might return a number based on data.length if auto doesn't look right
        return 'preserveStartEnd'; // Default to letting Recharts decide
    };


  return (
    // --- Apply Consistent Outer Styling ---
    <div className={`bg-white p-4 rounded-lg shadow space-y-4 ${className}`}>
      {/* Header Section (remains largely the same, uses latestValue) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
           <h3 className="text-lg font-semibold text-gray-800">Portfolio Value</h3>
            {!loading && data.length > 0 && (
               <div className="text-sm mt-1">
                 <span className="font-medium text-gray-800">
                   {formatCurrency(latestValue)}
                 </span>
                 <span className={`ml-2 text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                   {change >= 0 ? '▲' : '▼'}
                   {formatCurrency(Math.abs(change))} ({percentChange.toFixed(1)}%) {timeframe}
                 </span>
               </div>
             )}
              {loading && (<div className="text-sm text-gray-500 mt-1 h-5">Loading...</div>)}
              {!loading && !latestValue && !error && !noDataAvailable && (<div className="text-sm text-gray-500 mt-1 h-5"></div>)}
        </div>
         {/* Timeframe Buttons (Consistent Style) */}
          <div className="flex flex-wrap space-x-1 mt-2 sm:mt-0 text-sm">
              {(['1D', '5D', '15D', '1M', '3M', '6M', '1Y', 'ALL'] as const).map((tf) => (
                <button key={tf} className={`px-2.5 py-1 rounded-md transition-colors duration-150 ease-in-out ${timeframe === tf ? 'bg-blue-600 text-white font-medium shadow-sm' : 'text-blue-700 hover:bg-blue-100'}`} onClick={() => handleTimeframeChange(tf)}>
                  {tf}
                </button>
              ))}
          </div>
      </div>

      {/* Chart Area */}
      <div className="h-[250px] w-full relative">
        {/* Loading/Error/NoData Overlays (Consistent Style) */}
          {loading && ( <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>)}
          {!loading && error && ( <div className="flex flex-col items-center justify-center h-full text-center"><p className="text-red-600 font-medium">Error Loading Chart</p><p className="text-sm text-red-500 mt-1">{error}</p><button className="mt-3 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => timeframe === '1D' ? fetchIntradayData() : fetchPortfolioHistory()}>Try Again</button></div>)}
          {!loading && !error && (noDataAvailable || data.length === 0) && (<div className="flex flex-col items-center justify-center h-full text-gray-500 text-center"><p className="font-medium">No Value Data Available</p><p className="text-sm mt-1">There's no historical value data for this period.</p></div>)}


        {!loading && !error && !noDataAvailable && data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              // Consistent Margins
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              {/* Consistent Grid */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              {/* Consistent XAxis Style */}
              <XAxis
                dataKey="date" // Use original date for calculations/ticks
                stroke="#9ca3af"
                tick={{ fontSize: 11, fill: '#4b5563' }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                minTickGap={timeframe === '1D' ? 40 : 25} // Adjust minTickGap for 1D
                tickFormatter={formatXAxisTick} // Format ticks based on original date
              />
              {/* Consistent YAxis Style */}
              <YAxis
                orientation="left" // Ensure Y-axis is on the left
                stroke="#9ca3af"
                tick={{ fontSize: 11, fill: '#4b5563' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatCurrency(value)} // Use existing formatter
                domain={['auto', 'auto']} // Keep auto domain for value
                tickMargin={5}
                width={50} // Adjusted width for currency values
              />
              {/* Consistent Tooltip */}
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}/>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563eb" // Keep blue for value
                strokeWidth={2}
                // Implement Custom Dots
                dot={<CustomDotValueChart />}
                activeDot={<CustomDotValueChart active={true} />} // Pass active prop
                connectNulls={false} // Don't connect across filtered gaps
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Notes (remains the same) */}
        {!loading && !error && ( <div className="text-xs text-gray-500 text-center mt-2"> {timeframe === '1D' ? "Intraday value shown minute-by-minute." : "Historical value shown excluding non-trading days."} Dots indicate days adjacent to non-trading periods. </div>)}
    </div>
  );
};