export const orderedMetricIds = [
  // Revenue Section
  "revenue",
  "revenueGrowth",
  
  // Cost and Profit Section
  "costOfRevenue",
  "grossProfit",
  
  // Operating Expenses
  "sellingGeneralAndAdministrative",
  "researchAndDevelopment",
  "operatingExpenses",
  
  // Operating Income
  "operatingIncome",
  
  // Non-Operating Items
  "interestExpense",
  "interestAndInvestmentIncome",
  "otherNonOperatingIncome",
  
  // Income and Tax
  "incomeBeforeTax",
  "incomeTaxExpense",
  "netIncome",
  "netIncomeToCommon",
  "netIncomeGrowth",
  
  // Shares
  "sharesOutstandingBasic",
  "sharesOutstandingDiluted",
  "sharesChangeYoY",
  
  // Per Share Metrics
  "epsBasic",
  "epsDiluted",
  "epsGrowth",
  
  // Cash Flow Metrics
  "freeCashFlow",
  "freeCashFlowPerShare",
  
  // Dividend Metrics
  "dividendPerShare",
  "dividendGrowth",
  
  // Margin Metrics
  "grossMargin",
  "operatingMargin",
  "profitMargin",
  "freeCashFlowMargin",
  
  // EBITDA Metrics
  "ebitda",
  "ebitdaMargin",
  "dAndAForEbitda",
  
  // EBIT Metrics
  "ebit",
  "ebitMargin",
  
  // Other Metrics
  "effectiveTaxRate",
  "revenueAsReported"
];

export const metricKeyMapping: Record<string, string> = {
  "revenue": "revenue",
  "revenueGrowth": "revenueGrowth",
  "costOfRevenue": "costOfRevenue",
  "grossProfit": "grossProfit",
  "sellingGeneralAndAdministrativeExpenses": "sellingGeneralAndAdministrative",
  "researchAndDevelopmentExpenses": "researchAndDevelopment",
  "operatingExpenses": "operatingExpenses",
  "operatingIncome": "operatingIncome",
  "interestExpense": "interestExpense",
  "interestIncome": "interestAndInvestmentIncome",
  "totalOtherIncomeExpensesNet": "otherNonOperatingIncome",
  "incomeBeforeTax": "incomeBeforeTax",
  "incomeTaxExpense": "incomeTaxExpense",
  "netIncome": "netIncome",
  "netIncomeToCommon": "netIncomeToCommon",
  "netIncomeGrowth": "netIncomeGrowth",
  "weightedAverageShsOut": "sharesOutstandingBasic",
  "weightedAverageShsOutDil": "sharesOutstandingDiluted",
  "sharesChangeYoY": "sharesChangeYoY",
  "eps": "epsBasic",
  "epsdiluted": "epsDiluted",
  "epsGrowth": "epsGrowth",
  "freeCashFlow": "freeCashFlow",
  "freeCashFlowPerShare": "freeCashFlowPerShare",
  "dividendPerShare": "dividendPerShare",
  "dividendGrowth": "dividendGrowth",
  "grossProfitRatio": "grossMargin",
  "operatingIncomeRatio": "operatingMargin",
  "netIncomeRatio": "profitMargin",
  "freeCashFlowMargin": "freeCashFlowMargin",
  "ebitda": "ebitda",
  "ebitdaratio": "ebitdaMargin",
  "depreciationAndAmortization": "dAndAForEbitda",
  "ebit": "ebit",
  "ebitMargin": "ebitMargin",
  "effectiveTaxRate": "effectiveTaxRate",
  "revenueAsReported": "revenueAsReported"
};

export const getMetricOrder = (metricId: string): number => {
  const index = orderedMetricIds.indexOf(metricId);
  return index === -1 ? Infinity : index;
};