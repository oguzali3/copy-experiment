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
      "netIncome", "depreciationAndAmortization", "deferredIncomeTax",
      "stockBasedCompensation", "changeInWorkingCapital", "accountsReceivables",
      "inventory", "accountsPayables", "otherWorkingCapital", "otherNonCashItems",
      "netCashProvidedByOperatingActivities", "investmentsInPropertyPlantAndEquipment",
      "acquisitionsNet", "purchasesOfInvestments", "salesMaturitiesOfInvestments",
      "otherInvestingActivites", "netCashUsedForInvestingActivites", "debtRepayment",
      "commonStockIssued", "commonStockRepurchased", "dividendsPaid",
      "otherFinancingActivites", "netCashUsedProvidedByFinancingActivities",
      "effectOfForexChangesOnCash", "netChangeInCash", "cashAtEndOfPeriod",
      "cashAtBeginningOfPeriod", "operatingCashFlow", "capitalExpenditure",
      "freeCashFlow"
    ];
    return cashFlowMetrics.includes(metric);
  };

  const hasCashFlowMetrics = selectedMetrics.some(isCashFlowMetric);

  // Get annual data without TTM
  const annualData = financialData[ticker].annual.filter((item: any) => item.period !== 'TTM');
  
  // Transform data based on metric type
  let transformedData;
  if (hasCashFlowMetrics) {
    transformedData = transformCashFlowMetrics(annualData, selectedMetrics);
  } else {
    transformedData = annualData.map((item: any) => {
      const baseData = transformIncomeStatementMetrics(item, selectedMetrics);
      return transformBalanceSheetMetrics(
        balanceSheetData?.filter((d: any) => d.period !== 'TTM'),
        item.period,
        selectedMetrics,
        baseData
      );
    });
  }

  // Add TTM data if it exists and is selected
  if (endYear === 'TTM') {
    const ttmData = financialData[ticker].annual.find((item: any) => item.period === 'TTM');
    const ttmBalanceSheet = balanceSheetData?.find((item: any) => item.period === 'TTM');

    if (ttmData || ttmBalanceSheet) {
      const transformedTTM = hasCashFlowMetrics
        ? transformCashFlowMetrics([ttmData], selectedMetrics)[0]
        : transformTTMData(ttmData, ttmBalanceSheet, selectedMetrics);
      
      if (transformedTTM) {
        transformedData = [transformedTTM, ...transformedData];
      }
    }
  }

  // Filter and sort data
  transformedData = filterByTimeRange(transformedData, startYear, endYear);
  transformedData = sortChronologically(transformedData);

  // Remove duplicate TTM entries if they exist
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