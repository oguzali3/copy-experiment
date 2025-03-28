// timeUtils.ts - Utilities for handling time periods in financial charts

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
  
    // Extract all unique dates from the data
    const dates = data.map(item => new Date(item.date));
    
    // Sort dates chronologically (oldest to newest)
    dates.sort((a, b) => a.getTime() - b.getTime());
    
    // Create a set to store unique formatted periods (in case there are duplicates)
    const uniquePeriods = new Set<string>();
    
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
    let periodArray = Array.from(uniquePeriods);
    
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
    
    return periodArray;
  };
  
  /**
   * Helper function to get a default range of time periods if API data isn't available yet
   * @param periodType 'annual' or 'quarter'
   * @returns Array of default period strings
   */
  export const getDefaultTimePeriods = (periodType: 'annual' | 'quarter'): string[] => {
    const currentYear = new Date().getFullYear();
    
    if (periodType === 'annual') {
      // Generate last 14 years by default for annual
      return Array.from({ length: 14 }, (_, i) => (currentYear - 13 + i).toString());
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
   * Formats a date for display in charts based on period type
   * @param date Date object to format
   * @param periodType 'annual' or 'quarter'
   * @returns Formatted date string
   */
  export const formatDateForPeriod = (date: Date, periodType: 'annual' | 'quarter'): string => {
    if (periodType === 'annual') {
      return date.getFullYear().toString();
    } else {
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear().toString().slice(-2);
      return `${month} ${year}`;
    }
  };
  
  /**
   * Gets period identifier from a date string in API response
   * @param dateString Date string from API
   * @param periodType 'annual' or 'quarter'
   * @returns Formatted period identifier
   */
  export const getPeriodIdentifier = (dateString: string, periodType: 'annual' | 'quarter'): string => {
    const date = new Date(dateString);
    return formatDateForPeriod(date, periodType);
  };
  
  /**
   * Creates a human-readable date range description
   * @param startPeriod Start period string
   * @param endPeriod End period string
   * @param periodType 'annual' or 'quarter'
   * @returns Formatted date range string
   */
  export const formatDateRange = (startPeriod: string, endPeriod: string, periodType: 'annual' | 'quarter'): string => {
    if (!startPeriod || !endPeriod) return '';
    
    if (periodType === 'annual') {
      return `${startPeriod} to ${endPeriod}`;
    } else {
      // For quarterly, we could expand this to show more context like "Q1 2023 to Q4 2023"
      return `${startPeriod} to ${endPeriod}`;
    }
  };
  
  /**
   * Maps API data to the correct period format for charting
   * @param data API data item with date property
   * @param periodType 'annual' or 'quarter'
   * @returns Object with period identifier and original data
   */
  export const mapDataToPeriod = (data: any, periodType: 'annual' | 'quarter'): any => {
    if (!data || !data.date) return null;
    
    const periodId = getPeriodIdentifier(data.date, periodType);
    return {
      ...data,
      periodId
    };
  };