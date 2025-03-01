export const transformFinancialData = (
  incomeStatementData: any,
  balanceSheetData: any,
  cashFlowData: any,
  keyMetricsData: any = [],
  financialRatiosData: any = [],
  selectedMetrics: string[],
  timePeriods: string[],
  sliderValue: number[],
  ticker: string,
  timeFrame: string
) => {
  // Ensure all data is normalized to arrays
  let incomeData = normalizeData(incomeStatementData, ticker);
  let balanceData = normalizeData(balanceSheetData, ticker);
  let cashData = normalizeData(cashFlowData, ticker);
  let metricsData = normalizeData(keyMetricsData, ticker);
  let ratiosData = normalizeData(financialRatiosData, ticker);
  
  console.log('Normalized Income Statement Data:', incomeData);
  console.log('Normalized Balance Sheet Data:', balanceData);
  console.log('Normalized Cash Flow Data:', cashData);
  console.log('Normalized Key Metrics Data:', metricsData);
  console.log('Normalized Financial Ratios Data:', ratiosData);
  
  if (!incomeData.length && !balanceData.length && !cashData.length && 
      !metricsData.length && !ratiosData.length) {
    console.error('No valid data available after normalization');
    return [];
  }

  // Extract and standardize periods from each dataset
  const incomePeriods = extractPeriods(incomeData, timeFrame);
  const balancePeriods = extractPeriods(balanceData, timeFrame);
  const cashPeriods = extractPeriods(cashData, timeFrame);
  const metricsPeriods = extractPeriods(metricsData, timeFrame);
  const ratiosPeriods = extractPeriods(ratiosData, timeFrame);

  // Get all unique periods (keys)
  const allPeriodKeys = new Set<string>();
  incomePeriods.forEach(p => allPeriodKeys.add(p.periodKey));
  balancePeriods.forEach(p => allPeriodKeys.add(p.periodKey));
  cashPeriods.forEach(p => allPeriodKeys.add(p.periodKey));
  metricsPeriods.forEach(p => allPeriodKeys.add(p.periodKey));
  ratiosPeriods.forEach(p => allPeriodKeys.add(p.periodKey));

  // Sort the period keys chronologically (oldest to newest, left to right)
  const sortedPeriodKeys = Array.from(allPeriodKeys).sort((a, b) => {
    // TTM always comes last now (right side)
    if (a === 'TTM') return 1;
    if (b === 'TTM') return -1;
    
    // Handle quarterly format (Q1 2023, Q2 2023, etc.)
    if (a.includes('Q') && b.includes('Q')) {
      const [aQ, aYear] = a.split(' ');
      const [bQ, bYear] = b.split(' ');
      
      if (aYear !== bYear) {
        return parseInt(aYear) - parseInt(bYear); // Older years first
      }
      return parseInt(aQ.slice(1)) - parseInt(bQ.slice(1)); // Earlier quarters first
    }
    
    // Handle yearly format (just numbers)
    if (!isNaN(parseInt(a)) && !isNaN(parseInt(b))) {
      return parseInt(a) - parseInt(b); // Older years first
    }
    
    // Fallback to string comparison
    return a.localeCompare(b);
  });

  console.log('Sorted Period Keys:', sortedPeriodKeys);

  // Create data for each period, merging from all sources
  const chartData = sortedPeriodKeys.map(periodKey => {
    // Find matching data from each source
    const incomeItem = incomePeriods.find(p => p.periodKey === periodKey)?.item;
    const balanceItem = balancePeriods.find(p => p.periodKey === periodKey)?.item;
    const cashItem = cashPeriods.find(p => p.periodKey === periodKey)?.item;
    const metricsItem = metricsPeriods.find(p => p.periodKey === periodKey)?.item;
    const ratiosItem = ratiosPeriods.find(p => p.periodKey === periodKey)?.item;

    // Create period display string
    const periodDisplay = periodKey === 'TTM' ? 'TTM' : periodKey;

    // Create base object with period
    const result: any = { period: periodDisplay };

    // Add all metrics from all sources to support any potential metric selection
    processAllMetrics(result, incomeItem, balanceItem, cashItem, metricsItem, ratiosItem);

    return result;
  });
  
  // Filter out any entries that have no data for the selected metrics
  const filteredByMetrics = chartData.filter(item => {
    // If no metrics are selected, show all data
    if (!selectedMetrics.length) return true;
    
    // Check if this entry has any data for selected metrics
    return selectedMetrics.some(metric => {
      return item[metric] !== undefined && item[metric] !== null;
    });
  });

  // Slice the data based on slider values if provided
  let finalData = filteredByMetrics;
  if (sliderValue && sliderValue.length === 2 && filteredByMetrics.length > 0) {
    // Ensure slider values are within bounds
    const start = Math.max(0, Math.min(sliderValue[0], filteredByMetrics.length - 1));
    const end = Math.max(0, Math.min(sliderValue[1], filteredByMetrics.length - 1));
    
    if (start <= end) {
      finalData = filteredByMetrics.slice(start, end + 1);
    }
  }
  
  console.log('Final Transformed Chart Data:', finalData);
  return finalData;
};

