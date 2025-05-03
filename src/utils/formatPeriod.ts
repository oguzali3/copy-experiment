/**
 * Format a period label based on financial statement date and period information
 * 
 * @param date The date string to format
 * @param period Optional period string (like 'TTM', 'FY', 'Q1', etc.)
 * @param timeFrame The display time frame (annual, quarterly, ttm)
 * @returns An object with quarter and date properties
 */
 export const formatPeriod = (
    date: string, 
    period?: string, 
    timeFrame: "annual" | "quarterly" | "ttm" = "annual"
  ) => {
    // Special handling for TTM period
    if (period === 'TTM') {
      return {
        quarter: 'TTM',
        date: ''
      };
    }
    
    try {
      const dateObj = new Date(date);
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn(`Invalid date: ${date}, using fallback`);
        return {
          quarter: period || 'Unknown',
          date: ''
        };
      }
      
      // For quarterly data, display quarter and date
      if (timeFrame === 'quarterly') {
        const month = dateObj.getMonth();
        const quarter = Math.floor(month / 3) + 1;
        const year = dateObj.getFullYear();
        
        // Format the date nicely (e.g., Dec 31, 2023)
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric'
        });
        
        return {
          quarter: `Q${quarter} ${year}`,
          date: formattedDate
        };
      }
      
      // For annual data, just use the year
      return {
        quarter: dateObj.getFullYear().toString(),
        date: ''
      };
    } catch (error) {
      console.error('Error formatting period:', error);
      return {
        quarter: period || 'Unknown',
        date: ''
      };
    }
  };