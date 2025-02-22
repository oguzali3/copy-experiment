// utils/data-formatter.ts
export function formatFinancialData(data: any) {
  if (!data) return null;

  // Helper function to convert string numbers to actual numbers
  const toNumber = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    // If it's already a number, return it
    if (typeof value === 'number') return value;
    // If it's a string, remove commas and convert
    if (typeof value === 'string') return parseFloat(value.replace(/,/g, ''));
    // Any other type, try to convert directly
    return parseFloat(value) || 0;
  };

  // Helper function to format dates
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    
    // Check if it includes time component
    if (dateStr.includes('T')) {
      // Format as datetime
      return date.toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };

  // Common fields for all financial statements
  const commonFields = {
    date: formatDate(data.date),
    symbol: data.symbol,
    reportedCurrency: data.reportedCurrency,
    cik: data.cik?.padStart(10, '0'), // Ensure CIK is 10 digits
    fillingDate: formatDate(data.fillingDate),
    acceptedDate: data.acceptedDate?.replace('T', ' ').replace('.000Z', ''),
    calendarYear: data.calendarYear?.toString(),
    period: data.period === 'annual' ? 'FY' : data.period,
    link: data.link,
    finalLink: data.finalLink
  };

  // Income Statement specific fields
  const incomeStatementFields = {
    revenue: toNumber(data.revenue),
    costOfRevenue: toNumber(data.costOfRevenue),
    grossProfit: toNumber(data.grossProfit),
    grossProfitRatio: toNumber(data.grossProfitRatio),
    researchAndDevelopmentExpenses: toNumber(data.ResearchAndDevelopmentExpenses),
    generalAndAdministrativeExpenses: toNumber(data.GeneralAndAdministrativeExpenses),
    sellingAndMarketingExpenses: toNumber(data.SellingAndMarketingExpenses),
    sellingGeneralAndAdministrativeExpenses: toNumber(data.SellingGeneralAndAdministrativeExpenses),
    otherExpenses: toNumber(data.otherExpenses),
    operatingExpenses: toNumber(data.operatingExpenses),
    costAndExpenses: toNumber(data.costAndExpenses),
    interestIncome: toNumber(data.interestIncome),
    interestExpense: toNumber(data.interestExpense),
    depreciationAndAmortization: toNumber(data.depreciationAndAmortization),
    ebitda: toNumber(data.EBITDA),
    ebitdaratio: toNumber(data.EBITDARatio),
    operatingIncome: toNumber(data.operatingIncome),
    operatingIncomeRatio: toNumber(data.operatingIncomeRatio),
    totalOtherIncomeExpensesNet: toNumber(data.totalOtherIncomeExpensesNet),
    incomeBeforeTax: toNumber(data.incomeBeforeTax),
    incomeBeforeTaxRatio: toNumber(data.incomeBeforeTaxRatio),
    incomeTaxExpense: toNumber(data.incomeTaxExpense),
    netIncome: toNumber(data.netIncome),
    netIncomeRatio: toNumber(data.netIncomeRatio),
    eps: toNumber(data.EPS),
    epsdiluted: toNumber(data.EPSDiluted),
    weightedAverageShsOut: toNumber(data.weightedAverageShsOut),
    weightedAverageShsOutDil: toNumber(data.weightedAverageShsOutDil)
  };

  // Cash Flow Statement specific fields
  const cashFlowFields = {
    netIncome: toNumber(data.netIncome),
    depreciationAndAmortization: toNumber(data.depreciationAndAmortization),
    deferredIncomeTax: toNumber(data.deferredIncomeTax),
    stockBasedCompensation: toNumber(data.stockBasedCompensation),
    changeInWorkingCapital: toNumber(data.changeInWorkingCapital),
    accountsReceivables: toNumber(data.accountsReceivables),
    inventory: toNumber(data.inventory),
    accountsPayables: toNumber(data.accountsPayables),
    otherWorkingCapital: toNumber(data.otherWorkingCapital),
    otherNonCashItems: toNumber(data.otherNonCashItems),
    netCashProvidedByOperatingActivities: toNumber(data.netCashProvidedByOperatingActivities),
    investmentsInPropertyPlantAndEquipment: toNumber(data.investmentsInPropertyPlantAndEquipment),
    acquisitionsNet: toNumber(data.acquisitionsNet),
    purchasesOfInvestments: toNumber(data.purchasesOfInvestments),
    salesMaturitiesOfInvestments: toNumber(data.salesMaturitiesOfInvestments),
    otherInvestingActivites: toNumber(data.otherInvestingActivites),
    netCashUsedForInvestingActivites: toNumber(data.netCashUsedForInvestingActivites),
    debtRepayment: toNumber(data.debtRepayment),
    commonStockIssued: toNumber(data.commonStockIssued),
    commonStockRepurchased: toNumber(data.commonStockRepurchased),
    dividendsPaid: toNumber(data.dividendsPaid),
    otherFinancingActivites: toNumber(data.otherFinancingActivites),
    netCashUsedProvidedByFinancingActivities: toNumber(data.netCashUsedProvidedByFinancingActivities),
    effectOfForexChangesOnCash: toNumber(data.effectOfForexChangesOnCash),
    netChangeInCash: toNumber(data.netChangeInCash),
    cashAtEndOfPeriod: toNumber(data.cashAtEndOfPeriod),
    cashAtBeginningOfPeriod: toNumber(data.cashAtBeginningOfPeriod),
    operatingCashFlow: toNumber(data.operatingCashFlow),
    capitalExpenditure: toNumber(data.capitalExpenditure),
    freeCashFlow: toNumber(data.freeCashFlow)
  };