// Process all possible metrics from all data sources to support any selections
const processAllMetrics = (
  result: any, 
  incomeItem: any, 
  balanceItem: any, 
  cashItem: any,
  metricsItem: any,
  ratiosItem: any
) => {
  // Income statement metrics
  if (incomeItem) {
    const incomeMetrics = [
      'revenue', 'netIncome', 'grossProfit', 'operatingIncome', 'ebitda', 'eps',
      'costOfRevenue', 'operatingExpenses', 'interestExpense', 'incomeTaxExpense',
      'researchAndDevelopmentExpenses', 'sellingGeneralAndAdministrativeExpenses',
      'revenueGrowth', 'netIncomeGrowth', 'epsGrowth', 'ebitdaGrowth'
    ];
    
    incomeMetrics.forEach(metric => {
      if (incomeItem[metric] !== undefined) {
        result[metric] = parseNumericValue(incomeItem[metric]);
      }
    });
  }
  
  // Balance sheet metrics
  if (balanceItem) {
    const balanceMetrics = [
      'totalAssets', 'totalLiabilities', 'totalEquity', 'cashAndCashEquivalents',
      'totalDebt', 'netDebt', 'inventory', 'accountsReceivable', 'accountsPayable',
      'shortTermDebt', 'longTermDebt', 'goodwill', 'intangibleAssets',
      'totalCurrentAssets', 'totalCurrentLiabilities', 'totalNonCurrentAssets',
      'totalNonCurrentLiabilities', 'retainedEarnings', 'commonStock',
      'preferredStock', 'propertyPlantEquipmentNet'
    ];
    
    balanceMetrics.forEach(metric => {
      if (balanceItem[metric] !== undefined) {
        result[metric] = parseNumericValue(balanceItem[metric]);
      }
    });
  }
  
  // Cash flow metrics
  if (cashItem) {
    const cashFlowMetrics = [
      'operatingCashFlow', 'freeCashFlow', 'capitalExpenditure',
      'netCashProvidedByOperatingActivities', 'netCashUsedForInvestingActivites',
      'netCashUsedProvidedByFinancingActivities', 'dividendsPaid',
      'stockBasedCompensation', 'depreciationAndAmortization',
      'changeInWorkingCapital', 'cashAtEndOfPeriod', 'cashAtBeginningOfPeriod'
    ];
    
    cashFlowMetrics.forEach(metric => {
      if (cashItem[metric] !== undefined) {
        result[metric] = parseNumericValue(cashItem[metric]);
      }
    });
  }

  // Key metrics
  if (metricsItem) {
    const keyMetricsFields = [
      'revenuePerShare', 'netIncomePerShare', 'operatingCashFlowPerShare',
      'freeCashFlowPerShare', 'cashPerShare', 'bookValuePerShare', 'tangibleBookValuePerShare',
      'shareholdersEquityPerShare', 'interestDebtPerShare', 'marketCap', 'enterpriseValue',
      'peRatio', 'priceToSalesRatio', 'pocfRatio', 'pfcfRatio', 'pbRatio', 'ptbRatio',
      'evToSales', 'enterpriseValueOverEBITDA', 'evToOperatingCashFlow', 'earningsYield',
      'freeCashFlowYield', 'debtToEquity', 'debtToAssets', 'netDebtToEBITDA', 'currentRatio',
      'interestCoverage', 'incomeQuality', 'dividendYield', 'payoutRatio',
      'salesGeneralAndAdministrativeToRevenue', 'researchAndDdevelopementToRevenue',
      'intangiblesToTotalAssets', 'capexToOperatingCashFlow', 'capexToRevenue',
      'capexToDepreciation', 'stockBasedCompensationToRevenue', 'grahamNumber',
      'roic', 'returnOnTangibleAssets', 'grahamNetNet', 'workingCapital',
      'tangibleAssetValue', 'netCurrentAssetValue', 'investedCapital',
      'averageReceivables', 'averagePayables', 'averageInventory',
      'daysSalesOutstanding', 'daysPayablesOutstanding', 'daysOfInventoryOnHand',
      'receivablesTurnover', 'payablesTurnover', 'inventoryTurnover', 'roe', 'capexPerShare'
    ];
    
    keyMetricsFields.forEach(metric => {
      if (metricsItem[metric] !== undefined) {
        result[metric] = parseNumericValue(metricsItem[metric]);
      }
    });
  }

  // Financial ratios
  if (ratiosItem) {
    const ratioFields = [
      'currentRatio', 'quickRatio', 'cashRatio', 'daysOfSalesOutstanding',
      'daysOfInventoryOutstanding', 'operatingCycle', 'daysOfPayablesOutstanding',
      'cashConversionCycle', 'grossProfitMargin', 'operatingProfitMargin',
      'pretaxProfitMargin', 'netProfitMargin', 'effectiveTaxRate', 'returnOnAssets',
      'returnOnEquity', 'returnOnCapitalEmployed', 'netIncomePerEBT', 'ebtPerEbit',
      'ebitPerRevenue', 'debtRatio', 'debtEquityRatio', 'longTermDebtToCapitalization',
      'totalDebtToCapitalization', 'interestCoverage', 'cashFlowToDebtRatio',
      'companyEquityMultiplier', 'receivablesTurnover', 'payablesTurnover',
      'inventoryTurnover', 'fixedAssetTurnover', 'assetTurnover', 'operatingCashFlowPerShare',
      'freeCashFlowPerShare', 'cashPerShare', 'payoutRatio', 'operatingCashFlowSalesRatio',
      'freeCashFlowOperatingCashFlowRatio', 'cashFlowCoverageRatios', 'shortTermCoverageRatios',
      'capitalExpenditureCoverageRatio', 'dividendPaidAndCapexCoverageRatio',
      'dividendPayoutRatio', 'priceBookValueRatio', 'priceToBookRatio', 'priceToSalesRatio',
      'priceEarningsRatio', 'priceToFreeCashFlowsRatio', 'priceToOperatingCashFlowsRatio',
      'priceCashFlowRatio', 'priceEarningsToGrowthRatio', 'priceSalesRatio',
      'dividendYield', 'enterpriseValueMultiple', 'priceFairValue'
    ];
    
    ratioFields.forEach(metric => {
      if (ratiosItem[metric] !== undefined) {
        result[metric] = parseNumericValue(ratiosItem[metric]);
      }
    });
  }
  
  // Calculate financial ratios if we have sufficient data for standard ratios
  if (incomeItem && balanceItem) {
    // Common ratios that might not be included in the data but can be calculated
    calculateStandardRatios(result, incomeItem, balanceItem);
  }
};

