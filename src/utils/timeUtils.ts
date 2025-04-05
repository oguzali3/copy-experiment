// timeUtils.ts - Utilities for handling time periods in financial charts with TTM support

/**
 * Extracts time periods from API response data based on period type
 * @param data Array of objects with date property
 * @param periodType 'annual' or 'quarter'
 * @returns Array of formatted period strings
 */
 export const extractTimePeriods = (data: any[], periodType: 'annual' | 'quarter'): string[] => {
  if (!data || data.length === 0) {
    return [];
  }

  // Create a set to store unique formatted periods (in case there are duplicates)
  const uniquePeriods = new Set<string>();
  
  // First handle special cases like TTM
  data.forEach(item => {
    if (item.period === 'TTM') {
      uniquePeriods.add('TTM');
    }
  });
  
  // Extract all dates from regular periods
  const dates = data
    .filter(item => item.period !== 'TTM')
    .map(item => new Date(item.date));
  
  // Sort dates chronologically (oldest to newest)
  dates.sort((a, b) => a.getTime() - b.getTime());
  
  // Format the dates based on period type and add to set
  dates.forEach(date => {
    if (periodType === 'annual') {
      // For annual data, just return the year
      uniquePeriods.add(date.getFullYear().toString());
    } else {
      // Get the correct month (not adding 1 to getMonth() since we use toLocaleString)
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear().toString().slice(-2); // Last two digits of year
      uniquePeriods.add(`${month} ${year}`);
    }
  });
  
  // Convert the set to an array and sort
  let periodArray = Array.from(uniquePeriods).filter(p => p !== 'TTM');
  
  if (periodType === 'annual') {
    // For annual periods, sort numerically
    periodArray.sort((a, b) => parseInt(a) - parseInt(b));
  } else {
    // For quarterly periods, sort by year and month
    periodArray.sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      
      // Compare years first
      const yearDiff = parseInt(yearA) - parseInt(yearB);
      if (yearDiff !== 0) return yearDiff;
      
      // If years are the same, compare months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(monthA) - months.indexOf(monthB);
    });
  }
  
  // If TTM exists, add it at the end
  if (uniquePeriods.has('TTM')) {
    periodArray.push('TTM');
  }
  
  return periodArray;
};

/**
 * Format a date string to a period identifier
 * @param dateString Date string from API
 * @param periodType 'annual' or 'quarter'
 * @returns Formatted period identifier
 */
export const getPeriodIdentifier = (dateString: string, periodType: 'annual' | 'quarter', apiPeriod?: string): string => {
  // Special case for TTM
  if (apiPeriod === 'TTM') {
    return 'TTM';
  }
  
  const date = new Date(dateString);
  if (periodType === 'annual') {
    return date.getFullYear().toString();
  } else {
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    return `${month} ${year}`;
  }
};

/**
 * Get default time periods when no data is available
 * @param periodType 'annual' or 'quarter'
 * @returns Array of default period strings
 */
export const getDefaultTimePeriods = (periodType: 'annual' | 'quarter'): string[] => {
  const currentYear = new Date().getFullYear();
  
  if (periodType === 'annual') {
    // Generate last 14 years by default for annual (plus TTM)
    const years = Array.from({ length: 14 }, (_, i) => (currentYear - 13 + i).toString());
    years.push('TTM');
    return years;
  } else {
    // Generate last 16 quarters (4 years) for quarterly
    const quarters = [];
    const months = ['Mar', 'Jun', 'Sep', 'Dec'];
    
    for (let i = 0; i < 16; i++) {
      const yearOffset = Math.floor(i / 4);
      const quarterIndex = i % 4;
      const year = (currentYear - 3 + yearOffset).toString().slice(-2);
      quarters.push(`${months[quarterIndex]} ${year}`);
    }
    
    return quarters;
  }
};

/**
 * Calculate default slider values to show the last N years of data
 * @param periods Array of period strings
 * @param defaultYears Number of years to show by default (5 for annual, equivalent for quarterly)
 * @returns Tuple of [startIndex, endIndex] for the slider
 */
