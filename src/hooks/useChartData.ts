// // src/hooks/useChartData.ts
// import { useState, useEffect, useRef, useCallback } from 'react';
// import { portfolioService } from '../services/portfolio.service';
// import { TimeframeType } from '../models/portfolio.model';
// import { formatDateForDisplay, ensureNumber } from '../utils/data-normalizer';

// export interface ChartDataPoint {
//   date: string;
//   value: number;
//   dayChange: number;
//   dayChangePercent: number;
//   displayDate: string;
// }

// interface UseChartDataProps {
//   portfolioId: string;
//   timeframe: TimeframeType;
// }

// export function useChartData({ portfolioId, timeframe }: UseChartDataProps) {
//   const [data, setData] = useState<ChartDataPoint[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [noDataAvailable, setNoDataAvailable] = useState(false);
  
//   // Use refs to track request state and prevent duplicate requests
//   const requestInProgress = useRef(false);
//   const lastRequest = useRef<{
//     portfolioId: string | null;
//     timeframe: TimeframeType | null;
//   }>({
//     portfolioId: null,
//     timeframe: null
//   });
  
//   const fetchChartData = useCallback(async () => {
//     // Skip if no portfolio ID or if a request is already in progress
//     if (!portfolioId || requestInProgress.current) return;
    
//     // Check if this is a duplicate request for the same data
//     if (
//       lastRequest.current.portfolioId === portfolioId && 
//       lastRequest.current.timeframe === timeframe &&
//       data.length > 0
//     ) {
//       console.log('Skipping duplicate chart data request');
//       return;
//     }
    
//     // Mark request as in progress
//     requestInProgress.current = true;
//     setLoading(true);
//     setError(null);
//     setNoDataAvailable(false);
    
//     try {
//       // Fetch historical data from API
//       const historyData = await portfolioService.getPortfolioHistory(
//         portfolioId,
//         timeframe
//       );
      
//       if (!historyData || historyData.length === 0) {
//         setNoDataAvailable(true);
//         setData([]);
//         return;
//       }
      
//       // Process the data to ensure all values are numeric
//       const processedData = historyData.map(item => ({
//         date: item.date,
//         value: ensureNumber(item.value),
//         dayChange: ensureNumber(item.dayChange),
//         dayChangePercent: ensureNumber(item.dayChangePercent),
//         displayDate: formatDateForDisplay(item.date, timeframe)
//       })).filter(item => item.date); // Filter out any items with invalid dates
      
//       // Check for valid data
//       const hasValidData = processedData.some(item => item.value > 0);
      
//       if (!hasValidData) {
//         setNoDataAvailable(true);
//         setData([]);
//       } else {
//         setData(processedData);
//         setNoDataAvailable(false);
//       }
      
//       // Update the last request ref
//       lastRequest.current = {
//         portfolioId,
//         timeframe
//       };
//     } catch (error) {
//       console.error('Failed to fetch chart data:', error);
//       setError('Failed to load chart data.');
      
//       // Reset last request on error
//       lastRequest.current = {
//         portfolioId: null,
//         timeframe: null
//       };
//     } finally {
//       setLoading(false);
//       requestInProgress.current = false;
//     }
//   }, [portfolioId, timeframe, data.length]);
  
//   // Fetch data when dependencies change
//   useEffect(() => {
//     fetchChartData();
//   }, [fetchChartData]);
  
//   // Helper to get latest value
//   const getLatestValue = useCallback(() => {
//     if (data.length === 0) return 0;
//     const latest = data[data.length - 1]?.value;
//     return typeof latest === 'number' && !isNaN(latest) ? latest : 0;
//   }, [data]);
  
//   // Helper to calculate performance between first and last points
//   const calculatePerformance = useCallback(() => {
//     if (data.length < 2) return { change: 0, percentChange: 0 };
    
//     // Get first and last valid values
//     const firstValue = data[0].value;
//     const lastValue = data[data.length - 1].value;
    
//     // Validate values
//     if (isNaN(firstValue) || isNaN(lastValue) || firstValue <= 0) {
//       return { change: 0, percentChange: 0 };
//     }
    
//     const change = lastValue - firstValue;
//     const percentChange = (change / firstValue) * 100;
    
//     return { change, percentChange };
//   }, [data]);
  
//   return {
//     data,
//     loading,
//     error,
//     noDataAvailable,
//     fetchChartData,
//     getLatestValue,
//     calculatePerformance,
//   };
// }