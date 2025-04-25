/* eslint-disable @typescript-eslint/no-explicit-any */
export const ensureNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'string') return parseFloat(val) || 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    return 0;
  };
  
  export const standardizePortfolioData = (portfolioData: any) => {
    if (!portfolioData) return portfolioData;
    
    // Process positions/stocks first to get accurate market values
    const positions = (portfolioData.positions || portfolioData.stocks || []).map(position => {
      const shares = ensureNumber(position.shares);
      const avgPrice = ensureNumber(position.avgPrice);
      const currentPrice = ensureNumber(position.currentPrice);
      
      // Recalculate all derived values for consistency
      const marketValue = shares * currentPrice;
      const gainLoss = marketValue - shares * avgPrice;
      const gainLossPercent = avgPrice > 0 
        ? ((currentPrice - avgPrice) / avgPrice) * 100
        : 0;
      
      return {
        ...position,
        shares,
        avgPrice,
        currentPrice, 
        marketValue,
        gainLoss,
        gainLossPercent,
      };
    });
    
    // Calculate total portfolio value from recalculated position market values
    const calculatedTotalValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0);
    
    // Get the reported total value from the API
    const reportedTotalValue = ensureNumber(portfolioData.totalValue);
    
    // If there's a significant discrepancy between calculated and reported values, use calculated
    const totalValue = Math.abs(calculatedTotalValue - reportedTotalValue) > 0.5 
      ? calculatedTotalValue 
      : reportedTotalValue;
    
    console.log(`Portfolio ${portfolioData.id} - API value: ${reportedTotalValue}, Calculated: ${calculatedTotalValue}, Using: ${totalValue}`);
    
    // Get the previous day value from the API
    const previousDayValue = ensureNumber(portfolioData.previousDayValue);
    
    // Get the reported day change values from the API
    const reportedDayChange = ensureNumber(portfolioData.dayChange);
    const reportedDayChangePercent = ensureNumber(portfolioData.dayChangePercent);
    
    // Calculate our own values for fallback
    const calculatedDayChange = totalValue - previousDayValue;
    const calculatedDayChangePercent = previousDayValue > 0 
      ? (calculatedDayChange / previousDayValue) * 100
      : 0;
    
    // Use backend values if they exist and are non-zero, otherwise use calculated values
    const dayChange = (reportedDayChange !== 0) ? reportedDayChange : calculatedDayChange;
    const dayChangePercent = (reportedDayChangePercent !== 0) ? reportedDayChangePercent : calculatedDayChangePercent;
    
    // Log when there's a significant discrepancy
    if (Math.abs(calculatedDayChange - reportedDayChange) > 1 && reportedDayChange !== 0) {
      console.log(`Portfolio ${portfolioData.id}: Day change discrepancy - Backend: ${reportedDayChange}, Calculated: ${calculatedDayChange}`);
    }
      
    // Calculate percentage of portfolio for each position using the correct total
    const calculatedPositions = positions.map(position => ({
      ...position,
      percentOfPortfolio: totalValue > 0 
        ? (position.marketValue / totalValue) * 100 
        : 0
    }));
    
    // Return standardized portfolio data
    return {
      ...portfolioData,
      totalValue,
      previousDayValue,
      dayChange,
      dayChangePercent,
      // Use either positions or stocks based on what the original object had
      ...(portfolioData.positions 
        ? { positions: calculatedPositions } 
        : { stocks: calculatedPositions })
    };
};