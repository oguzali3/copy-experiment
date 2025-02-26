import { useState, useEffect } from 'react';

export const useTimePeriods = (financialData: any[] = [], ticker: string) => {
  const [sliderValue, setSliderValue] = useState<number[]>([0, 5]);
  const [timePeriods, setTimePeriods] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    let periods: string[] = [];
    
    // First, check if we have actual data to extract periods from
    if (Array.isArray(financialData) && financialData.length > 0) {
      // Extract periods from data
      periods = extractPeriodsFromData(financialData);
    }
    
    // If we couldn't extract periods or they're too few, generate default periods
    if (periods.length < 10) {
      const currentYear = new Date().getFullYear();
      // Generate periods from 2011 to current year (changed from 2010)
      const startYear = 2011;
      const years = [];
      for (let year = startYear; year <= currentYear; year++) {
        years.push(year.toString());
      }
      
      // Use generated years if we have no periods, otherwise merge with existing
      if (periods.length === 0) {
        periods = years;
      } else {
        // Merge all years
        periods = Array.from(new Set([...periods, ...years]));
      }
    }

    // Remove any 'annual' entries and filter out years before 2011
    periods = periods.filter(period => {
      // Skip 'annual' entries
      if (period.toLowerCase() === 'annual') return false;
      
      // Filter out years before 2011
      if (!isNaN(parseInt(period)) && parseInt(period) < 2011) return false;
      
      // Keep quarterly entries only if they're from 2011 or later
      if (period.includes('Q')) {
        const yearMatch = period.match(/\d{4}/);
        if (yearMatch && parseInt(yearMatch[0]) < 2011) return false;
      }
      
      return true;
    });

    // Sort periods from oldest to newest (left to right)
    const sortedPeriods = sortPeriodsLeftToRight(periods);
    setTimePeriods(sortedPeriods);

    // Set slider to show recent 5 years (or all if fewer)
    const defaultRange = Math.min(5, sortedPeriods.length);
    const endIndex = sortedPeriods.length - 1;
    const startIndex = Math.max(0, endIndex - defaultRange + 1);
    setSliderValue([startIndex, endIndex]);

    // Set start and end dates for display
    if (sortedPeriods.length > 0) {
      setStartDate(sortedPeriods[0]);
      setEndDate(sortedPeriods[sortedPeriods.length - 1]);
    }
  }, [financialData, ticker]);

  const handleSliderChange = (value: number[]) => {
    if (value.length !== 2) return;
    
    // Ensure values are within bounds
    const adjusted = [
      Math.max(0, Math.min(value[0], timePeriods.length - 1)),
      Math.max(0, Math.min(value[1], timePeriods.length - 1))
    ];
    
    // Ensure start <= end
    if (adjusted[0] > adjusted[1]) {
      adjusted[0] = adjusted[1];
    }
    
    setSliderValue(adjusted);
  };

  return {
    startDate,
    endDate,
    sliderValue,
    timePeriods,
    handleSliderChange
  };
};

// Sort periods from oldest to newest (left to right)
const sortPeriodsLeftToRight = (periods: string[]): string[] => {
  return [...periods].sort((a, b) => {
    // TTM always comes last (right side)
    if (a === 'TTM') return 1;
    if (b === 'TTM') return -1;
    
    // Extract years for comparison
    const getYear = (period: string): number => {
      if (period.includes('Q')) {
        const yearMatch = period.match(/\d{4}/);
        return yearMatch ? parseInt(yearMatch[0]) : 0;
      }
      return parseInt(period);
    };
    
    const aYear = getYear(a);
    const bYear = getYear(b);
    
    // Compare years (oldest first)
    if (aYear !== bYear) {
      return aYear - bYear;
    }
    
    // If years are the same and both are quarters, compare quarters
    if (a.includes('Q') && b.includes('Q')) {
      const aQ = parseInt(a.charAt(a.indexOf('Q') + 1));
      const bQ = parseInt(b.charAt(b.indexOf('Q') + 1));
      return aQ - bQ;
    }
    
    // If one is a year and one is a quarter from that year, year comes first
    if (a.includes('Q')) return 1;
    if (b.includes('Q')) return -1;
    
    // Default string comparison
    return a.localeCompare(b);
  });
};

// Extract periods from financial data with improved handling
const extractPeriodsFromData = (data: any[]): string[] => {
  const periods = new Set<string>();
  
  data.forEach(item => {
    if (item.period === 'TTM') {
      periods.add('TTM');
    } else if (item.period && item.period !== 'annual') {
      // Direct period notation (excluding 'annual')
      periods.add(item.period);
    } else if (item.date) {
      // Extract from date
      try {
        // Handle explicit quarter notation (Q1 2023)
        if (typeof item.date === 'string' && item.date.includes('Q')) {
          periods.add(item.date);
        } else {
          // Try to parse as date
          const date = new Date(item.date);
          if (!isNaN(date.getTime())) {
            // If it's a valid date, extract year
            periods.add(date.getFullYear().toString());
          } else {
            // Try to extract year from string
            const yearMatch = item.date.match(/\b(19|20)\d{2}\b/);
            if (yearMatch) {
              periods.add(yearMatch[0]);
            }
          }
        }
      } catch (e) {
        console.warn('Error extracting period from date:', item.date);
      }
    }
  });
  
  // If we found quarterly periods (e.g., Q1 2023), also add the corresponding years
  const yearSet = new Set<string>();
  
  periods.forEach(period => {
    if (period.includes('Q')) {
      const yearMatch = period.match(/\d{4}/);
      if (yearMatch && parseInt(yearMatch[0]) >= 2011) {
        yearSet.add(yearMatch[0]);
      }
    }
  });
  
  // Merge all periods (filter out years before 2011)
  const allPeriods = Array.from(new Set([...periods, ...yearSet])).filter(period => {
    if (period === 'TTM') return true;
    if (period.includes('Q')) {
      const yearMatch = period.match(/\d{4}/);
      return yearMatch && parseInt(yearMatch[0]) >= 2011;
    }
    return !isNaN(parseInt(period)) && parseInt(period) >= 2011;
  });
  
  return allPeriods;
};