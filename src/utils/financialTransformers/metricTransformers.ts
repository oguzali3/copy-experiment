import { filterOutTTM, sortChronologically } from './dataFilters';

export const transformIncomeStatementMetrics = (item: any, selectedMetrics: string[]) => {
  const transformedData: Record<string, any> = {
    period: item.period
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
      transformedData[metric] = parseFloat(item[metric]);
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

  const periodData = balanceSheetData.find(item => 
    item.period === period || 
    (item.calendarYear && item.calendarYear.toString() === period)
  );
  
  if (!periodData) return baseData;

  selectedMetrics.forEach(metric => {
    if (baseData[metric] === undefined && periodData[metric] !== undefined) {
      baseData[metric] = parseFloat(periodData[metric]);
    }
  });

  return baseData;
};

export const transformTTMData = (
  ttmIncomeStatement: any,
  ttmBalanceSheet: any,
  selectedMetrics: string[]
) => {
  const transformedData: Record<string, any> = {
    period: 'TTM'
  };

  selectedMetrics.forEach(metric => {
    // Check TTM income statement first
    if (ttmIncomeStatement?.[metric] !== undefined) {
      transformedData[metric] = parseFloat(ttmIncomeStatement[metric]);
    }
    // Then check TTM balance sheet
    else if (ttmBalanceSheet?.[metric] !== undefined) {
      transformedData[metric] = parseFloat(ttmBalanceSheet[metric]);
    }
    // If neither has the metric, set to 0
    else {
      transformedData[metric] = 0;
    }
  });

  return transformedData;
};

export const transformCashFlowMetrics = (data: any[], selectedMetrics: string[]) => {
  if (!data?.length) return [];

  return data.map(item => {
    const transformedItem: Record<string, any> = {
      period: item.period === 'TTM' ? 'TTM' : 
        (item.calendarYear ? item.calendarYear.toString() : item.period)
    };

    selectedMetrics.forEach(metric => {
      if (item[metric] !== undefined) {
        const value = typeof item[metric] === 'string' ? 
          parseFloat(item[metric].replace(/,/g, '')) : 
          item[metric];
        transformedItem[metric] = value;
      } else {
        transformedItem[metric] = 0;
      }
    });

    return transformedItem;
  });
};