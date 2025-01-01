export const calculateTTMGrowth = (current: any, annualData: any[]) => {
  if (!current || !Array.isArray(annualData) || annualData.length < 2) return null;

  const currentRevenue = parseFloat(String(current.revenue).replace(/[^0-9.-]+/g, ""));
  const mostRecentAnnualRevenue = parseFloat(String(annualData[0].revenue).replace(/[^0-9.-]+/g, ""));
  const previousAnnualRevenue = parseFloat(String(annualData[1].revenue).replace(/[^0-9.-]+/g, ""));

  console.log('TTM Revenue:', currentRevenue);
  console.log('Most Recent Annual Revenue:', mostRecentAnnualRevenue);
  console.log('Previous Annual Revenue:', previousAnnualRevenue);

  // Check if TTM matches most recent fiscal year (within 0.1% tolerance)
  const revenueDiff = Math.abs(currentRevenue - mostRecentAnnualRevenue);
  const tolerance = mostRecentAnnualRevenue * 0.001; // 0.1% tolerance

  if (revenueDiff <= tolerance) {
    // Use fiscal year growth rate
    const growthRate = ((mostRecentAnnualRevenue - previousAnnualRevenue) / previousAnnualRevenue) * 100;
    console.log('Using fiscal year growth rate:', growthRate);
    return growthRate;
  }

  // Calculate TTM growth against previous year
  const growthRate = ((currentRevenue - previousAnnualRevenue) / previousAnnualRevenue) * 100;
  console.log('Using TTM growth rate:', growthRate);
  return growthRate;
};