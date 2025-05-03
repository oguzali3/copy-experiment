export const calculateTTMGrowth = (current: any, annualData: any[]) => {
  if (!current) return null;
  if (!Array.isArray(annualData) || annualData.length < 2) return null;

  // Safely extract revenue values with error handling
  const getCurrentValue = (item: any, field: string) => {
    try {
      if (!item) return 0;
      const value = item[field];
      if (value === undefined || value === null) return 0;
      
      if (typeof value === 'number') return value;
      return parseFloat(String(value).replace(/[^0-9.-]+/g, "")) || 0;
    } catch (error) {
      console.warn(`Error parsing ${field} value:`, error);
      return 0;
    }
  };

  const currentRevenue = getCurrentValue(current, 'revenue');
  const mostRecentAnnualRevenue = getCurrentValue(annualData[0], 'revenue');
  const previousAnnualRevenue = getCurrentValue(annualData[1], 'revenue');

  // Avoid division by zero
  if (previousAnnualRevenue === 0) return null;

  // Check if TTM matches most recent fiscal year (within 0.1% tolerance)
  const revenueDiff = Math.abs(currentRevenue - mostRecentAnnualRevenue);
  const tolerance = mostRecentAnnualRevenue * 0.001; // 0.1% tolerance

  if (revenueDiff <= tolerance) {
    // Use fiscal year growth rate
    const growthRate = ((mostRecentAnnualRevenue - previousAnnualRevenue) / Math.abs(previousAnnualRevenue)) * 100;
    return growthRate;
  }

  // Calculate TTM growth against previous year
  const growthRate = ((currentRevenue - previousAnnualRevenue) / Math.abs(previousAnnualRevenue)) * 100;
  return growthRate;
};