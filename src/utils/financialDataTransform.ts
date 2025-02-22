import { filterByTimeRange, sortChronologically } from "./financialTransformers/dataFilters";
import { calculateMetricStatistics } from "./financialTransformers/metricCalculations";

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

  // Format cash flow data
  const formattedCashFlowData = Array.isArray(cashFlowData) 
    ? cashFlowData.map(item => ({
        ...item,
        period: timeFrame === 'quarterly' 
          ? formatQuarterPeriod(item.date)
          : (item.calendarYear || (item.period === 'TTM' ? 'TTM' : item.date?.split('-')[0]))
      }))
    : [];

  // Create a map of balance sheet data by year
  const balanceSheetMap = new Map();
  if (Array.isArray(balanceSheetData)) {
    balanceSheetData.forEach(item => {
      const year = new Date(item.date).getFullYear().toString();
      balanceSheetMap.set(year, item);
    });
  }

  // Get period data from income statement
  let periodData;
  if (timeFrame === 'quarterly') {
    periodData = Array.isArray(financialData) 
      ? financialData.map(item => ({
          ...item,
          period: formatQuarterPeriod(item.date)
        }))
      : [];
  } else {
    periodData = (financialData[ticker]?.annual?.filter((item: any) => item.period !== 'TTM') || []);
  }

  // Transform data based on metric types
  let transformedData = periodData.map((item: any) => {
    const period = item.period;
    let periodData: Record<string, any> = { period };

    selectedMetrics.forEach(metric => {
      if (isBalanceSheetMetric(metric)) {
        const balanceSheetItem = balanceSheetMap.get(period);
        if (balanceSheetItem) {
          periodData[metric] = balanceSheetItem[metric]?.toString() || "0";
        } else {
          periodData[metric] = "0";
        }
      } else if (isCashFlowMetric(metric)) {
        const cashFlowItem = formattedCashFlowData.find((cf: any) => cf.period === period);
        if (cashFlowItem) {
          periodData[metric] = cashFlowItem[metric]?.toString() || "0";
        } else {
          periodData[metric] = "0";
        }
      } else {
        // Income statement metrics
        periodData[metric] = item[metric]?.toString() || "0";
      }
    });

    return periodData;
  });

  // Add TTM data if it exists and is selected
  if (endYear === 'TTM') {
    const ttmIncomeStatement = timeFrame === 'quarterly'
      ? Array.isArray(financialData) 
        ? financialData.find((item: any) => item.period === 'TTM')
        : null
      : financialData[ticker]?.annual?.find((item: any) => item.period === 'TTM');

    const ttmBalanceSheet = Array.isArray(balanceSheetData) 
      ? balanceSheetData.find(item => item.period === 'TTM')
      : null;
    const ttmCashFlow = formattedCashFlowData?.find((item: any) => item.period === 'TTM');

    if (ttmIncomeStatement || ttmBalanceSheet || ttmCashFlow) {
      const ttmData: Record<string, any> = { period: 'TTM' };

      selectedMetrics.forEach(metric => {
        if (isBalanceSheetMetric(metric) && ttmBalanceSheet) {
          ttmData[metric] = ttmBalanceSheet[metric]?.toString() || "0";
        } else if (isCashFlowMetric(metric) && ttmCashFlow) {
          ttmData[metric] = ttmCashFlow[metric]?.toString() || "0";
        } else if (ttmIncomeStatement) {
          ttmData[metric] = ttmIncomeStatement[metric]?.toString() || "0";
        } else {
          ttmData[metric] = "0";
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

const formatQuarterPeriod = (date: string) => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  return `Q${quarter} ${year}`;
};