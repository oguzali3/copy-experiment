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
    "netCashFlow", "freeCashFlow", "capitalExpenditure", 
    "investmentsInPropertyPlantAndEquipment", "depreciationAndAmortization",
    "stockBasedCompensation", "deferredIncomeTax", "otherNonCashItems",
    "changeInWorkingCapital", "accountsReceivables", "inventory",
    "accountsPayables", "otherWorkingCapital", "netCashProvidedByOperatingActivities",
    "acquisitionsNet", "purchasesOfInvestments", "salesMaturitiesOfInvestments",
    "otherInvestingActivites", "netCashUsedForInvestingActivites", "debtRepayment",
    "commonStockIssued", "commonStockRepurchased", "dividendsPaid",
    "otherFinancingActivites", "netCashUsedProvidedByFinancingActivities",
    "effectOfForexChangesOnCash", "netChangeInCash", "cashAtEndOfPeriod",
    "cashAtBeginningOfPeriod", "netIncome"
  ];
  return cashFlowMetrics.includes(metric);
};

const isBalanceSheetMetric = (metric: string) => {
  const balanceSheetMetrics = [
    "totalAssets", "totalLiabilities", "totalEquity", "cashAndCashEquivalents",
    "shortTermInvestments", "netReceivables", "inventory", "propertyPlantAndEquipment",
    "goodwill", "intangibleAssets", "longTermInvestments", "shortTermDebt",
    "accountsPayable", "deferredRevenue", "longTermDebt", "retainedEarnings",
    "cashAndShortTermInvestments"
  ];
  return balanceSheetMetrics.includes(metric);
};

const formatQuarterPeriod = (date: string) => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  return `Q${quarter} ${year}`;
};

export const transformFinancialData = (
  financialData: any,
  balanceSheetData: any,
  cashFlowData: any,
  selectedMetrics: string[],
  timePeriods: string[],
  sliderValue: number[],
  ticker: string,
  timeFrame: 'annual' | 'quarterly' | 'ttm' = 'annual'
) => {
  if (!selectedMetrics.length) return [];

  const startYear = timePeriods[sliderValue[0]];
  const endYear = timePeriods[sliderValue[1]];

  // Format cash flow data to match the expected structure
  const formattedCashFlowData = Array.isArray(cashFlowData) 
    ? cashFlowData.map(item => ({
        ...item,
        period: timeFrame === 'quarterly' 
          ? formatQuarterPeriod(item.date)
          : (item.calendarYear || (item.period === 'TTM' ? 'TTM' : item.date?.split('-')[0]))
      }))
    : [];

  console.log('Formatted Cash Flow Data:', formattedCashFlowData);

  // Get data without TTM based on timeFrame
  const periodData = timeFrame === 'quarterly' 
    ? (Array.isArray(financialData) ? financialData : []).filter((item: any) => item.period !== 'TTM')
    : (financialData[ticker]?.annual?.filter((item: any) => item.period !== 'TTM') || []);

  const periodBalanceSheet = balanceSheetData?.filter((item: any) => item.period !== 'TTM') || [];
  const periodCashFlow = formattedCashFlowData.filter((item: any) => item.period !== 'TTM') || [];

  // Transform data based on metric types
  let transformedData = periodData.map((item: any) => {
    const period = timeFrame === 'quarterly' 
      ? formatQuarterPeriod(item.date)
      : item.period;

    let periodData: Record<string, any> = { period };

    selectedMetrics.forEach(metric => {
      if (isBalanceSheetMetric(metric)) {
        const balanceSheetItem = periodBalanceSheet.find((bs: any) => 
          timeFrame === 'quarterly'
            ? formatQuarterPeriod(bs.date) === period
            : new Date(bs.date).getFullYear().toString() === period
        );
        if (balanceSheetItem) {
          periodData[metric] = typeof balanceSheetItem[metric] === 'string'
            ? parseFloat(balanceSheetItem[metric].replace(/,/g, ''))
            : balanceSheetItem[metric];
        }
      } else if (isCashFlowMetric(metric)) {
        const cashFlowItem = periodCashFlow.find((cf: any) => 
          timeFrame === 'quarterly'
            ? formatQuarterPeriod(cf.date) === period
            : cf.period?.toString() === period?.toString()
        );
        if (cashFlowItem) {
          periodData[metric] = typeof cashFlowItem[metric] === 'string'
            ? parseFloat(cashFlowItem[metric].replace(/,/g, ''))
            : cashFlowItem[metric];
        }
      } else {
        // Income statement metrics
        periodData[metric] = typeof item[metric] === 'string'
          ? parseFloat(item[metric].replace(/,/g, ''))
          : item[metric];
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
    const ttmIncomeStatement = timeFrame === 'quarterly'
      ? (Array.isArray(financialData) ? financialData : []).find((item: any) => item.period === 'TTM')
      : financialData[ticker]?.annual?.find((item: any) => item.period === 'TTM');
    const ttmBalanceSheet = balanceSheetData?.find((item: any) => item.period === 'TTM');
    const ttmCashFlow = formattedCashFlowData?.find((item: any) => item.period === 'TTM');

    if (ttmIncomeStatement || ttmBalanceSheet || ttmCashFlow) {
      const ttmData: Record<string, any> = { period: 'TTM' };

      selectedMetrics.forEach(metric => {
        if (isBalanceSheetMetric(metric) && ttmBalanceSheet) {
          ttmData[metric] = typeof ttmBalanceSheet[metric] === 'string'
            ? parseFloat(ttmBalanceSheet[metric].replace(/,/g, ''))
            : ttmBalanceSheet[metric];
        } else if (isCashFlowMetric(metric) && ttmCashFlow) {
          ttmData[metric] = typeof ttmCashFlow[metric] === 'string'
            ? parseFloat(ttmCashFlow[metric].replace(/,/g, ''))
            : ttmCashFlow[metric];
        } else if (ttmIncomeStatement) {
          ttmData[metric] = typeof ttmIncomeStatement[metric] === 'string'
            ? parseFloat(ttmIncomeStatement[metric].replace(/,/g, ''))
            : ttmIncomeStatement[metric];
        }

        if (ttmData[metric] === undefined) {
          ttmData[metric] = 0;
        }
      });

      transformedData = [ttmData, ...transformedData];
    }
  }

  // Filter and sort data
  transformedData = filterByTimeRange(transformedData, startYear, endYear);
  transformedData = sortChronologically(transformedData);

  console.log('Final Transformed Data:', transformedData);

  // Calculate statistics
  return calculateMetricStatistics(transformedData, selectedMetrics);
};