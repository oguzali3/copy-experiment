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
    "netCashFlow", "freeCashFlow", "capitalExpenditure", "investmentsInPropertyPlantAndEquipment"
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
  const annualData = financialData[ticker]?.annual?.filter((item: any) => item.period !== 'TTM') || [];
  const annualBalanceSheet = balanceSheetData?.filter((item: any) => item.period !== 'TTM') || [];
  const annualCashFlow = cashFlowData?.filter((item: any) => item.period !== 'TTM') || [];

  // Transform data based on metric types
  let transformedData = annualData.map((item: any) => {
    const period = item.period;
    let periodData: Record<string, any> = { period };

    selectedMetrics.forEach(metric => {
      if (isBalanceSheetMetric(metric)) {
        const balanceSheetItem = annualBalanceSheet.find((bs: any) => 
          new Date(bs.date).getFullYear().toString() === period
        );
        if (balanceSheetItem) {
          periodData[metric] = typeof balanceSheetItem[metric] === 'string'
            ? parseFloat(balanceSheetItem[metric].replace(/,/g, ''))
            : balanceSheetItem[metric];
        }
      } else if (isCashFlowMetric(metric)) {
        const cashFlowItem = annualCashFlow.find((cf: any) => 
          new Date(cf.date).getFullYear().toString() === period
        );
        if (cashFlowItem) {
          // For cash flow items, check both the original metric name and potential variations
          const value = cashFlowItem[metric] || cashFlowItem[metric.toLowerCase()] || 
                       cashFlowItem[metric.replace(/([A-Z])/g, '_$1').toLowerCase()];
          periodData[metric] = typeof value === 'string'
            ? parseFloat(value.replace(/,/g, ''))
            : value;
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
        console.log(`No value found for metric ${metric} in period ${period}`);
      }
    });

    return periodData;
  });

  // Add TTM data if it exists and is selected
  if (endYear === 'TTM') {
    const ttmIncomeStatement = financialData[ticker]?.annual?.find((item: any) => item.period === 'TTM');
    const ttmBalanceSheet = balanceSheetData?.find((item: any) => item.period === 'TTM');
    const ttmCashFlow = cashFlowData?.find((item: any) => item.period === 'TTM');

    if (ttmIncomeStatement || ttmBalanceSheet || ttmCashFlow) {
      const ttmData: Record<string, any> = { period: 'TTM' };

      selectedMetrics.forEach(metric => {
        if (isBalanceSheetMetric(metric) && ttmBalanceSheet) {
          ttmData[metric] = typeof ttmBalanceSheet[metric] === 'string'
            ? parseFloat(ttmBalanceSheet[metric].replace(/,/g, ''))
            : ttmBalanceSheet[metric];
        } else if (isCashFlowMetric(metric) && ttmCashFlow) {
          const value = ttmCashFlow[metric] || ttmCashFlow[metric.toLowerCase()] || 
                       ttmCashFlow[metric.replace(/([A-Z])/g, '_$1').toLowerCase()];
          ttmData[metric] = typeof value === 'string'
            ? parseFloat(value.replace(/,/g, ''))
            : value;
        } else if (ttmIncomeStatement) {
          ttmData[metric] = typeof ttmIncomeStatement[metric] === 'string'
            ? parseFloat(ttmIncomeStatement[metric].replace(/,/g, ''))
            : ttmIncomeStatement[metric];
        }

        if (ttmData[metric] === undefined) {
          ttmData[metric] = 0;
          console.log(`No TTM value found for metric ${metric}`);
        }
      });

      transformedData = [ttmData, ...transformedData];
    }
  }

  // Filter and sort data
  transformedData = filterByTimeRange(transformedData, startYear, endYear);
  transformedData = sortChronologically(transformedData);

  // Calculate statistics
  return calculateMetricStatistics(transformedData, selectedMetrics);
};