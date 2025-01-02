import { filterOutTTM, sortChronologically } from './dataFilters';

export const transformIncomeStatementMetrics = (item: any, selectedMetrics: string[]) => {
  const transformedData: Record<string, any> = {
    period: item.period === 'TTM' ? 'TTM' : item.period
  };

  selectedMetrics.forEach(metric => {
    if (item.metrics) {
      const metricData = item.metrics.find((m: any) => m.name === metric);
      if (metricData) {
        transformedData[metric] = parseFloat(metricData.value);
      } else {
        // If the metric is directly available on the item
        if (item[metric] !== undefined) {
          transformedData[metric] = parseFloat(item[metric]);
        } else {
          transformedData[metric] = 0;
        }
      }
    } else if (item[metric] !== undefined) {
      // Handle direct properties
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
    const itemPeriod = item.period === 'TTM' ? 'TTM' : 
      (item.calendarYear ? item.calendarYear.toString() : 
        new Date(item.date).getFullYear().toString());
    return itemPeriod === period;
  });

  if (!periodData) return baseData;

  selectedMetrics.forEach(metric => {
    if (periodData[metric] !== undefined) {
      const value = typeof periodData[metric] === 'string' 
        ? parseFloat(periodData[metric].replace(/,/g, ''))
        : periodData[metric];
      baseData[metric] = value;
    }
  });

  return baseData;
};

export const transformTTMData = (
  ttmIncomeStatement: any,
  ttmBalanceSheet: any,
  selectedMetrics: string[]
) => {
  if (!ttmIncomeStatement && !ttmBalanceSheet) return null;

  const transformedData: Record<string, any> = {
    period: 'TTM'
  };

  selectedMetrics.forEach(metric => {
    let value = 0;
    
    // Check TTM income statement first
    if (ttmIncomeStatement?.[metric] !== undefined) {
      value = typeof ttmIncomeStatement[metric] === 'string'
        ? parseFloat(ttmIncomeStatement[metric].replace(/,/g, ''))
        : ttmIncomeStatement[metric];
    }
    // Then check TTM balance sheet
    else if (ttmBalanceSheet?.[metric] !== undefined) {
      value = typeof ttmBalanceSheet[metric] === 'string'
        ? parseFloat(ttmBalanceSheet[metric].replace(/,/g, ''))
        : ttmBalanceSheet[metric];
    }

    transformedData[metric] = value;
  });

  return transformedData;
};

export const transformCashFlowMetrics = (data: any[], selectedMetrics: string[]) => {
  if (!data?.length) return [];

  return data.map(item => {
    const transformedItem: Record<string, any> = {
      period: item.period === 'TTM' ? 'TTM' : 
        (item.calendarYear ? item.calendarYear.toString() : 
          new Date(item.date).getFullYear().toString())
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