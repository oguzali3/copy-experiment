import { 
  filterOutTTM, 
  filterByTimeRange, 
  sortChronologically 
} from './financialTransformers/dataFilters';
import {
  transformIncomeStatementMetrics,
  transformBalanceSheetMetrics,
  transformTTMData,
  transformCashFlowMetrics
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

  // Check if we're dealing with cash flow metrics
  const isCashFlowMetric = (metric: string) => {
    const cashFlowMetrics = [
      "operatingCashFlow", "investingCashFlow", "financingCashFlow", 
      "netCashFlow", "freeCashFlow", "capitalExpenditure"
    ];
    return cashFlowMetrics.includes(metric);
  };

  // Check if we're dealing with balance sheet metrics
  const isBalanceSheetMetric = (metric: string) => {
    const balanceSheetMetrics = [
      "totalAssets", "totalLiabilities", "totalEquity", "cashAndCashEquivalents",
      "shortTermInvestments", "netReceivables", "inventory", "propertyPlantAndEquipment",
      "goodwill", "intangibleAssets", "longTermInvestments", "shortTermDebt",
      "accountsPayable", "deferredRevenue", "longTermDebt", "retainedEarnings"
    ];
    return balanceSheetMetrics.includes(metric);
  };

  const hasCashFlowMetrics = selectedMetrics.some(isCashFlowMetric);
  const hasBalanceSheetMetrics = selectedMetrics.some(isBalanceSheetMetric);
  const hasIncomeStatementMetrics = selectedMetrics.some(m => 
    !isCashFlowMetric(m) && !isBalanceSheetMetric(m));

  // Get annual data without TTM
  const annualData = financialData[ticker].annual.filter((item: any) => item.period !== 'TTM');
  
  // Transform data based on metric types
  let transformedData = annualData.map((item: any) => {
    let periodData: Record<string, any> = {
      period: item.period === 'TTM' ? 'TTM' : 
        (item.calendarYear ? item.calendarYear.toString() : 
          new Date(item.date).getFullYear().toString())
    };

    // Transform income statement metrics
    if (hasIncomeStatementMetrics) {
      periodData = {
        ...periodData,
        ...transformIncomeStatementMetrics(item, selectedMetrics.filter(m => 
          !isCashFlowMetric(m) && !isBalanceSheetMetric(m)))
      };
    }

    // Transform balance sheet metrics
    if (hasBalanceSheetMetrics && balanceSheetData) {
      periodData = transformBalanceSheetMetrics(
        balanceSheetData,
        periodData.period,
        selectedMetrics.filter(isBalanceSheetMetric),
        periodData
      );
    }

    return periodData;
  });

  // Add TTM data if it exists and is selected
  if (endYear === 'TTM') {
    const ttmData = financialData[ticker].annual.find((item: any) => item.period === 'TTM');
    const ttmBalanceSheet = balanceSheetData?.find((item: any) => item.period === 'TTM');

    if (ttmData || ttmBalanceSheet) {
      const transformedTTM = transformTTMData(ttmData, ttmBalanceSheet, selectedMetrics);
      if (transformedTTM) {
        transformedData = [transformedTTM, ...transformedData];
      }
    }
  }

  // Filter and sort data
  transformedData = filterByTimeRange(transformedData, startYear, endYear);
  transformedData = sortChronologically(transformedData);

  // Remove duplicate TTM entries
  const seen = new Set();
  transformedData = transformedData.filter((item: any) => {
    const key = item.period;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log('Transformed financial data:', transformedData);

  // Calculate statistics
  return calculateMetricStatistics(transformedData, selectedMetrics);
};