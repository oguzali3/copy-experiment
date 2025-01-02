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

const isCashFlowMetric = (metric: string) => {
  const cashFlowMetrics = [
    "operatingCashFlow", "investingCashFlow", "financingCashFlow", 
    "netCashFlow", "freeCashFlow", "capitalExpenditure", "netIncome",
    "depreciationAndAmortization", "deferredIncomeTax", "stockBasedCompensation",
    "changeInWorkingCapital", "accountsReceivables", "inventory", "accountsPayables",
    "otherWorkingCapital", "otherNonCashItems", "netCashProvidedByOperatingActivities",
    "investmentsInPropertyPlantAndEquipment", "acquisitionsNet", "purchasesOfInvestments",
    "salesMaturitiesOfInvestments", "otherInvestingActivites", "netCashUsedForInvestingActivites",
    "debtRepayment", "commonStockIssued", "commonStockRepurchased", "dividendsPaid",
    "otherFinancingActivites", "netCashUsedProvidedByFinancingActivities",
    "effectOfForexChangesOnCash", "netChangeInCash", "cashAtEndOfPeriod",
    "cashAtBeginningOfPeriod"
  ];
  return cashFlowMetrics.includes(metric);
};

const isBalanceSheetMetric = (metric: string) => {
  const balanceSheetMetrics = [
    "totalAssets", "totalLiabilities", "totalEquity", "cashAndCashEquivalents",
    "shortTermInvestments", "netReceivables", "inventory", "propertyPlantAndEquipment",
    "goodwill", "intangibleAssets", "longTermInvestments", "shortTermDebt",
    "accountsPayable", "deferredRevenue", "longTermDebt", "retainedEarnings"
  ];
  return balanceSheetMetrics.includes(metric);
};

export const transformFinancialData = (
  financialData: any,
  balanceSheetData: any,
  cashFlowData: any,
  selectedMetrics: string[],
  timePeriods: string[],
  sliderValue: number[],
  ticker: string
) => {
  if (!selectedMetrics.length) return [];

  const startYear = timePeriods[sliderValue[0]];
  const endYear = timePeriods[sliderValue[1]];

  // Get annual data without TTM
  const annualData = financialData[ticker].annual.filter((item: any) => item.period !== 'TTM');
  const annualBalanceSheet = balanceSheetData?.filter((item: any) => item.period !== 'TTM') || [];
  const annualCashFlow = cashFlowData?.filter((item: any) => item.period !== 'TTM') || [];
  
  // Transform data based on metric types
  let transformedData = annualData.map((item: any) => {
    const period = item.calendarYear?.toString() || new Date(item.date).getFullYear().toString();
    
    let periodData: Record<string, any> = { period };

    // Transform metrics based on their type
    selectedMetrics.forEach(metric => {
      if (isCashFlowMetric(metric)) {
        const cashFlowItem = annualCashFlow.find(cf => cf.calendarYear === period);
        if (cashFlowItem && cashFlowItem[metric] !== undefined) {
          periodData[metric] = typeof cashFlowItem[metric] === 'string'
            ? parseFloat(cashFlowItem[metric].replace(/,/g, ''))
            : cashFlowItem[metric];
        }
      } else if (isBalanceSheetMetric(metric)) {
        const balanceSheetItem = annualBalanceSheet.find(bs => bs.calendarYear === period);
        if (balanceSheetItem && balanceSheetItem[metric] !== undefined) {
          periodData[metric] = typeof balanceSheetItem[metric] === 'string'
            ? parseFloat(balanceSheetItem[metric].replace(/,/g, ''))
            : balanceSheetItem[metric];
        }
      } else {
        // Income statement metrics
        if (item[metric] !== undefined) {
          periodData[metric] = typeof item[metric] === 'string'
            ? parseFloat(item[metric].replace(/,/g, ''))
            : item[metric];
        }
      }

      // Ensure all metrics have a value
      if (periodData[metric] === undefined) {
        periodData[metric] = 0;
      }
    });

    return periodData;
  });

  // Add TTM data if it exists and is selected
  if (endYear === 'TTM') {
    const ttmIncomeStatement = financialData[ticker].annual.find((item: any) => item.period === 'TTM');
    const ttmBalanceSheet = balanceSheetData?.find((item: any) => item.period === 'TTM');
    const ttmCashFlow = cashFlowData?.find((item: any) => item.period === 'TTM');

    if (ttmIncomeStatement || ttmBalanceSheet || ttmCashFlow) {
      const transformedTTM = transformTTMData(
        ttmIncomeStatement,
        ttmBalanceSheet,
        ttmCashFlow,
        selectedMetrics
      );
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