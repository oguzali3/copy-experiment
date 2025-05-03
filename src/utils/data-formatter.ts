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
    
    try {
      const date = new Date(dateStr);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      
      // Check if it includes time component
      if (dateStr.includes('T')) {
        // Format as datetime
        return date.toISOString().split('T')[0];
      }
      return date.toISOString().split('T')[0];
    } catch (error) {
      return dateStr;
    }
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
    // Preserve the original period if it's TTM
    period: data.period === 'TTM' ? 'TTM' : (data.period === 'annual' ? 'FY' : data.period),
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
    taxAssets: toNumber(data.taxAssets),
    otherNonCurrentAssets: toNumber(data.otherNonCurrentAssets),
    totalNonCurrentAssets: toNumber(data.totalNonCurrentAssets),
    otherAssets: toNumber(data.otherAssets),
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
    otherLiabilities: toNumber(data.otherLiabilities),
    capitalLeaseObligations: toNumber(data.capitalLeaseObligations),
    totalLiabilities: toNumber(data.totalLiabilities),
    
    // Stockholders' Equity
    commonStock: toNumber(data.commonStock),
    retainedEarnings: toNumber(data.retainedEarnings),
    accumulatedOtherComprehensiveIncomeLoss: toNumber(data.accumulatedOtherComprehensiveIncomeLoss),
    othertotalStockholdersEquity: toNumber(data.othertotalStockholdersEquity),
    totalStockholdersEquity: toNumber(data.totalStockholdersEquity),
    totalEquity: toNumber(data.totalEquity),
    totalLiabilitiesAndStockholdersEquity: toNumber(data.totalLiabilitiesAndStockholdersEquity),
    minorityInterest: toNumber(data.minorityInterest),
    totalLiabilitiesAndTotalEquity: toNumber(data.totalLiabilitiesAndTotalEquity),
    
    // Other metrics
    totalInvestments: toNumber(data.totalInvestments),
    totalDebt: toNumber(data.totalDebt),
    netDebt: toNumber(data.netDebt),
    cashAndShortTermInvestments: toNumber(data.cashAndShortTermInvestments),
    goodwillAndIntangibleAssets: toNumber(data.goodwillAndIntangibleAssets),
    preferredStock: toNumber(data.preferredStock)
  };

  // Key Metrics specific fields
  const keyMetricsFields = {
    revenuePerShare: toNumber(data.revenuePerShare),
    netIncomePerShare: toNumber(data.netIncomePerShare),
    operatingCashFlowPerShare: toNumber(data.operatingCashFlowPerShare),
    freeCashFlowPerShare: toNumber(data.freeCashFlowPerShare),
    cashPerShare: toNumber(data.cashPerShare),
    bookValuePerShare: toNumber(data.bookValuePerShare),
    tangibleBookValuePerShare: toNumber(data.tangibleBookValuePerShare),
    shareholdersEquityPerShare: toNumber(data.shareholdersEquityPerShare),
    interestDebtPerShare: toNumber(data.interestDebtPerShare),
    marketCap: toNumber(data.marketCap),
    enterpriseValue: toNumber(data.enterpriseValue),
    peRatio: toNumber(data.peRatio),
    priceToSalesRatio: toNumber(data.priceToSalesRatio),
    pocfratio: toNumber(data.pocfratio),
    pfcfRatio: toNumber(data.pfcfRatio),
    pbRatio: toNumber(data.pbRatio),
    ptbRatio: toNumber(data.ptbRatio),
    evToSales: toNumber(data.evToSales),
    enterpriseValueOverEBITDA: toNumber(data.enterpriseValueOverEBITDA),
    evToOperatingCashFlow: toNumber(data.evToOperatingCashFlow),
    earningsYield: toNumber(data.earningsYield),
    freeCashFlowYield: toNumber(data.freeCashFlowYield),
    debtToEquity: toNumber(data.debtToEquity),
    debtToAssets: toNumber(data.debtToAssets),
    netDebtToEBITDA: toNumber(data.netDebtToEBITDA),
    currentRatio: toNumber(data.currentRatio),
    interestCoverage: toNumber(data.interestCoverage),
    incomeQuality: toNumber(data.incomeQuality),
    dividendYield: toNumber(data.dividendYield),
    payoutRatio: toNumber(data.payoutRatio),
    salesGeneralAndAdministrativeToRevenue: toNumber(data.salesGeneralAndAdministrativeToRevenue),
    researchAndDdevelopementToRevenue: toNumber(data.researchAndDdevelopementToRevenue),
    intangiblesToTotalAssets: toNumber(data.intangiblesToTotalAssets),
    capexToOperatingCashFlow: toNumber(data.capexToOperatingCashFlow),
    capexToRevenue: toNumber(data.capexToRevenue),
    capexToDepreciation: toNumber(data.capexToDepreciation),
    stockBasedCompensationToRevenue: toNumber(data.stockBasedCompensationToRevenue),
    grahamNumber: toNumber(data.grahamNumber),
    roic: toNumber(data.roic),
    returnOnTangibleAssets: toNumber(data.returnOnTangibleAssets),
    grahamNetNet: toNumber(data.grahamNetNet),
    workingCapital: toNumber(data.workingCapital),
    tangibleAssetValue: toNumber(data.tangibleAssetValue),
    netCurrentAssetValue: toNumber(data.netCurrentAssetValue),
    investedCapital: toNumber(data.investedCapital),
    averageReceivables: toNumber(data.averageReceivables),
    averagePayables: toNumber(data.averagePayables),
    averageInventory: toNumber(data.averageInventory),
    daysSalesOutstanding: toNumber(data.daysSalesOutstanding),
    daysPayablesOutstanding: toNumber(data.daysPayablesOutstanding),
    daysOfInventoryOnHand: toNumber(data.daysOfInventoryOnHand),
    receivablesTurnover: toNumber(data.receivablesTurnover),
    payablesTurnover: toNumber(data.payablesTurnover),
    inventoryTurnover: toNumber(data.inventoryTurnover),
    roe: toNumber(data.roe),
    capexPerShare: toNumber(data.capexPerShare)
  };

  // Financial Ratios specific fields
  const financialRatiosFields = {
    currentRatio: toNumber(data.currentRatio),
    quickRatio: toNumber(data.quickRatio),
    cashRatio: toNumber(data.cashRatio),
    daysOfSalesOutstanding: toNumber(data.daysOfSalesOutstanding),
    daysOfInventoryOutstanding: toNumber(data.daysOfInventoryOutstanding),
    operatingCycle: toNumber(data.operatingCycle),
    daysOfPayablesOutstanding: toNumber(data.daysOfPayablesOutstanding),
    cashConversionCycle: toNumber(data.cashConversionCycle),
    grossProfitMargin: toNumber(data.grossProfitMargin),
    operatingProfitMargin: toNumber(data.operatingProfitMargin),
    pretaxProfitMargin: toNumber(data.pretaxProfitMargin),
    netProfitMargin: toNumber(data.netProfitMargin),
    effectiveTaxRate: toNumber(data.effectiveTaxRate),
    returnOnAssets: toNumber(data.returnOnAssets),
    returnOnEquity: toNumber(data.returnOnEquity),
    returnOnCapitalEmployed: toNumber(data.returnOnCapitalEmployed),
    netIncomePerEBT: toNumber(data.netIncomePerEBT),
    ebtPerEbit: toNumber(data.ebtPerEbit),
    ebitPerRevenue: toNumber(data.ebitPerRevenue),
    debtRatio: toNumber(data.debtRatio),
    debtEquityRatio: toNumber(data.debtEquityRatio),
    longTermDebtToCapitalization: toNumber(data.longTermDebtToCapitalization),
    totalDebtToCapitalization: toNumber(data.totalDebtToCapitalization),
    interestCoverage: toNumber(data.interestCoverage),
    cashFlowToDebtRatio: toNumber(data.cashFlowToDebtRatio),
    companyEquityMultiplier: toNumber(data.companyEquityMultiplier),
    receivablesTurnover: toNumber(data.receivablesTurnover),
    payablesTurnover: toNumber(data.payablesTurnover),
    inventoryTurnover: toNumber(data.inventoryTurnover),
    fixedAssetTurnover: toNumber(data.fixedAssetTurnover),
    assetTurnover: toNumber(data.assetTurnover),
    operatingCashFlowPerShare: toNumber(data.operatingCashFlowPerShare),
    freeCashFlowPerShare: toNumber(data.freeCashFlowPerShare),
    cashPerShare: toNumber(data.cashPerShare),
    payoutRatio: toNumber(data.payoutRatio),
    operatingCashFlowSalesRatio: toNumber(data.operatingCashFlowSalesRatio),
    freeCashFlowOperatingCashFlowRatio: toNumber(data.freeCashFlowOperatingCashFlowRatio),
    cashFlowCoverageRatios: toNumber(data.cashFlowCoverageRatios),
    shortTermCoverageRatios: toNumber(data.shortTermCoverageRatios),
    capitalExpenditureCoverageRatio: toNumber(data.capitalExpenditureCoverageRatio),
    dividendPaidAndCapexCoverageRatio: toNumber(data.dividendPaidAndCapexCoverageRatio),
    dividendPayoutRatio: toNumber(data.dividendPayoutRatio),
    priceBookValueRatio: toNumber(data.priceBookValueRatio),
    priceToBookRatio: toNumber(data.priceToBookRatio),
    priceToSalesRatio: toNumber(data.priceToSalesRatio),
    priceEarningsRatio: toNumber(data.priceEarningsRatio),
    priceToFreeCashFlowsRatio: toNumber(data.priceToFreeCashFlowsRatio),
    priceToOperatingCashFlowsRatio: toNumber(data.priceToOperatingCashFlowsRatio),
    priceCashFlowRatio: toNumber(data.priceCashFlowRatio),
    priceEarningsToGrowthRatio: toNumber(data.priceEarningsToGrowthRatio),
    priceSalesRatio: toNumber(data.priceSalesRatio),
    dividendYield: toNumber(data.dividendYield),
    enterpriseValueMultiple: toNumber(data.enterpriseValueMultiple),
    priceFairValue: toNumber(data.priceFairValue)
  };

  // Determine the statement type based on the presence of key fields
  const isIncomeStatement = data.revenue !== undefined;
  const isCashFlowStatement = data.freeCashFlow !== undefined;
  const isBalanceSheet = data.totalAssets !== undefined && data.totalLiabilities !== undefined;
  const isKeyMetrics = data.revenuePerShare !== undefined;
  const isFinancialRatios = data.operatingCycle !== undefined;

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

  if (isKeyMetrics) {
    return {
      ...commonFields,
      ...keyMetricsFields
    };
  }

  if (isFinancialRatios) {
    return {
      ...commonFields,
      ...financialRatiosFields
    };
  }

  // If no statement type is detected, return common fields only
  return commonFields;
}