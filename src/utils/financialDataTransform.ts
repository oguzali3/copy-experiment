import { calculateMetricChange, calculateCAGR } from './financialCalculations';

export const transformFinancialData = (
  financialData: any,
  balanceSheetData: any,
  selectedMetrics: string[],
  timePeriods: string[],
  sliderValue: number[],
  ticker: string
) => {
  if (!selectedMetrics.length || !financialData?.[ticker]?.annual) return [];

  const startYear = timePeriods[sliderValue[0]];
  const endYear = timePeriods[sliderValue[1]];

  // Combine and transform both income statement and balance sheet data
  const transformedData = (financialData[ticker].annual || [])
    .filter((item: any) => item.period !== 'TTM') // Filter out TTM from regular data
    .map((item: any) => {
      const year = item.period;
      const dataPoint: Record<string, any> = { period: year };

      // Add income statement metrics
      selectedMetrics.forEach(metric => {
        if (item[metric] !== undefined) {
          dataPoint[metric] = parseFloat(item[metric]);
        }
      });

      // Find and add corresponding balance sheet metrics
      const balanceSheetItem = balanceSheetData?.find((bsItem: any) => {
        if (bsItem.period === 'TTM') return false;
        const bsYear = bsItem.date ? new Date(bsItem.date).getFullYear().toString() : bsItem.period;
        return bsYear === year;
      });

      if (balanceSheetItem) {
        selectedMetrics.forEach(metric => {
          if (balanceSheetItem[metric] !== undefined && !dataPoint[metric]) {
            dataPoint[metric] = parseFloat(balanceSheetItem[metric]);
          }
        });
      }

      return dataPoint;
    });

  // Add TTM data if available and selected
  if (endYear === 'TTM') {
    const ttmIncomeStatement = financialData[ticker].annual.find((item: any) => item.period === 'TTM');
    const ttmBalanceSheet = balanceSheetData?.find((item: any) => item.period === 'TTM');

    if (ttmIncomeStatement || ttmBalanceSheet) {
      const ttmDataPoint: Record<string, any> = { period: 'TTM' };
      
      selectedMetrics.forEach(metric => {
        if (ttmIncomeStatement?.[metric] !== undefined) {
          ttmDataPoint[metric] = parseFloat(ttmIncomeStatement[metric]);
        } else if (ttmBalanceSheet?.[metric] !== undefined) {
          ttmDataPoint[metric] = parseFloat(ttmBalanceSheet[metric]);
        }
      });

      transformedData.push(ttmDataPoint);
    }
  }

  // Filter data based on selected time range
  const filteredData = transformedData.filter((item: any) => {
    if (item.period === 'TTM') {
      return endYear === 'TTM';
    }
    const year = parseInt(item.period);
    const startYearInt = parseInt(startYear);
    const endYearInt = endYear === 'TTM' ? 
      parseInt(timePeriods[timePeriods.length - 2]) : 
      parseInt(endYear);
    
    return year >= startYearInt && year <= endYearInt;
  });

  // Sort data chronologically
  filteredData.sort((a: any, b: any) => {
    if (a.period === 'TTM') return 1;
    if (b.period === 'TTM') return -1;
    return parseInt(a.period) - parseInt(b.period);
  });

  // Calculate years for CAGR (excluding TTM)
  const nonTTMData = filteredData.filter(item => item.period !== 'TTM');
  const years = nonTTMData.length - 1;

  return filteredData.map((item: any) => {
    const metricValues = selectedMetrics.map(metric => {
      const values = nonTTMData.map(d => d[metric]);
      const totalChange = calculateMetricChange(values);
      const cagr = calculateCAGR(values, years);
      return {
        metric,
        values,
        totalChange: totalChange !== null ? `${totalChange.toFixed(2)}%` : 'NaN%',
        cagr: cagr !== null ? `${cagr.toFixed(2)}%` : 'NaN%'
      };
    });

    const enhancedDataPoint = { ...item };
    metricValues.forEach(({ metric, totalChange, cagr }) => {
      enhancedDataPoint[`${metric}_totalChange`] = totalChange;
      enhancedDataPoint[`${metric}_cagr`] = cagr;
    });

    return enhancedDataPoint;
  });
};