// Balance Sheet specific fields
const balanceSheetFields = {
  // Assets
  cashAndCashEquivalents: toNumber(data.cashAndCashEquivalents),
  shortTermInvestments: toNumber(data.shortTermInvestments),
  netReceivables: toNumber(data.netReceivables),
  inventory: toNumber(data.inventory),
  otherCurrentAssets: toNumber(data.otherCurrentAssets),
  totalCurrentAssets: toNumber(data.totalCurrentAssets),
  propertyPlantEquipmentNet: toNumber(data.propertyPlantEquipmentNet),
  goodwill: toNumber(data.goodwill),
  intangibleAssets: toNumber(data.intangibleAssets),
  longTermInvestments: toNumber(data.longTermInvestments),
  otherNonCurrentAssets: toNumber(data.otherNonCurrentAssets),
  totalNonCurrentAssets: toNumber(data.totalNonCurrentAssets),
  totalAssets: toNumber(data.totalAssets),
  
  // Liabilities
  accountPayables: toNumber(data.accountPayables),
  shortTermDebt: toNumber(data.shortTermDebt),
  taxPayables: toNumber(data.taxPayables),
  deferredRevenue: toNumber(data.deferredRevenue),
  otherCurrentLiabilities: toNumber(data.otherCurrentLiabilities),
  totalCurrentLiabilities: toNumber(data.totalCurrentLiabilities),
  longTermDebt: toNumber(data.longTermDebt),
  deferredRevenueNonCurrent: toNumber(data.deferredRevenueNonCurrent),
  deferredTaxLiabilitiesNonCurrent: toNumber(data.deferredTaxLiabilitiesNonCurrent),
  otherNonCurrentLiabilities: toNumber(data.otherNonCurrentLiabilities),
  totalNonCurrentLiabilities: toNumber(data.totalNonCurrentLiabilities),
  totalLiabilities: toNumber(data.totalLiabilities),
  
  // Stockholders' Equity
  commonStock: toNumber(data.commonStock),
  retainedEarnings: toNumber(data.retainedEarnings),
  accumulatedOtherComprehensiveIncomeLoss: toNumber(data.accumulatedOtherComprehensiveIncomeLoss),
  othertotalStockholdersEquity: toNumber(data.othertotalStockholdersEquity),
  totalStockholdersEquity: toNumber(data.totalStockholdersEquity),
  totalLiabilitiesAndStockholdersEquity: toNumber(data.totalLiabilitiesAndStockholdersEquity),
  
  // Other metrics
  totalInvestments: toNumber(data.totalInvestments),
  totalDebt: toNumber(data.totalDebt),
  netDebt: toNumber(data.netDebt),
  cashAndShortTermInvestments: toNumber(data.cashAndShortTermInvestments),
  goodwillAndIntangibleAssets: toNumber(data.goodwillAndIntangibleAssets),
  taxAssets: toNumber(data.taxAssets),
  otherAssets: toNumber(data.otherAssets),
  otherLiabilities: toNumber(data.otherLiabilities),
  capitalLeaseObligations: toNumber(data.capitalLeaseObligations),
  preferredStock: toNumber(data.preferredStock),
  totalEquity: toNumber(data.totalEquity),
  minorityInterest: toNumber(data.minorityInterest),
  totalLiabilitiesAndTotalEquity: toNumber(data.totalLiabilitiesAndTotalEquity)

};

// Determine the statement type based on the presence of key fields
const isIncomeStatement = 'revenue' in data;
const isCashFlowStatement = 'freeCashFlow' in data;
const isBalanceSheet = 'totalAssets' in data && 'totalLiabilities' in data;

if (isIncomeStatement) {
  return {
    ...commonFields,
    ...incomeStatementFields
  };
}

if (isCashFlowStatement) {
  return {
    ...commonFields,
    ...cashFlowFields
  };
}

if (isBalanceSheet) {
  return {
    ...commonFields,
    ...balanceSheetFields
  };
}

// If no statement type is detected, return common fields only
return commonFields;
}
