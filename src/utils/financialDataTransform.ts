import { 
  filterOutTTM, 
  filterByTimeRange, 
  sortChronologically 
} from './financialTransformers/dataFilters';
import {
  transformIncomeStatementMetrics,
  transformBalanceSheetMetrics,
  transformTTMData
} from './financialTransformers/metricTransformers';
import { calculateMetricStatistics } from './financialTransformers/metricCalculations';

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

  // Transform regular annual data
  let transformedData = (financialData[ticker].annual || [])
    .filter(item => item.period !== 'TTM')
    .map((item: any) => {
      const baseData = transformIncomeStatementMetrics(item, selectedMetrics);
      return transformBalanceSheetMetrics(
        balanceSheetData,
        item.period,
        selectedMetrics,
        baseData
      );
    });

  // Add TTM data if available and selected
  if (endYear === 'TTM') {
    const ttmIncomeStatement = financialData[ticker].annual.find(
      (item: any) => item.period === 'TTM'
    );
    const ttmBalanceSheet = balanceSheetData?.find(
      (item: any) => item.period === 'TTM'
    );

    if (ttmIncomeStatement || ttmBalanceSheet) {
      const ttmData = transformTTMData(
        ttmIncomeStatement,
        ttmBalanceSheet,
        selectedMetrics
      );
      transformedData.push(ttmData);
    }
  }

  // Filter and sort data
  transformedData = filterByTimeRange(transformedData, startYear, endYear);
  transformedData = sortChronologically(transformedData);

  // Calculate statistics
  return calculateMetricStatistics(transformedData, selectedMetrics);
};