// Calculate standard financial ratios from income and balance sheet data
const calculateStandardRatios = (result: any, incomeItem: any, balanceItem: any) => {
  // Only calculate if not already present in data
  
  // Profitability ratios
  if (result.returnOnAssets === undefined && 
      incomeItem.netIncome !== undefined && 
      balanceItem.totalAssets !== undefined && 
      parseNumericValue(balanceItem.totalAssets) !== 0) {
    result.returnOnAssets = (parseNumericValue(incomeItem.netIncome) / parseNumericValue(balanceItem.totalAssets)) * 100;
  }
  
  if (result.returnOnEquity === undefined && 
      incomeItem.netIncome !== undefined && 
      balanceItem.totalEquity !== undefined && 
      parseNumericValue(balanceItem.totalEquity) !== 0) {
    result.returnOnEquity = (parseNumericValue(incomeItem.netIncome) / parseNumericValue(balanceItem.totalEquity)) * 100;
  }
  
  if (result.profitMargin === undefined && 
      incomeItem.netIncome !== undefined && 
      incomeItem.revenue !== undefined && 
      parseNumericValue(incomeItem.revenue) !== 0) {
    result.profitMargin = (parseNumericValue(incomeItem.netIncome) / parseNumericValue(incomeItem.revenue)) * 100;
  }
  
  if (result.operatingMargin === undefined && 
      incomeItem.operatingIncome !== undefined && 
      incomeItem.revenue !== undefined && 
      parseNumericValue(incomeItem.revenue) !== 0) {
    result.operatingMargin = (parseNumericValue(incomeItem.operatingIncome) / parseNumericValue(incomeItem.revenue)) * 100;
  }
};

