// // src/hooks/usePerformanceData.ts
// import { useState, useEffect, useRef, useCallback } from 'react';
// import { portfolioService } from '../services/portfolio.service';
// import { TimeframeType } from '../models/portfolio.model';
// import { formatDateForDisplay, ensureNumber } from '../utils/data-normalizer';

// export interface PerformanceDataPoint {
//   date: string;
//   performanceValue: number;
//   performancePercent: number;
//   displayDate: string;
// }

// interface UsePerformanceDataProps {
//   portfolioId: string;
//   timeframe: TimeframeType;
// }

// export function usePerformanceData({ portfolioId, timeframe }: UsePerformanceDataProps) {
//   const [data, setData] = useState<PerformanceDataPoint[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [noDataAvailable, setNoDataAvailable] = useState(false);
//   const [showPercent, setShowPercent] = useState(true);
  
//   // Use refs to track request state
//   const requestInProgress = useRef(false);
//   const lastRequest = useRef<{
//     portfolioId: string | null;
//     timeframe: TimeframeType | null;
//   }>({
//     portfolioId: null,
//     timeframe: null
//   });
  
//   const fetchPerformanceData = useCallback(async () => {
//     // Skip if no portfolio ID or if a request is already in progress
//     if (!portfolioId || requestInProgress.current) return;
    
//     // Check if this is a duplicate request for the same data
//     if (
//       lastRequest.current.portfolioId === portfolioId && 
//       lastRequest.current.timeframe === timeframe &&
//       data.length > 0
//     ) {
//       console.log('Skipping duplicate performance data request');
//       return;
//     }
    
//     // Mark request as in progress
//     requestInProgress.current = true;
//     setLoading(true);
//     setError(null);
//     setNoDataAvailable(false);
    
//     try {
//       // Calculate date range based on timeframe
//       const endDate = new Date().toISOString().split('T')[0]; // Today
//       let startDate: string;
      
//       switch (timeframe) {
//         case '1D':
//           // Today only
//           startDate = endDate;
//           break;
//         case '5D':
//           // 5 days ago
//           startDate = new Date(
//             new Date().setDate(new Date().getDate() - 5)
//           ).toISOString().split('T')[0];
//           break;
//         case '15D':
//           // 15 days ago
//           startDate = new Date(
//             new Date().setDate(new Date().getDate() - 15)
//           ).toISOString().split('T')[0];
//           break;
//         case '1M':
//           // 1 month ago
//           startDate = new Date(
//             new Date().setMonth(new Date().getMonth() - 1)
//           ).toISOString().split('T')[0];
//           break;
//         case '3M':
//           // 3 months ago
//           startDate = new Date(
//             new Date().setMonth(new Date().getMonth() - 3)
//           ).toISOString().split('T')[0];
//           break;
//         case '6M':
//           // 6 months ago
//           startDate = new Date(
//             new Date().setMonth(new Date().getMonth() - 6)
//           ).toISOString().split('T')[0];
//           break;
//         case '1Y':
//           // 1 year ago
//           startDate = new Date(
//             new Date().setFullYear(new Date().getFullYear() - 1)
//           ).toISOString().split('T')[0];
//           break;
//         case 'ALL':
//           // 5 years ago or from beginning
//           startDate = new Date(
//             new Date().setFullYear(new Date().getFullYear() - 5)
//           ).toISOString().split('T')[0];
//           break;
//         default:
//           startDate = new Date(
//             new Date().setDate(new Date().getDate() - 5)
//           ).toISOString().split('T')[0];
//       }
      
//       // Fetch performance data from API
//       const performanceData = await portfolioService.getPortfolioPerformance(
//         portfolioId,
//         startDate,
//         endDate
//       );
      
//       if (!performanceData) {
//         setNoDataAvailable(true);
//         setData([]);
//         return;
//       }
      
//       // Extract and process the data
//       const { dates, performanceValues, performancePercent } = performanceData;
      
//       // Check if we actually have non-zero performance data
//       const hasNonZeroData = 
//         performanceValues.some(val => ensureNumber(val) !== 0) || 
//         performancePercent.some(val => ensureNumber(val) !== 0);
      
//       if (!hasNonZeroData) {
//         setNoDataAvailable(true);
//         setData([]);
//       } else {
//         // Filter out points with invalid data and create dataset
//         const validDataPoints = dates.map((date, index) => ({
//           date,
//           performanceValue: ensureNumber(performanceValues[index]),
//           performancePercent: ensureNumber(performancePercent[index]),
//           displayDate: formatDateForDisplay(date, timeframe)
//         })).filter(point => {
//           // Only include points with valid date
//           return point.date;
//         });
        
//         // Only update state if we have valid data
//         if (validDataPoints.length > 0) {
//           setData(validDataPoints);
//           setNoDataAvailable(false);
//         } else {
//           setNoDataAvailable(true);
//           setData([]);
//         }
//       }
      
//       // Update the last request ref
//       lastRequest.current = {
//         portfolioId,
//         timeframe
//       };
//     } catch (err) {
//       console.error('Failed to fetch portfolio performance:', err);
//       setError('Failed to load portfolio performance data.');
      
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
//     fetchPerformanceData();
//   }, [fetchPerformanceData]);
  
//   // Helper to get latest performance values
//   const getLatestPerformance = useCallback(() => {
//     if (!data.length) return { value: 0, percent: 0 };
    
//     const latest = data[data.length - 1];
//     return {
//       value: latest.performanceValue,
//       percent: latest.performancePercent
//     };
//   }, [data]);
  
//   return {
//     data,
//     loading,
//     error,
//     noDataAvailable,
//     showPercent,
//     setShowPercent,
//     fetchPerformanceData,
//     getLatestPerformance
//   };
// }