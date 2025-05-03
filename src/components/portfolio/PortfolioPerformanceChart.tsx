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

// Interfaces (RawDataPoint, ChartDataPoint) remain the same...
interface RawDataPoint {
  date: string;
  portfolioValue: number;
  performanceValue: number;
  originalPerformancePercent: number;
  displayDate: string;
  isMarketClosed?: boolean;
}

interface ChartDataPoint {
  date: string;
  performancePercent: number;
  displayDate: string;
  isMarketClosed?: boolean;
  isBeforeNonTrading?: boolean;
  isAfterNonTrading?: boolean;
  originalPerformanceValue: number;
  portfolioValue: number;
}


interface PortfolioPerformanceChartProps {
  portfolioId: string;
  className?: string;
  portfolio?: Portfolio;
  onUpdatePortfolio?: (portfolio: Portfolio) => void;
  excludedTickers?: string[];
}

type TimeframeType = '5D' | '15D' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

// Type for the Y-axis domain state
type YAxisDomain = [number | 'auto', number | 'auto'];


export const PortfolioPerformanceChart = ({
  portfolioId,
  className = '',
  portfolio,
  onUpdatePortfolio,
  excludedTickers = []
}: PortfolioPerformanceChartProps) => {
  const [timeframe, setTimeframe] = useState<TimeframeType>('5D');
  const [data, setData] = useState<ChartDataPoint[]>([]);
  // --- Add state for Y-axis domain ---
  const [yAxisDomain, setYAxisDomain] = useState<YAxisDomain>(['auto', 'auto']);
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

  // Helper functions (isWeekend, isHoliday, isMarketClosed, formatDateForDisplay) remain the same...
    // Helper function to determine if a date is a weekend
    const isWeekend = useCallback((dateString: string) => {
        if (!dateString || typeof dateString !== 'string' || !dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
          console.warn(`Invalid date string passed to isWeekend: ${dateString}`);
          return false;
        }
        try {
            const date = new Date(dateString + 'T00:00:00Z'); // Assuming UTC
            const day = date.getUTCDay();
            return day === 0 || day === 6; // Sunday or Saturday
        } catch (e) {
            console.error(`Error parsing date in isWeekend: ${dateString}`, e);
            return false;
        }
      }, []);

      // Helper function to determine if a date is a US market holiday
      const isHoliday = useCallback((dateString: string) => {
        // (Keep the existing robust holiday logic here)
         if (!dateString || typeof dateString !== 'string' || !dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
              console.warn(`Invalid date string passed to isHoliday: ${dateString}`);
              return false;
            }
             try {
                const date = new Date(dateString + 'T00:00:00Z'); // Assuming UTC dates
                const year = date.getUTCFullYear();
                const month = date.getUTCMonth(); // 0-indexed (0 = Jan)
                const day = date.getUTCDate();
                const dayOfWeek = date.getUTCDay(); // 0 = Sunday, 1 = Monday...

                // Helper to check for nth weekday of month
                const isNthWeekdayOfMonth = (n: number, weekday: number, m: number, d: number, dow: number) => {
                    if (month !== m || dayOfWeek !== weekday) return false;
                    // Check if it's the nth occurrence in the month
                    return Math.floor((d - 1) / 7) === (n - 1);
                };

                // --- Fixed Holidays ---
                // New Year's Day & observed
                if ((month === 0 && day === 1) || (month === 0 && day === 2 && dayOfWeek === 1) || (month === 11 && day === 31 && dayOfWeek === 5 && new Date(`${year}-01-01T00:00:00Z`).getUTCDay() === 6)) return true;
                // Juneteenth & observed
                if ((month === 5 && day === 19) || (month === 5 && day === 20 && dayOfWeek === 1) || (month === 5 && day === 18 && dayOfWeek === 5 && new Date(`${year}-06-19T00:00:00Z`).getUTCDay() === 6)) return true;
                // Independence Day & observed
                if ((month === 6 && day === 4) || (month === 6 && day === 5 && dayOfWeek === 1) || (month === 6 && day === 3 && dayOfWeek === 5 && new Date(`${year}-07-04T00:00:00Z`).getUTCDay() === 6)) return true;
                // Christmas Day & observed
                if ((month === 11 && day === 25) || (month === 11 && day === 26 && dayOfWeek === 1) || (month === 11 && day === 24 && dayOfWeek === 5 && new Date(`${year}-12-25T00:00:00Z`).getUTCDay() === 6)) return true;

                // --- Floating Holidays ---
                if (isNthWeekdayOfMonth(3, 1, 0, day, dayOfWeek)) return true; // MLK Jr. Day (3rd Mon Jan)
                if (isNthWeekdayOfMonth(3, 1, 1, day, dayOfWeek)) return true; // Presidents Day (3rd Mon Feb)
                // Good Friday (complex, example placeholder for 2025: Apr 18)
                 if (year === 2025 && month === 3 && day === 18 && dayOfWeek === 5) return true; // Placeholder
                // Memorial Day (Last Mon May)
                if (month === 4 && dayOfWeek === 1) { const next = new Date(date); next.setUTCDate(day + 7); if (next.getUTCMonth() !== 4) return true; }
                if (isNthWeekdayOfMonth(1, 1, 8, day, dayOfWeek)) return true; // Labor Day (1st Mon Sep)
                if (isNthWeekdayOfMonth(4, 4, 10, day, dayOfWeek)) return true; // Thanksgiving (4th Thu Nov)

                return false;
              } catch (e) {
                  console.error(`Error parsing date in isHoliday: ${dateString}`, e);
                  return false;
              }
      }, []);

      const isMarketClosed = useCallback((dateString: string) => {
        return isWeekend(dateString) || isHoliday(dateString);
      }, [isWeekend, isHoliday]);

      const formatDateForDisplay = useCallback((dateString: string, tf: TimeframeType): string => {
        // (Keep existing logic)
         const date = new Date(dateString);
         switch (tf) {
          case '5D':
          case '15D':
            return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
          case '1M':
          case '3M':
            return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
          case '6M':
          case '1Y':
            return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
          case 'ALL':
             return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
          default:
             return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
        }
      }, []);


const fetchPortfolioPerformance = useCallback(async () => {
    // Initial checks and request skipping logic
     if (!portfolioId || requestInProgress.current) return;
     const exclSig = excludedTickers.slice().sort().join(',');
     if ( lastRequest.current.portfolioId === portfolioId && lastRequest.current.timeframe === timeframe && lastRequest.current.exclusions === exclSig && data.length > 0) {
          console.log('Skipping identical performance request');
          return;
        }

    // Set loading states
    requestInProgress.current = true;
    setLoading(true);
    setError(null);
    setNoDataAvailable(false);
    // NOTE: setYAxisDomain removed as we reverted to 'auto'

    try {
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        switch (timeframe) {
            case '5D': startDate.setDate(endDate.getDate() - 7); break; // Fetch buffer
            case '15D': startDate.setDate(endDate.getDate() - 20); break; // Fetch buffer
            case '1M': startDate.setMonth(endDate.getMonth() - 1); startDate.setDate(startDate.getDate() - 5); break;
            case '3M': startDate.setMonth(endDate.getMonth() - 3); startDate.setDate(startDate.getDate() - 5); break;
            case '6M': startDate.setMonth(endDate.getMonth() - 6); startDate.setDate(startDate.getDate() - 5); break;
            case '1Y': startDate.setFullYear(endDate.getFullYear() - 1); startDate.setDate(startDate.getDate() - 5); break;
            case 'ALL': startDate.setFullYear(endDate.getFullYear() - 5); break; // Example: 5 years max
            default: startDate.setDate(endDate.getDate() - 7);
          }
        const startDateString = startDate.toISOString().split('T')[0];
        const endDateString = endDate.toISOString().split('T')[0];

        console.log(`Workspaceing portfolio performance (${timeframe}) from ${startDateString} to ${endDateString} with excluded tickers:`, excludedTickers);

        // Fetch data from API
        const response = await portfolioApi.getPortfolioPerformance(
            portfolioId,
            startDateString,
            endDateString,
            excludedTickers.length > 0 ? excludedTickers : undefined
        );

        // Validate API response
        if (!response || !response.data || !response.data.dates || response.data.dates.length === 0 || !response.data.portfolioValues) {
            console.log('No performance data returned from API or data structure invalid.');
            setNoDataAvailable(true);
            setData([]);
            return; // Exit
        }

        const { dates, portfolioValues, performanceValues, performancePercent } = response.data;

        // 1. Create initial data points including market closed flag
        const initialDataPoints: RawDataPoint[] = dates.map((date, index) => ({
            date,
            portfolioValue: ensureNumber(portfolioValues[index]),
            performanceValue: ensureNumber(performanceValues[index]), // Keep if needed elsewhere
            originalPerformancePercent: ensureNumber(performancePercent[index]), // Keep original API percent if needed
            displayDate: formatDateForDisplay(date, timeframe), // Pre-format for tooltip
            isMarketClosed: isMarketClosed(date.split('T')[0]) // Check based on date part
        }));

        // 2. Filter out non-trading days
        const tradingDays = initialDataPoints.filter(point => !point.isMarketClosed);

        // Handle case where no trading days are found in the range
        if (tradingDays.length === 0) {
          console.log('No trading days found in the fetched range.');
          setNoDataAvailable(true);
          setData([]);
          return; // Exit
        }

        // 3. Find the index of the first trading day with a non-zero portfolio value
        const firstNonZeroIndex = tradingDays.findIndex(point => point.portfolioValue > 0);

        // Handle case where all trading days have zero value
        if (firstNonZeroIndex === -1) {
            console.log('No non-zero portfolio values found in trading days.');
            setNoDataAvailable(true);
            setData([]);
            return; // Exit
        }

        // 4. Slice the array to start from the first non-zero point
        const relevantTradingDays = tradingDays.slice(firstNonZeroIndex);


        // 6. Map relevant days to final chart data, recalculating percentage and adding flags
        const finalChartData: ChartDataPoint[] = relevantTradingDays.map((point, index, array) => {
            // Recalculate percentage relative to the first non-zero start value
            

            // Calculate non-trading period adjacency flags
            let isAfterNonTrading = false;
            let isBeforeNonTrading = false;

            // Check gap BEFORE this point
            if (index > 0) {
                // Standard check within the relevant days
                const currentDate = new Date(point.date.split('T')[0] + 'T00:00:00Z');
                const prevDate = new Date(array[index - 1].date.split('T')[0] + 'T00:00:00Z');
                const dayDiff = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
                if (dayDiff > 1) isAfterNonTrading = true;
            } else {
                // Check if the *first relevant day* was preceded by a gap in the *original* trading days list
                const originalIndex = tradingDays.findIndex(td => td.date === point.date);
                if (originalIndex > 0) {
                    const currentDate = new Date(point.date.split('T')[0] + 'T00:00:00Z');
                    const originalPrevDate = new Date(tradingDays[originalIndex - 1].date.split('T')[0] + 'T00:00:00Z');
                    const dayDiff = Math.round((currentDate.getTime() - originalPrevDate.getTime()) / (1000 * 60 * 60 * 24));
                    if (dayDiff > 1) isAfterNonTrading = true;
                } else {
                    isAfterNonTrading = true; // It was the very first trading day overall
                }
            }

            // Check gap AFTER this point within relevantTradingDays
            if (index < array.length - 1) {
                const currentDate = new Date(point.date.split('T')[0] + 'T00:00:00Z');
                const nextDate = new Date(array[index + 1].date.split('T')[0] + 'T00:00:00Z');
                const nextDayDiff = Math.round((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
                if (nextDayDiff > 1) isBeforeNonTrading = true;
            } else {
                isBeforeNonTrading = true; // Last point in the relevant list
            }

            // Return the final structure for this data point
            return {
                date: point.date, // Keep original date string (for XAxis reference)
                performancePercent: point.originalPerformancePercent, // Use the recalculated value
                displayDate: point.displayDate, // Use pre-formatted date for tooltip
                // isMarketClosed: point.isMarketClosed, // Filtered out, so always false here
                isAfterNonTrading,
                isBeforeNonTrading,
                originalPerformanceValue: point.performanceValue,
                portfolioValue: point.portfolioValue,
            };
        });

        // 7. Check for variance in the calculated performance data
        // Ensure there's change relative to the starting point (0%)
        const hasVariance = finalChartData.some(p => Math.abs(p.performancePercent) > 0.001); // Check if any value is meaningfully different from 0%

        // 8. Set state based on processed data and variance
        if (finalChartData.length > 0 && hasVariance) {
            setData(finalChartData);
            setNoDataAvailable(false);

            // Optional: Update portfolio summary based on the absolute latest API data received
            if (portfolio && onUpdatePortfolio && portfolioValues.length > 0) {
                const latestApiValue = ensureNumber(portfolioValues[portfolioValues.length - 1]);
                const previousApiValue = portfolioValues.length > 1 ? ensureNumber(portfolioValues[portfolioValues.length - 2]) : latestApiValue; // Use latest if only one point
                if (Math.abs(latestApiValue - ensureNumber(portfolio.totalValue)) > 0.01) { // Check if update needed
                   const updatedPortfolio = {
                        ...portfolio,
                        totalValue: latestApiValue,
                        previousDayValue: previousApiValue,
                        dayChange: latestApiValue - previousApiValue,
                        dayChangePercent: previousApiValue !== 0 ? ((latestApiValue - previousApiValue) / previousApiValue) * 100 : 0
                    };
                   console.log("Updating portfolio with latest data from performance API");
                   onUpdatePortfolio(updatedPortfolio);
                 }
             }

        } else {
             // This condition means either no relevant trading days OR all points had 0% change relative to the first non-zero value.
             console.log('Filtered data resulted in no points or no meaningful variance from the first non-zero value.');
             setNoDataAvailable(true);
             setData([]);
        }

        // Update last request tracking
        lastRequest.current = { portfolioId, timeframe, exclusions: exclSig };

    } catch (err) {
        // Handle errors during fetch/processing
        console.error('Failed to fetch portfolio performance:', err);
        setError(err instanceof Error ? `Failed to load performance: ${err.message}` : 'Failed to load portfolio performance data.');
        setData([]); // Clear data on error
        setNoDataAvailable(false); // Show error message, not "no data"
        // Reset last request cache on error
        lastRequest.current = { portfolioId: null, timeframe: null, exclusions: '' };
    } finally {
        // Ensure loading state is always turned off
        setLoading(false);
        requestInProgress.current = false;
    }
  }, [
      // List all dependencies used within the useCallback hook
      portfolioId,
      timeframe,
      excludedTickers,
      data.length, // Add data.length back if you want skip logic to depend on current data presence
      formatDateForDisplay,
      isMarketClosed,
      portfolio,
      onUpdatePortfolio,
      setData,
      setLoading,
      setError,
      setNoDataAvailable
    ]);

  // useEffect hook remains the same...
  useEffect(() => {
    fetchPortfolioPerformance();
  }, [portfolioId, timeframe, excludedTickers, fetchPortfolioPerformance]);

  // formatCurrency, formatPercent, CustomTooltip, handleTimeframeChange, getLatestDisplayedPerformancePercent, CustomDot remain the same...
    const formatCurrency = (value: number): string => {
        // ... (implementation unchanged)
        if (value === undefined || isNaN(value)) return '$0.00';
        const absValue = Math.abs(value); const sign = value < 0 ? '-' : '';
        if (absValue >= 1000000) return `${sign}$${(absValue / 1000000).toFixed(2)}M`;
        if (absValue >= 1000) return `${sign}$${(absValue / 1000).toFixed(1)}K`;
        return `${sign}$${absValue.toFixed(2)}`;
      };

      const formatPercent = (value: number): string => {
        if (value === undefined || isNaN(value)) return '0.00%';
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`; // Keep 2 decimals for header/tooltip display potentially
      };

      const CustomTooltip = ({ active, payload, label }: any) => {
         // ... (implementation unchanged)
         if (!active || !payload || !payload.length) return null;
         const dataPoint = payload[0].payload as ChartDataPoint;
         return (
            <div className="bg-white border border-gray-300 rounded-md p-3 shadow-lg text-sm">
              <div className="font-semibold mb-1">{dataPoint.displayDate}</div>
              <div className={`font-medium mb-1 ${dataPoint.performancePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                 Change: {formatPercent(dataPoint.performancePercent)} {/* Use formatPercent */}
              </div>
              <div className="text-gray-600">Value: {formatCurrency(dataPoint.portfolioValue)}</div>
              {(dataPoint.isBeforeNonTrading || dataPoint.isAfterNonTrading) && (
                <div className="text-xs text-gray-500 mt-1 italic">
                  {dataPoint.isBeforeNonTrading && dataPoint.isAfterNonTrading ? 'Isolated trading day' : dataPoint.isBeforeNonTrading ? 'Before non-trading period' : 'After non-trading period'}
                </div>
              )}
            </div>
          );
      };

      const handleTimeframeChange = (newTimeframe: TimeframeType) => {
        if (newTimeframe === timeframe) return;
        setTimeframe(newTimeframe);
      };

      const getLatestDisplayedPerformancePercent = () => {
        if (!currentPerformance) return 0;
        return currentPerformance.performancePercent;
      };
       const currentPerformance = data.length > 0 ? data[data.length - 1] : null;
       const latestPercent = getLatestDisplayedPerformancePercent();


       const CustomDot = (props: any) => {
         // ... (implementation unchanged)
         const { cx, cy, stroke, payload, active } = props;
            if (active) { return <circle cx={cx} cy={cy} r={5} fill={stroke} stroke="#fff" strokeWidth={2}/>; }
            if (payload.isBeforeNonTrading || payload.isAfterNonTrading) { return <circle cx={cx} cy={cy} r={2} fill={stroke} />; }
            return null;
       };


  return (
    <div className={`bg-white p-4 rounded-lg shadow space-y-4 ${className}`}>
      {/* Header Section (remains the same) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
             <div>
              <h3 className="text-lg font-semibold text-gray-800">Portfolio Performance</h3>
              {!loading && currentPerformance && (
                <div className="text-sm mt-1">
                  <span className="text-gray-600">{timeframe} Change: </span>
                  <span className={`font-medium ${latestPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(latestPercent)}
                  </span>
                </div>
              )}
               {loading && (<div className="text-sm text-gray-500 mt-1 h-5">Loading...</div>)}
               {!loading && !currentPerformance && !error && !noDataAvailable && (<div className="text-sm text-gray-500 mt-1 h-5"></div>)}
            </div>
             <div className="flex flex-wrap space-x-1 mt-2 sm:mt-0 text-sm">
              {(['5D', '15D', '1M', '3M', '6M', '1Y', 'ALL'] as const).map((tf) => (
                <button key={tf} className={`px-2.5 py-1 rounded-md transition-colors duration-150 ease-in-out ${timeframe === tf ? 'bg-blue-600 text-white font-medium shadow-sm' : 'text-blue-700 hover:bg-blue-100'}`} onClick={() => handleTimeframeChange(tf)}>
                  {tf}
                </button>
              ))}
            </div>
        </div>


      {/* Chart Area */}
      <div className="h-[250px] w-full relative">
        {/* Loading/Error/NoData overlays (remain the same) */}
         {loading && ( <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>)}
         {!loading && error && ( <div className="flex flex-col items-center justify-center h-full text-center"><p className="text-red-600 font-medium">Error Loading Chart</p><p className="text-sm text-red-500 mt-1">{error}</p><button className="mt-3 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => fetchPortfolioPerformance()}>Try Again</button></div>)}
         {!loading && !error && (noDataAvailable || data.length === 0) && (<div className="flex flex-col items-center justify-center h-full text-gray-500 text-center"><p className="font-medium">No Performance Data Available</p><p className="text-sm mt-1">There's no trading data for the selected period{excludedTickers.length > 0 ? ' and exclusions' : ''}.</p><p className="text-xs mt-1">This might happen for new portfolios or periods without trades.</p></div>)}

        {/* --- Update ResponsiveContainer only when data is ready --- */}
        {!loading && !error && !noDataAvailable && data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }} // Adjusted left margin slightly more if needed
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="displayDate"
                stroke="#9ca3af"
                tick={{ fontSize: 11, fill: '#4b5563' }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                minTickGap={25}
              />
              {/* --- Update YAxis --- */}
              <YAxis
                stroke="#9ca3af"
                tick={{ fontSize: 11, fill: '#4b5563' }}
                axisLine={false}
                tickLine={false}
                // Use 1 decimal place for axis ticks
                tickFormatter={(value) => `${value.toFixed(1)}%`}
                // Apply the calculated domain with padding
                domain={yAxisDomain}
                // Allow decimals for calculated domain
                allowDecimals={true}
                 // Suggest tick count (optional, Recharts might override)
                 // tickCount={7}
                tickMargin={5}
                width={45} // Adjusted width slightly for potentially wider labels like "-10.5%"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}/>
              <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="4 4" strokeWidth={1}/>
              <Line
                type="monotone"
                dataKey="performancePercent"
                stroke={latestPercent >= 0 ? "#10B981" : "#EF4444"} // Dynamic color based on final trend
                strokeWidth={2}
                dot={<CustomDot />}
                activeDot={<CustomDot active={true} />}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Notes (remains the same) */}
        {!loading && !error && ( <div className="text-xs text-gray-500 text-center mt-2"> Performance shown is relative to the start of the selected period ({timeframe}). Non-trading days are excluded. Dots indicate days adjacent to non-trading periods. </div>)}
    </div>
  );
};