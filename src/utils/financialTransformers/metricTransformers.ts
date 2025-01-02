import { filterOutTTM, sortChronologically } from './dataFilters';

export const transformIncomeStatementMetrics = (item: any, selectedMetrics: string[]) => {
  const transformedData: Record<string, any> = {};

  selectedMetrics.forEach(metric => {
    if (item[metric] !== undefined) {
      const value = typeof item[metric] === 'string' 
        ? parseFloat(item[metric].replace(/,/g, '')) 
        : item[metric];
      transformedData[metric] = value;
    } else {
      transformedData[metric] = 0;
    }
  });

  return transformedData;
};

export const transformBalanceSheetMetrics = (
  balanceSheetData: any[],
  period: string,
  selectedMetrics: string[],
  baseData: Record<string, any>
) => {
  if (!balanceSheetData?.length) return baseData;

  const periodData = balanceSheetData.find(item => {
    if (item.period === 'TTM' && period === 'TTM') return true;
    return item.calendarYear === period;
  });

  if (!periodData) return baseData;

  const transformedData = { ...baseData };
  selectedMetrics.forEach(metric => {
    if (periodData[metric] !== undefined) {
      const value = typeof periodData[metric] === 'string' 
        ? parseFloat(periodData[metric].replace(/,/g, ''))
        : periodData[metric];
      transformedData[metric] = value;
    }
  });

  return transformedData;
};

export const transformTTMData = (
  ttmIncomeStatement: any,
  ttmBalanceSheet: any,
  ttmCashFlow: any,
  selectedMetrics: string[]
) => {
  if (!ttmIncomeStatement && !ttmBalanceSheet && !ttmCashFlow) return null;

  const transformedData: Record<string, any> = {
    period: 'TTM'
  };

  selectedMetrics.forEach(metric => {
    // Check all statement types for the metric
    const statements = [ttmIncomeStatement, ttmBalanceSheet, ttmCashFlow];
    for (const statement of statements) {
      if (statement?.[metric] !== undefined) {
        const value = typeof statement[metric] === 'string'
          ? parseFloat(statement[metric].replace(/,/g, ''))
          : statement[metric];
        transformedData[metric] = value;
        break;
      }
    }
    
    if (transformedData[metric] === undefined) {
      transformedData[metric] = 0;
    }
  });

  return transformedData;
};

export const transformCashFlowMetrics = (cashFlowData: any[], selectedMetrics: string[]) => {
  if (!cashFlowData?.length) return [];

  return cashFlowData.map(item => {
    const transformedItem: Record<string, any> = {
      period: item.period === 'TTM' ? 'TTM' : item.calendarYear
    };

    selectedMetrics.forEach(metric => {
      if (item[metric] !== undefined) {
        const value = typeof item[metric] === 'string' 
          ? parseFloat(item[metric].replace(/,/g, '')) 
          : item[metric];
        transformedItem[metric] = value;
      } else {
        transformedItem[metric] = 0;
      }
    });

    return transformedItem;
  });
};