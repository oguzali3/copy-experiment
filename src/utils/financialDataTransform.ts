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
  let transformedData;

  if (hasCashFlowMetrics) {
    // Use cash flow specific transformation
    transformedData = transformCashFlowMetrics(financialData[ticker].annual, selectedMetrics);
  } else {
    // Use regular transformation for income statement and balance sheet
    transformedData = financialData[ticker].annual
      .filter((item: any) => item.period !== 'TTM')
      .map((item: any) => {
        const baseData = transformIncomeStatementMetrics(item, selectedMetrics);
        return transformBalanceSheetMetrics(
          balanceSheetData,
          item.period,
          selectedMetrics,
          baseData
        );
      });
  }

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
      transformedData.unshift(ttmData);
    }
  }

  // Filter and sort data
  transformedData = filterByTimeRange(transformedData, startYear, endYear);
  transformedData = sortChronologically(transformedData);

  console.log('Transformed financial data:', transformedData);

  // Calculate statistics
  return calculateMetricStatistics(transformedData, selectedMetrics);
};