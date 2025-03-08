import { useState, useEffect, useCallback } from "react";

export const useTimePeriods = (
  financialData: any[], 
  ticker: string,
  timeFrame: "annual" | "quarterly" | "ttm" = "annual"
) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sliderValue, setSliderValue] = useState<number[]>([0, 0]);
  const [timePeriods, setTimePeriods] = useState<string[]>([]);

  // Extract time periods only when financial data, ticker, or timeFrame changes
  useEffect(() => {
    if (!financialData?.length) {
      setTimePeriods([]);
      setSliderValue([0, 0]);
      return;
    }

    // Extract all unique periods based on timeFrame
    const periods = Array.from(new Set(
      financialData.map(item => {
        if (item.period === 'TTM') return 'TTM';
        
        if (item.date) {
          const date = new Date(item.date);
          
          if (timeFrame === 'quarterly') {
            // For quarterly, format as Q1 2023, etc.
            const quarter = Math.floor((date.getMonth() + 3) / 3);
            return `Q${quarter} ${date.getFullYear()}`;
          } else {
            // For annual, just use the year
            return date.getFullYear().toString();
          }
        }
        
        return item.period || '';
      }).filter(Boolean)
    ));

    console.log('Extracted raw periods:', periods);

    // Sort periods in ASCENDING order (oldest to newest)
    const sortedPeriods = [...periods].sort((a, b) => {
      // Place TTM at the end for ascending order
      if (a === 'TTM') return 1;
      if (b === 'TTM') return -1;
      
      if (timeFrame === 'quarterly') {
        // For quarterly data (e.g., "Q1 2023")
        const aMatches = a.match(/Q(\d+)\s+(\d+)/);
        const bMatches = b.match(/Q(\d+)\s+(\d+)/);
        
        if (!aMatches || !bMatches) return 0;
        
        const [, aQuarter, aYear] = aMatches;
        const [, bQuarter, bYear] = bMatches;
        
        // Compare years first
        if (aYear !== bYear) {
          return parseInt(aYear) - parseInt(bYear); // Ascending
        }
        
        // Then compare quarters
        return parseInt(aQuarter) - parseInt(bQuarter); // Ascending
      } else {
        // For annual data (years)
        if (!isNaN(parseInt(a)) && !isNaN(parseInt(b))) {
          return parseInt(a) - parseInt(b); // Ascending order
        }
      }
      
      // Default sort
      return a.localeCompare(b);
    });

    console.log('Sorted periods:', sortedPeriods);

    // Set dates if periods have actual date values
    if (financialData.some(item => item.date)) {
      const dates = financialData
        .filter(item => item.date)
        .map(item => new Date(item.date))
        .sort((a, b) => a.getTime() - b.getTime());
      
      if (dates.length > 0) {
        setStartDate(dates[0].toISOString().split('T')[0]);
        setEndDate(dates[dates.length - 1].toISOString().split('T')[0]);
      }
    }

    // Update state only if periods actually changed
    if (JSON.stringify(sortedPeriods) !== JSON.stringify(timePeriods)) {
      setTimePeriods(sortedPeriods);
      
      // Set slider to show the most recent data by default
      const endIndex = sortedPeriods.length - 1;
      
      // Calculate start index to show the last periods
      const periodCount = timeFrame === 'quarterly' ? 8 : 5; // More periods for quarterly view
      const startIndex = Math.max(0, endIndex - (periodCount - 1));
      
      setSliderValue([startIndex, endIndex]);
      
      console.log(`Setting slider to [${startIndex}, ${endIndex}] for ${periodCount} periods`);
    }
  }, [financialData, ticker, timeFrame, timePeriods]);

  // Memoize handler to prevent recreation on every render
  const handleSliderChange = useCallback((value: number[]) => {
    setSliderValue(value);
  }, []);

  return {
    startDate,
    endDate,
    sliderValue,
    timePeriods,
    handleSliderChange
  };
};