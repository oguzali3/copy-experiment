import { useState, useEffect, useCallback } from "react";

export const useTimePeriods = (
  financialData: any[], 
  ticker: string
) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sliderValue, setSliderValue] = useState<number[]>([0, 0]);
  const [timePeriods, setTimePeriods] = useState<string[]>([]);

  // Extract time periods only when financial data or ticker changes
  useEffect(() => {
    if (!financialData?.length) {
      setTimePeriods([]);
      setSliderValue([0, 0]);
      return;
    }

    // Extract all unique periods
    const periods = Array.from(new Set(
      financialData.map(item => {
        if (item.period === 'TTM') return 'TTM';
        
        if (item.date) {
          const date = new Date(item.date);
          return date.getFullYear().toString();
        }
        
        return item.period || '';
      }).filter(Boolean)
    ));

    // Sort periods in ASCENDING order (oldest to newest)
    const sortedPeriods = [...periods].sort((a, b) => {
      // Place TTM at the end for ascending order
      if (a === 'TTM') return 1;
      if (b === 'TTM') return -1;
      
      // For annual data (years)
      if (!isNaN(parseInt(a)) && !isNaN(parseInt(b))) {
        return parseInt(a) - parseInt(b); // Ascending order
      }
      
      // For quarterly data
      if (a.includes('Q') && b.includes('Q')) {
        const [aQ, aYear] = a.split(' ');
        const [bQ, bYear] = b.split(' ');
        
        if (aYear !== bYear) {
          return parseInt(aYear) - parseInt(bYear); // Ascending order
        }
        return parseInt(aQ.slice(1)) - parseInt(bQ.slice(1)); // Ascending order
      }
      
      // Default sort
      return a.localeCompare(b);
    });

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
      // With ascending order, start from the earliest relevant period and go to the end
      const ttmIndex = sortedPeriods.indexOf('TTM');
      const endIndex = sortedPeriods.length - 1;
      
      // Calculate start index to show the last 5 years or all data if less than 5 years
      const startIndex = Math.max(0, endIndex - 4); // Show last 5 periods by default
      
      setSliderValue([startIndex, endIndex]);
    }
  }, [financialData, ticker, timePeriods]);

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