// Helper function to parse numeric values from different formats
const parseNumericValue = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove any non-numeric characters except decimal point and minus sign
    const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Helper function to normalize data to array format regardless of input format
const normalizeData = (data: any, ticker: string): any[] => {
  // If it's null or undefined, return empty array
  if (!data) return [];
  
  // If it's already an array, return it
  if (Array.isArray(data)) return data;
  
  // If it has ticker.[period] structure
  if (typeof data === 'object' && data[ticker]) {
    const periods = ['annual', 'quarter', 'ttm'];
    for (const period of periods) {
      if (data[ticker][period] && Array.isArray(data[ticker][period])) {
        return data[ticker][period];
      }
    }
  }
  
  // If it has just [period] structure
  if (typeof data === 'object') {
    const periods = ['annual', 'quarter', 'ttm'];
    for (const period of periods) {
      if (data[period] && Array.isArray(data[period])) {
        return data[period];
      }
    }
    
    // Try to find any array property
    for (const key in data) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }
  }
  
  // If we get here, we couldn't normalize the data
  console.warn('Unable to normalize data:', data);
  return [];
};

// Extract standardized period information from data
const extractPeriods = (data: any[], timeFrame: string) => {
  return data.map(item => {
    let periodKey;
    
    // Handle TTM period
    if (item.period === 'TTM') {
      periodKey = 'TTM';
    }
    // For annual periods, use year
    else if ((timeFrame === 'annual' || timeFrame === 'ttm') && item.date) {
      // Extract year from date
      const year = new Date(item.date).getFullYear();
      // Check if year is valid
      if (!isNaN(year)) {
        periodKey = year.toString();
      } else {
        // Try to extract year from string directly
        const yearMatch = item.date.match(/\b(19|20)\d{2}\b/);
        periodKey = yearMatch ? yearMatch[0] : 'unknown';
      }
    }
    // For quarterly periods, use quarter and year
    else if (timeFrame === 'quarterly' && item.date) {
      // Try to parse date
      const date = new Date(item.date);
      if (!isNaN(date.getTime())) {
        const quarter = Math.floor((date.getMonth() + 3) / 3);
        periodKey = `Q${quarter} ${date.getFullYear()}`;
      } else {
        // If date parsing fails, try to extract quarter and year from string
        const qMatch = item.date.match(/Q([1-4])\s*(20\d{2})/i);
        if (qMatch) {
          periodKey = `Q${qMatch[1]} ${qMatch[2]}`;
        } else {
          periodKey = item.date;
        }
      }
    }
    // For explicit period notation in data
    else if (typeof item.period === 'string' && item.period !== 'TTM') {
      periodKey = item.period;
    }
    // Fallback to date if available
    else if (item.date) {
      // Try different formats
      if (typeof item.date === 'string' && item.date.includes('Q')) {
        // Already in quarter format: "Q1 2023"
        periodKey = item.date;
      } else {
        try {
          // Extract year from date
          const year = new Date(item.date).getFullYear();
          if (!isNaN(year)) {
            periodKey = year.toString();
          } else {
            periodKey = item.date;
          }
        } catch (e) {
          periodKey = item.date;
        }
      }
    }
    // Last resort - use a random unique key
    else {
      periodKey = `unknown-${Math.random().toString(36).substring(2, 9)}`;
    }
    
    return {
      periodKey,
      item
    };
  });
};