import { MetricCategory } from "@/components/CategoryMetricsPanel";

// Icons for categories (using simple emoji for now, replace with actual icons)
export const CategoryIcons = {
  IncomeStatement: "bi bi-bar-chart-fill",
  BalanceSheet: "bi bi-clipboard2-data",
  CashFlow: "bi bi-cash-stack",
  Ratios: "bi bi-graph-up-arrow",
  KeyMetrics: "bi bi-key"
};


// Define all available metric categories with comprehensive metrics from your database entities
export const metricCategories: MetricCategory[] = [

  {
    id: "income_statement",
    name: "Income Statement",
    icon: CategoryIcons.IncomeStatement,
    
    metrics: [
      { id: "revenue", name: "Revenue", table: "income_statements" },
      { id: "costOfRevenue", name: "Cost of Revenue", table: "income_statements" },
      { id: "grossProfit", name: "Gross Profit", table: "income_statements" },
      { id: "grossProfitRatio", name: "Gross Profit Ratio", table: "income_statements" },
      { id: "ResearchAndDevelopmentExpenses", name: "R&D Expenses", table: "income_statements" },
      { id: "GeneralAndAdministrativeExpenses", name: "G&A Expenses", table: "income_statements" },
      { id: "SellingAndMarketingExpenses", name: "Sales & Marketing Expenses", table: "income_statements" },
      { id: "SellingGeneralAndAdministrativeExpenses", name: "SG&A Expenses", table: "income_statements" },
      { id: "otherExpenses", name: "Other Expenses", table: "income_statements" },
      { id: "operatingExpenses", name: "Operating Expenses", table: "income_statements" },
      { id: "costAndExpenses", name: "Total Costs and Expenses", table: "income_statements" },
      { id: "interestExpense", name: "Interest Expense", table: "income_statements" },
      { id: "interestIncome", name: "Interest Income", table: "income_statements" },
      { id: "depreciationAndAmortization", name: "Depreciation & Amortization", table: "income_statements" },
      { id: "EBITDA", name: "EBITDA", table: "income_statements" },
      { id: "EBITDARatio", name: "EBITDA Ratio", table: "income_statements" },
      { id: "operatingIncome", name: "Operating Income", table: "income_statements" },
      { id: "operatingIncomeRatio", name: "Operating Income Ratio", table: "income_statements" },
      { id: "totalOtherIncomeExpensesNet", name: "Total Other Income/Expenses", table: "income_statements" },
      { id: "incomeBeforeTax", name: "Income Before Tax", table: "income_statements" },
      { id: "incomeBeforeTaxRatio", name: "Income Before Tax Ratio", table: "income_statements" },
      { id: "incomeTaxExpense", name: "Income Tax Expense", table: "income_statements" },
      { id: "netIncome", name: "Net Income", table: "income_statements" },
      { id: "netIncomeRatio", name: "Net Income Ratio", table: "income_statements" },
      { id: "EPS", name: "EPS", table: "income_statements" },
      { id: "EPSDiluted", name: "EPS Diluted", table: "income_statements" },
      { id: "weightedAverageShsOut", name: "Weighted Average Shares Outstanding", table: "income_statements" },
      { id: "weightedAverageShsOutDil", name: "Weighted Average Shares Outstanding (Diluted)", table: "income_statements" },
    ]
  },
  {
    id: "balance_sheet",
    name: "Balance Sheet",
    icon: CategoryIcons.BalanceSheet,
    metrics: [
      // Assets
      { id: "cashAndCashEquivalents", name: "Cash & Cash Equivalents", table: "balance_sheet_statements" },
      { id: "shortTermInvestments", name: "Short Term Investments", table: "balance_sheet_statements" },
      { id: "cashAndShortTermInvestments", name: "Cash & Short Term Investments", table: "balance_sheet_statements" },
      { id: "netReceivables", name: "Net Receivables", table: "balance_sheet_statements" },
      { id: "inventory", name: "Inventory", table: "balance_sheet_statements" },
      { id: "otherCurrentAssets", name: "Other Current Assets", table: "balance_sheet_statements" },
      { id: "totalCurrentAssets", name: "Total Current Assets", table: "balance_sheet_statements" },
      { id: "propertyPlantEquipmentNet", name: "Property, Plant & Equipment (Net)", table: "balance_sheet_statements" },
      { id: "goodwill", name: "Goodwill", table: "balance_sheet_statements" },
      { id: "intangibleAssets", name: "Intangible Assets", table: "balance_sheet_statements" },
      { id: "goodwillAndIntangibleAssets", name: "Goodwill & Intangible Assets", table: "balance_sheet_statements" },
      { id: "longTermInvestments", name: "Long Term Investments", table: "balance_sheet_statements" },
      { id: "taxAssets", name: "Tax Assets", table: "balance_sheet_statements" },
      { id: "otherNonCurrentAssets", name: "Other Non-Current Assets", table: "balance_sheet_statements" },
      { id: "totalNonCurrentAssets", name: "Total Non-Current Assets", table: "balance_sheet_statements" },
      { id: "otherAssets", name: "Other Assets", table: "balance_sheet_statements" },
      { id: "totalAssets", name: "Total Assets", table: "balance_sheet_statements" },
      
      // Liabilities
      { id: "accountPayables", name: "Accounts Payable", table: "balance_sheet_statements" },
      { id: "shortTermDebt", name: "Short Term Debt", table: "balance_sheet_statements" },
      { id: "taxPayables", name: "Tax Payables", table: "balance_sheet_statements" },
      { id: "deferredRevenue", name: "Deferred Revenue", table: "balance_sheet_statements" },
      { id: "otherCurrentLiabilities", name: "Other Current Liabilities", table: "balance_sheet_statements" },
      { id: "totalCurrentLiabilities", name: "Total Current Liabilities", table: "balance_sheet_statements" },
      { id: "longTermDebt", name: "Long Term Debt", table: "balance_sheet_statements" },
      { id: "deferredRevenueNonCurrent", name: "Deferred Revenue (Non-Current)", table: "balance_sheet_statements" },
      { id: "deferrredTaxLiabilitiesNonCurrent", name: "Deferred Tax Liabilities", table: "balance_sheet_statements" },
      { id: "otherNonCurrentLiabilities", name: "Other Non-Current Liabilities", table: "balance_sheet_statements" },
      { id: "totalNonCurrentLiabilities", name: "Total Non-Current Liabilities", table: "balance_sheet_statements" },
      { id: "otherLiabilities", name: "Other Liabilities", table: "balance_sheet_statements" },
      { id: "capitalLeaseObligations", name: "Capital Lease Obligations", table: "balance_sheet_statements" },
      { id: "totalLiabilities", name: "Total Liabilities", table: "balance_sheet_statements" },
      
      // Equity
      { id: "commonStock", name: "Common Stock", table: "balance_sheet_statements" },
      { id: "retainedEarnings", name: "Retained Earnings", table: "balance_sheet_statements" },
      { id: "accumulatedOtherComprehensiveIncomeLoss", name: "Accumulated Other Comprehensive Income/Loss", table: "balance_sheet_statements" },
      { id: "othertotalStockholdersEquity", name: "Other Stockholders' Equity", table: "balance_sheet_statements" },
      { id: "totalStockholdersEquity", name: "Total Stockholders' Equity", table: "balance_sheet_statements" },
      { id: "totalEquity", name: "Total Equity", table: "balance_sheet_statements" },
      { id: "totalLiabilitiesAndStockholdersEquity", name: "Total Liabilities & Equity", table: "balance_sheet_statements" },
      { id: "minorityInterest", name: "Minority Interest", table: "balance_sheet_statements" },
      
      // Other Balance Sheet Metrics
      { id: "totalInvestments", name: "Total Investments", table: "balance_sheet_statements" },
      { id: "totalDebt", name: "Total Debt", table: "balance_sheet_statements" },
      { id: "netDebt", name: "Net Debt", table: "balance_sheet_statements" },
    ]
  },
  {
    id: "cash_flow",
    name: "Cash Flow Statement",
    icon: CategoryIcons.CashFlow,
    metrics: [
      // Operating Activities
      { id: "netIncome", name: "Net Income", table: "cash_flow_statements" },
      { id: "depreciationAndAmortization", name: "Depreciation & Amortization", table: "cash_flow_statements" },
      { id: "deferredIncomeTax", name: "Deferred Income Tax", table: "cash_flow_statements" },
      { id: "stockBasedCompensation", name: "Stock-Based Compensation", table: "cash_flow_statements" },
      { id: "changeInWorkingCapital", name: "Change in Working Capital", table: "cash_flow_statements" },
      { id: "accountsReceivables", name: "Accounts Receivables", table: "cash_flow_statements" },
      { id: "inventory", name: "Inventory", table: "cash_flow_statements" },
      { id: "accountsPayables", name: "Accounts Payables", table: "cash_flow_statements" },
      { id: "otherWorkingCapital", name: "Other Working Capital", table: "cash_flow_statements" },
      { id: "otherNonCashItems", name: "Other Non-Cash Items", table: "cash_flow_statements" },
      { id: "netCashProvidedByOperatingActivites", name: "Net Cash from Operating Activities", table: "cash_flow_statements" },
      { id: "operatingCashFlow", name: "Operating Cash Flow", table: "cash_flow_statements" },
      
      // Investing Activities
      { id: "investmentsInPropertyPlantAndEquipment", name: "Capital Expenditures", table: "cash_flow_statements" },
      { id: "acquisitionsNet", name: "Acquisitions (Net)", table: "cash_flow_statements" },
      { id: "purchasesOfInvestments", name: "Purchases of Investments", table: "cash_flow_statements" },
      { id: "salesMaturitiesOfInvestments", name: "Sales/Maturities of Investments", table: "cash_flow_statements" },
      { id: "otherInvestingActivites", name: "Other Investing Activities", table: "cash_flow_statements" },
      { id: "netCashUsedForInvestingActivites", name: "Net Cash from Investing Activities", table: "cash_flow_statements" },
      { id: "capitalExpenditure", name: "Capital Expenditure", table: "cash_flow_statements" },
      
      // Financing Activities
      { id: "debtRepayment", name: "Debt Repayment", table: "cash_flow_statements" },
      { id: "commonStockIssued", name: "Common Stock Issued", table: "cash_flow_statements" },
      { id: "commonStockRepurchased", name: "Common Stock Repurchased", table: "cash_flow_statements" },
      { id: "dividendsPaid", name: "Dividends Paid", table: "cash_flow_statements" },
      { id: "otherFinancingActivites", name: "Other Financing Activities", table: "cash_flow_statements" },
      { id: "netCashUsedProvidedByFinancingActivities", name: "Net Cash from Financing Activities", table: "cash_flow_statements" },
      
      // Other Cash Flow Metrics
      { id: "effectOfForexChangesOnCash", name: "Effect of Forex Changes on Cash", table: "cash_flow_statements" },
      { id: "netChangeInCash", name: "Net Change in Cash", table: "cash_flow_statements" },
      { id: "cashAtEndOfPeriod", name: "Cash at End of Period", table: "cash_flow_statements" },
      { id: "cashAtBeginningOfPeriod", name: "Cash at Beginning of Period", table: "cash_flow_statements" },
      { id: "freeCashFlow", name: "Free Cash Flow", table: "cash_flow_statements" },
    ]
  },
  {
    id: "ratios",
    name: "Financial Ratios",
    icon: CategoryIcons.Ratios,
    metrics: [
      // Liquidity Ratios
      { id: "currentRatio", name: "Current Ratio", table: "ratios" },
      { id: "quickRatio", name: "Quick Ratio", table: "ratios" },
      { id: "cashRatio", name: "Cash Ratio", table: "ratios" },
      { id: "daysOfSalesOutstanding", name: "Days of Sales Outstanding", table: "ratios" },
      { id: "daysOfInventoryOutstanding", name: "Days of Inventory Outstanding", table: "ratios" },
      { id: "operatingCycle", name: "Operating Cycle", table: "ratios" },
      { id: "daysOfPayablesOutstanding", name: "Days of Payables Outstanding", table: "ratios" },
      { id: "cashConversionCycle", name: "Cash Conversion Cycle", table: "ratios" },
      
      // Profitability Ratios
      { id: "grossProfitMargin", name: "Gross Profit Margin", table: "ratios" },
      { id: "operatingProfitMargin", name: "Operating Profit Margin", table: "ratios" },
      { id: "pretaxProfitMargin", name: "Pretax Profit Margin", table: "ratios" },
      { id: "netProfitMargin", name: "Net Profit Margin", table: "ratios" },
      { id: "effectiveTaxRate", name: "Effective Tax Rate", table: "ratios" },
      { id: "returnOnAssets", name: "Return on Assets (ROA)", table: "ratios" },
      { id: "returnOnEquity", name: "Return on Equity (ROE)", table: "ratios" },
      { id: "returnOnCapitalEmployed", name: "Return on Capital Employed (ROCE)", table: "ratios" },
      { id: "ebitPerRevenue", name: "EBIT per Revenue", table: "ratios" },
      
      // Debt Ratios
      { id: "debtRatio", name: "Debt Ratio", table: "ratios" },
      { id: "debtEquityRatio", name: "Debt to Equity Ratio", table: "ratios" },
      { id: "longTermDebtToCapitalization", name: "Long Term Debt to Capitalization", table: "ratios" },
      { id: "totalDebtToCapitalization", name: "Total Debt to Capitalization", table: "ratios" },
      { id: "interestCoverage", name: "Interest Coverage", table: "ratios" },
      { id: "cashFlowToDebtRatio", name: "Cash Flow to Debt Ratio", table: "ratios" },
      { id: "companyEquityMultiplier", name: "Equity Multiplier", table: "ratios" },
      
      // Operating Performance Ratios
      { id: "receivablesTurnover", name: "Receivables Turnover", table: "ratios" },
      { id: "payablesTurnover", name: "Payables Turnover", table: "ratios" },
      { id: "inventoryTurnover", name: "Inventory Turnover", table: "ratios" },
      { id: "fixedAssetTurnover", name: "Fixed Asset Turnover", table: "ratios" },
      { id: "assetTurnover", name: "Asset Turnover", table: "ratios" },
      
      // Cash Flow Ratios
      { id: "operatingCashFlowPerShare", name: "Operating Cash Flow per Share", table: "ratios" },
      { id: "freeCashFlowPerShare", name: "Free Cash Flow per Share", table: "ratios" },
      { id: "cashPerShare", name: "Cash per Share", table: "ratios" },
      { id: "operatingCashFlowSalesRatio", name: "Operating Cash Flow to Sales Ratio", table: "ratios" },
      { id: "freeCashFlowOperatingCashFlowRatio", name: "FCF to Operating Cash Flow Ratio", table: "ratios" },
      { id: "cashFlowCoverageRatios", name: "Cash Flow Coverage Ratio", table: "ratios" },
      { id: "shortTermCoverageRatios", name: "Short Term Coverage Ratio", table: "ratios" },
      { id: "capitalExpenditureCoverageRatio", name: "CapEx Coverage Ratio", table: "ratios" },
      { id: "dividendPaidAndCapexCoverageRatio", name: "Dividend & CapEx Coverage Ratio", table: "ratios" },
      
      // Dividend Ratios
      { id: "dividendPayoutRatio", name: "Dividend Payout Ratio", table: "ratios" },
      { id: "payoutRatio", name: "Payout Ratio", table: "ratios" },
      
      // Valuation Ratios
      { id: "priceBookValueRatio", name: "Price to Book Value Ratio", table: "ratios" },
      { id: "priceToBookRatio", name: "Price to Book Ratio", table: "ratios" },
      { id: "priceToSalesRatio", name: "Price to Sales Ratio", table: "ratios" },
      { id: "priceEarningsRatio", name: "Price to Earnings Ratio", table: "ratios" },
      { id: "priceToFreeCashFlowsRatio", name: "Price to Free Cash Flows Ratio", table: "ratios" },
      { id: "priceToOperatingCashFlowsRatio", name: "Price to Operating Cash Flows Ratio", table: "ratios" },
      { id: "priceCashFlowRatio", name: "Price Cash Flow Ratio", table: "ratios" },
      { id: "priceEarningsToGrowthRatio", name: "PEG Ratio", table: "ratios" },
      { id: "priceSalesRatio", name: "Price Sales Ratio", table: "ratios" },
      { id: "dividendYield", name: "Dividend Yield", table: "ratios" },
      { id: "enterpriseValueMultiple", name: "Enterprise Value Multiple", table: "ratios" },
      { id: "priceFairValue", name: "Price to Fair Value", table: "ratios" },
    ]
  },
  {
    id: "key_metrics",
    name: "Key Metrics",
    icon: CategoryIcons.KeyMetrics,
    metrics: [
      // Per Share Values
      { id: "revenuePerShare", name: "Revenue per Share", table: "key_metrics" },
      { id: "netIncomePerShare", name: "Net Income per Share", table: "key_metrics" },
      { id: "operatingCashFlowPerShare", name: "Operating Cash Flow per Share", table: "key_metrics" },
      { id: "freeCashFlowPerShare", name: "Free Cash Flow per Share", table: "key_metrics" },
      { id: "cashPerShare", name: "Cash per Share", table: "key_metrics" },
      { id: "bookValuePerShare", name: "Book Value per Share", table: "key_metrics" },
      { id: "tangibleBookValuePerShare", name: "Tangible Book Value per Share", table: "key_metrics" },
      { id: "shareholdersEquityPerShare", name: "Shareholders Equity per Share", table: "key_metrics" },
      { id: "interestDebtPerShare", name: "Interest Debt per Share", table: "key_metrics" },
      { id: "capexPerShare", name: "Capital Expenditure per Share", table: "key_metrics" },
      
      // Valuation Metrics
      { id: "marketCap", name: "Market Capitalization", table: "key_metrics" },
      { id: "enterpriseValue", name: "Enterprise Value", table: "key_metrics" },
      { id: "peRatio", name: "P/E Ratio", table: "key_metrics" },
      { id: "priceToSalesRatio", name: "Price to Sales Ratio", table: "key_metrics" },
      { id: "pocfRatio", name: "Price to Operating Cash Flow Ratio", table: "key_metrics" },
      { id: "pfcfRatio", name: "Price to Free Cash Flow Ratio", table: "key_metrics" },
      { id: "pbRatio", name: "Price to Book Ratio", table: "key_metrics" },
      { id: "ptbRatio", name: "Price to Tangible Book Ratio", table: "key_metrics" },
      { id: "evToSales", name: "EV to Sales", table: "key_metrics" },
      { id: "enterpriseValueOverEBITDA", name: "EV to EBITDA", table: "key_metrics" },
      { id: "evToOperatingCashFlow", name: "EV to Operating Cash Flow", table: "key_metrics" },
      { id: "earningsYield", name: "Earnings Yield", table: "key_metrics" },
      { id: "freeCashFlowYield", name: "Free Cash Flow Yield", table: "key_metrics" },
      { id: "dividendYield", name: "Dividend Yield", table: "key_metrics" },
      
      // Financial Strength Metrics
      { id: "debtToEquity", name: "Debt to Equity", table: "key_metrics" },
      { id: "debtToAssets", name: "Debt to Assets", table: "key_metrics" },
      { id: "netDebtToEBITDA", name: "Net Debt to EBITDA", table: "key_metrics" },
      { id: "currentRatio", name: "Current Ratio", table: "key_metrics" },
      { id: "interestCoverage", name: "Interest Coverage", table: "key_metrics" },
      { id: "incomeQuality", name: "Income Quality", table: "key_metrics" },
      
      // Efficiency Metrics
      { id: "salesGeneralAndAdministrativeToRevenue", name: "SG&A to Revenue", table: "key_metrics" },
      { id: "researchAndDdevelopementToRevenue", name: "R&D to Revenue", table: "key_metrics" },
      { id: "intangiblesToTotalAssets", name: "Intangibles to Total Assets", table: "key_metrics" },
      { id: "capexToOperatingCashFlow", name: "CapEx to Operating Cash Flow", table: "key_metrics" },
      { id: "capexToRevenue", name: "CapEx to Revenue", table: "key_metrics" },
      { id: "capexToDepreciation", name: "CapEx to Depreciation", table: "key_metrics" },
      { id: "stockBasedCompensationToRevenue", name: "Stock-Based Compensation to Revenue", table: "key_metrics" },
      
      // Other Metrics
      { id: "grahamNumber", name: "Graham Number", table: "key_metrics" },
      { id: "roic", name: "Return on Invested Capital (ROIC)", table: "key_metrics" },
      { id: "returnOnTangibleAssets", name: "Return on Tangible Assets", table: "key_metrics" },
      { id: "grahamNetNet", name: "Graham Net-Net", table: "key_metrics" },
      { id: "workingCapital", name: "Working Capital", table: "key_metrics" },
      { id: "tangibleAssetValue", name: "Tangible Asset Value", table: "key_metrics" },
      { id: "netCurrentAssetValue", name: "Net Current Asset Value", table: "key_metrics" },
      { id: "investedCapital", name: "Invested Capital", table: "key_metrics" },
      
      // Efficiency & Turnover Metrics
      { id: "averageReceivables", name: "Average Receivables", table: "key_metrics" },
      { id: "averagePayables", name: "Average Payables", table: "key_metrics" },
      { id: "averageInventory", name: "Average Inventory", table: "key_metrics" },
      { id: "daysSalesOutstanding", name: "Days Sales Outstanding", table: "key_metrics" },
      { id: "daysPayablesOutstanding", name: "Days Payables Outstanding", table: "key_metrics" },
      { id: "daysOfInventoryOnHand", name: "Days of Inventory on Hand", table: "key_metrics" },
      { id: "receivablesTurnover", name: "Receivables Turnover", table: "key_metrics" },
      { id: "payablesTurnover", name: "Payables Turnover", table: "key_metrics" },
      { id: "inventoryTurnover", name: "Inventory Turnover", table: "key_metrics" },
      { id: "roe", name: "Return on Equity (ROE)", table: "key_metrics" },
    ]
  },
  {
    id: 'market-data',
    name: 'Market Data',
    icon: 'bi bi-graph-up', // Use appropriate icon
    metrics: [
      { id: 'price', name: 'Daily Price', table: 'market-data' },
      { id: 'marketCap', name: 'Market Cap', table: 'market-data' },
      { id: 'peRatio', name: 'P/E Ratio', table: 'market-data' },
      { id: 'psRatio', name: 'P/S Ratio', table: 'market-data' },
      { id: 'pfcfRatio', name: 'P/FCF Ratio', table: 'market-data' },
      { id: 'pcfRatio', name: 'P/CF Ratio', table: 'market-data' },
      { id: 'pbRatio', name: 'P/B Ratio', table: 'market-data' },
      { id: 'fcfYield', name: 'Free Cash Flow Yield', table: 'market-data' },
    ],
  }
];