export const getDefaultTimeRange = (periods: string[], defaultYears: number = 5): [number, number] => {
  if (!periods || periods.length === 0) {
    return [0, 0];
  }
  
  const totalPeriods = periods.length;
  
  // If all periods are numeric (years), we can calculate the exact N-year range
  const allYears = periods.every(p => !isNaN(parseInt(p)) && p !== 'TTM');
  
  if (allYears) {
    const yearsArray = periods
      .filter(p => p !== 'TTM')
      .map(p => parseInt(p))
      .sort((a, b) => a - b);
    
    if (yearsArray.length > 0) {
      const latestYear = yearsArray[yearsArray.length - 1];
      const targetStartYear = latestYear - defaultYears + 1; // +1 because we want to include the current year
      
      // Find the index of the start year
      const startIndex = periods.findIndex(p => parseInt(p) >= targetStartYear && p !== 'TTM');
      
      if (startIndex !== -1) {
        const ttmIndex = periods.findIndex(p => p === 'TTM');
        const endIndex = ttmIndex !== -1 
          ? ttmIndex  // If TTM exists, include it
          : totalPeriods - 1; // Otherwise, use the last period
        
        return [startIndex, endIndex];
      }
    }
  }
  
  // For quarters or mixed data, estimate N years worth of periods
  // For quarters, that's roughly 4 quarters × N years
  let periodsToShow = periods[0].toLowerCase().includes('q') || 
                      (periods[0].match(/[A-Za-z]{3} \d{2}/) !== null) 
                      ? defaultYears * 4 : defaultYears;
  
  // Ensure we don't try to show more periods than available
  periodsToShow = Math.min(periodsToShow, totalPeriods);
  
  // If TTM exists, make sure to include it
  const ttmIndex = periods.findIndex(p => p === 'TTM');
  
  // Show the most recent periods (last X periods)
  const startIndex = Math.max(0, (ttmIndex !== -1 ? ttmIndex : totalPeriods) - periodsToShow);
  const endIndex = totalPeriods - 1;
  
  return [startIndex, endIndex];
};

/**
 * Calculate slider values based on a percentage of the range when period array changes
 * @param percentRange Percentage range [start%, end%]
 * @param periods New periods array
 * @returns [startIndex, endIndex] for the slider
 */
export const calculateRangeFromPercentage = (
  percentRange: [number, number], 
  periods: string[]
): [number, number] => {
  if (!periods || periods.length <= 1) {
    return [0, periods.length - 1];
  }
  
  const maxIndex = periods.length - 1;
  
  // Calculate new indices based on percentages
  const startIndex = Math.round((percentRange[0] / 100) * maxIndex);
  const endIndex = Math.round((percentRange[1] / 100) * maxIndex);
  
  // Ensure values are within bounds
  return [
    Math.max(0, Math.min(startIndex, maxIndex)),
    Math.max(startIndex, Math.min(endIndex, maxIndex))
  ];
};

/**
 * Convert slider indices to percentage range for persistent selection
 * @param indices [startIndex, endIndex]
 * @param totalPeriods Total number of periods
 * @returns [startPercentage, endPercentage]
 */
export const calculatePercentageFromRange = (
  indices: [number, number], 
  totalPeriods: number
): [number, number] => {
  if (totalPeriods <= 1) {
    return [0, 100];
  }
  
  const maxIndex = totalPeriods - 1;
  
  // Calculate percentages
  const startPercent = (indices[0] / maxIndex) * 100;
  const endPercent = (indices[1] / maxIndex) * 100;
  
  return [startPercent, endPercent];
};

/**
 * Maps API data to the correct period format for charting
 * @param data API data item with date property
 * @param periodType 'annual' or 'quarter'
 * @returns Object with period identifier and original data
 */
export const mapDataToPeriod = (data: any, periodType: 'annual' | 'quarter'): any => {
  if (!data) return null;
  
  // Special case for TTM
  if (data.period === 'TTM') {
    return {
      ...data,
      periodId: 'TTM'
    };
  }
  
  if (!data.date) return null;
  
  const periodId = getPeriodIdentifier(data.date, periodType);
  return {
    ...data,
    periodId
  };
};