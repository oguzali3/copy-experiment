export const transformIncomeStatementMetrics = (item: any, selectedMetrics: string[]) => {
  const dataPoint: Record<string, any> = { period: item.period };
  
  selectedMetrics.forEach(metric => {
    if (item[metric] !== undefined) {
      dataPoint[metric] = parseFloat(item[metric]);
    }
  });
  
  return dataPoint;
};

export const transformBalanceSheetMetrics = (
  balanceSheetData: any[],
  year: string,
  selectedMetrics: string[],
  existingData: Record<string, any>
) => {
  const balanceSheetItem = balanceSheetData?.find((bsItem: any) => {
    if (bsItem.period === 'TTM') return false;
    const bsYear = bsItem.date ? 
      new Date(bsItem.date).getFullYear().toString() : 
      bsItem.period;
    return bsYear === year;
  });

  if (balanceSheetItem) {
    selectedMetrics.forEach(metric => {
      if (balanceSheetItem[metric] !== undefined && !existingData[metric]) {
        existingData[metric] = parseFloat(balanceSheetItem[metric]);
      }
    });
  }

  return existingData;
};

export const transformTTMData = (
  ttmIncomeStatement: any,
  ttmBalanceSheet: any,
  selectedMetrics: string[]
) => {
  const ttmDataPoint: Record<string, any> = { period: 'TTM' };
  
  selectedMetrics.forEach(metric => {
    if (ttmIncomeStatement?.[metric] !== undefined) {
      ttmDataPoint[metric] = parseFloat(ttmIncomeStatement[metric]);
    } else if (ttmBalanceSheet?.[metric] !== undefined) {
      ttmDataPoint[metric] = parseFloat(ttmBalanceSheet[metric]);
    }
  });

  return ttmDataPoint;
};