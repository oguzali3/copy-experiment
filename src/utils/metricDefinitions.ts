// Define financial metrics with their display names, formats, and other properties

// Income Statement Metrics
export const INCOME_STATEMENT_METRICS = [
    { id: 'revenue', label: 'Revenue', format: 'currency', source: 'income-statement' },
    { id: 'revenueGrowth', label: 'Revenue Growth', format: 'percentage', source: 'income-statement' },
    { id: 'costOfRevenue', label: 'Cost of Revenue', format: 'currency', source: 'income-statement' },
    { id: 'grossProfit', label: 'Gross Profit', format: 'currency', source: 'income-statement' },
    { id: 'grossProfitRatio', label: 'Gross Profit Margin', format: 'percentage', source: 'income-statement' },
    { id: 'researchAndDevelopmentExpenses', label: 'R&D Expenses', format: 'currency', source: 'income-statement' },
    { id: 'generalAndAdministrativeExpenses', label: 'G&A Expenses', format: 'currency', source: 'income-statement' },
    { id: 'marketingAndSalesExpenses', label: 'Marketing Expenses', format: 'currency', source: 'income-statement' },
    { id: 'sellingGeneralAndAdministrativeExpenses', label: 'SG&A Expenses', format: 'currency', source: 'income-statement' },
    { id: 'operatingExpenses', label: 'Operating Expenses', format: 'currency', source: 'income-statement' },
    { id: 'operatingIncome', label: 'Operating Income', format: 'currency', source: 'income-statement' },
    { id: 'operatingIncomeRatio', label: 'Operating Margin', format: 'percentage', source: 'income-statement' },
    { id: 'interestExpense', label: 'Interest Expense', format: 'currency', source: 'income-statement' },
    { id: 'depreciationAndAmortization', label: 'Depreciation & Amortization', format: 'currency', source: 'income-statement' },
    { id: 'ebitda', label: 'EBITDA', format: 'currency', source: 'income-statement' },
    { id: 'ebitdaGrowth', label: 'EBITDA Growth', format: 'percentage', source: 'income-statement' },
    { id: 'ebitdaratio', label: 'EBITDA Margin', format: 'percentage', source: 'income-statement' },
    { id: 'incomeBeforeTax', label: 'Income Before Tax', format: 'currency', source: 'income-statement' },
    { id: 'incomeBeforeTaxRatio', label: 'Pre-Tax Margin', format: 'percentage', source: 'income-statement' },
    { id: 'incomeTaxExpense', label: 'Income Tax Expense', format: 'currency', source: 'income-statement' },
    { id: 'netIncome', label: 'Net Income', format: 'currency', source: 'income-statement' },
    { id: 'netIncomeGrowth', label: 'Net Income Growth', format: 'percentage', source: 'income-statement' },
    { id: 'netIncomeRatio', label: 'Net Income Margin', format: 'percentage', source: 'income-statement' },
    { id: 'eps', label: 'EPS', format: 'currency', source: 'income-statement' },
    { id: 'epsGrowth', label: 'EPS Growth', format: 'percentage', source: 'income-statement' },
    { id: 'epsdiluted', label: 'Diluted EPS', format: 'currency', source: 'income-statement' },
    { id: 'weightedAverageShsOut', label: 'Shares Outstanding', format: 'number', source: 'income-statement' },
    { id: 'weightedAverageShsOutDil', label: 'Diluted Shares Outstanding', format: 'number', source: 'income-statement' },
    { id: 'sharesChange', label: 'Shares Change', format: 'percentage', source: 'income-statement' },
  ];
  
  // Balance Sheet Metrics
  export const BALANCE_SHEET_METRICS = [
    { id: 'cashAndCashEquivalents', label: 'Cash & Cash Equivalents', format: 'currency', source: 'balance-sheet' },
    { id: 'cashGrowth', label: 'Cash Growth', format: 'percentage', source: 'balance-sheet' },
    { id: 'shortTermInvestments', label: 'Short Term Investments', format: 'currency', source: 'balance-sheet' },
    { id: 'cashAndShortTermInvestments', label: 'Cash & Short Term Investments', format: 'currency', source: 'balance-sheet' },
    { id: 'netReceivables', label: 'Net Receivables', format: 'currency', source: 'balance-sheet' },
    { id: 'inventory', label: 'Inventory', format: 'currency', source: 'balance-sheet' },
    { id: 'otherCurrentAssets', label: 'Other Current Assets', format: 'currency', source: 'balance-sheet' },
    { id: 'totalCurrentAssets', label: 'Total Current Assets', format: 'currency', source: 'balance-sheet' },
    { id: 'propertyPlantEquipmentNet', label: 'PP&E (Net)', format: 'currency', source: 'balance-sheet' },
    { id: 'goodwill', label: 'Goodwill', format: 'currency', source: 'balance-sheet' },
    { id: 'intangibleAssets', label: 'Intangible Assets', format: 'currency', source: 'balance-sheet' },
    { id: 'goodwillAndIntangibleAssets', label: 'Goodwill & Intangibles', format: 'currency', source: 'balance-sheet' },
    { id: 'longTermInvestments', label: 'Long Term Investments', format: 'currency', source: 'balance-sheet' },
    { id: 'totalAssets', label: 'Total Assets', format: 'currency', source: 'balance-sheet' },
    { id: 'accountPayables', label: 'Account Payables', format: 'currency', source: 'balance-sheet' },
    { id: 'shortTermDebt', label: 'Short Term Debt', format: 'currency', source: 'balance-sheet' },
    { id: 'totalCurrentLiabilities', label: 'Total Current Liabilities', format: 'currency', source: 'balance-sheet' },
    { id: 'longTermDebt', label: 'Long Term Debt', format: 'currency', source: 'balance-sheet' },
    { id: 'totalLiabilities', label: 'Total Liabilities', format: 'currency', source: 'balance-sheet' },
    { id: 'totalStockholdersEquity', label: 'Total Stockholders Equity', format: 'currency', source: 'balance-sheet' },
    { id: 'totalEquity', label: 'Total Equity', format: 'currency', source: 'balance-sheet' },
    { id: 'totalLiabilitiesAndStockholdersEquity', label: 'Total Liabilities & Equity', format: 'currency', source: 'balance-sheet' },
    { id: 'totalDebt', label: 'Total Debt', format: 'currency', source: 'balance-sheet' },
    { id: 'netDebt', label: 'Net Debt', format: 'currency', source: 'balance-sheet' },
  ];
  
  // Cash Flow Metrics
  export const CASH_FLOW_METRICS = [
    { id: 'netIncome', label: 'Net Income', format: 'currency', source: 'cash-flow' },
    { id: 'depreciationAndAmortization', label: 'Depreciation & Amortization', format: 'currency', source: 'cash-flow' },
    { id: 'stockBasedCompensation', label: 'Stock Based Compensation', format: 'currency', source: 'cash-flow' },
    { id: 'changeInWorkingCapital', label: 'Change in Working Capital', format: 'currency', source: 'cash-flow' },
    { id: 'netCashProvidedByOperatingActivities', label: 'Net Cash from Operations', format: 'currency', source: 'cash-flow' },
    { id: 'investmentsInPropertyPlantAndEquipment', label: 'Investments in PP&E', format: 'currency', source: 'cash-flow' },
    { id: 'acquisitionsNet', label: 'Acquisitions (Net)', format: 'currency', source: 'cash-flow' },
    { id: 'netCashUsedForInvestingActivites', label: 'Net Cash from Investing', format: 'currency', source: 'cash-flow' },
    { id: 'debtRepayment', label: 'Debt Repayment', format: 'currency', source: 'cash-flow' },
    { id: 'commonStockRepurchased', label: 'Common Stock Repurchased', format: 'currency', source: 'cash-flow' },
    { id: 'dividendsPaid', label: 'Dividends Paid', format: 'currency', source: 'cash-flow' },
    { id: 'netCashUsedProvidedByFinancingActivities', label: 'Net Cash from Financing', format: 'currency', source: 'cash-flow' },
    { id: 'netChangeInCash', label: 'Net Change in Cash', format: 'currency', source: 'cash-flow' },
    { id: 'cashAtEndOfPeriod', label: 'Cash at End of Period', format: 'currency', source: 'cash-flow' },
    { id: 'operatingCashFlow', label: 'Operating Cash Flow', format: 'currency', source: 'cash-flow' },
    { id: 'capitalExpenditure', label: 'Capital Expenditure', format: 'currency', source: 'cash-flow' },
    { id: 'freeCashFlow', label: 'Free Cash Flow', format: 'currency', source: 'cash-flow' },
  ];
  
  // Key Metrics
  export const KEY_METRICS = [
    { id: 'revenuePerShare', label: 'Revenue Per Share', format: 'currency', source: 'key-metrics' },
    { id: 'netIncomePerShare', label: 'Net Income Per Share', format: 'currency', source: 'key-metrics' },
    { id: 'operatingCashFlowPerShare', label: 'Operating Cash Flow Per Share', format: 'currency', source: 'key-metrics' },
    { id: 'freeCashFlowPerShare', label: 'Free Cash Flow Per Share', format: 'currency', source: 'key-metrics' },
    { id: 'cashPerShare', label: 'Cash Per Share', format: 'currency', source: 'key-metrics' },
    { id: 'bookValuePerShare', label: 'Book Value Per Share', format: 'currency', source: 'key-metrics' },
    { id: 'tangibleBookValuePerShare', label: 'Tangible Book Value Per Share', format: 'currency', source: 'key-metrics' },
    { id: 'marketCap', label: 'Market Cap', format: 'currency', source: 'key-metrics' },
    { id: 'enterpriseValue', label: 'Enterprise Value', format: 'currency', source: 'key-metrics' },
    { id: 'peRatio', label: 'P/E Ratio', format: 'ratio', source: 'key-metrics' },
    { id: 'priceToSalesRatio', label: 'Price to Sales Ratio', format: 'ratio', source: 'key-metrics' },
    { id: 'pocfratio', label: 'Price to Operating Cash Flow Ratio', format: 'ratio', source: 'key-metrics' },
    { id: 'pfcfRatio', label: 'Price to Free Cash Flow Ratio', format: 'ratio', source: 'key-metrics' },
    { id: 'pbRatio', label: 'Price to Book Ratio', format: 'ratio', source: 'key-metrics' },
    { id: 'evToSales', label: 'EV to Sales', format: 'ratio', source: 'key-metrics' },
    { id: 'enterpriseValueOverEBITDA', label: 'EV to EBITDA', format: 'ratio', source: 'key-metrics' },
    { id: 'evToOperatingCashFlow', label: 'EV to Operating Cash Flow', format: 'ratio', source: 'key-metrics' },
    { id: 'earningsYield', label: 'Earnings Yield', format: 'percentage', source: 'key-metrics' },
    { id: 'freeCashFlowYield', label: 'Free Cash Flow Yield', format: 'percentage', source: 'key-metrics' },
    { id: 'debtToEquity', label: 'Debt to Equity', format: 'ratio', source: 'key-metrics' },
    { id: 'debtToAssets', label: 'Debt to Assets', format: 'ratio', source: 'key-metrics' },
    { id: 'netDebtToEBITDA', label: 'Net Debt to EBITDA', format: 'ratio', source: 'key-metrics' },
    { id: 'currentRatio', label: 'Current Ratio', format: 'ratio', source: 'key-metrics' },
    { id: 'interestCoverage', label: 'Interest Coverage', format: 'ratio', source: 'key-metrics' },
    { id: 'roic', label: 'Return on Invested Capital', format: 'percentage', source: 'key-metrics' },
    { id: 'roe', label: 'Return on Equity', format: 'percentage', source: 'key-metrics' },
    { id: 'capexToRevenue', label: 'CAPEX to Revenue', format: 'percentage', source: 'key-metrics' },
    { id: 'dividendYield', label: 'Dividend Yield', format: 'percentage', source: 'key-metrics' },
    { id: 'payoutRatio', label: 'Payout Ratio', format: 'percentage', source: 'key-metrics' },
  ];
  
  // Financial Ratios
  export const FINANCIAL_RATIO_METRICS = [
    { id: 'currentRatio', label: 'Current Ratio', format: 'ratio', source: 'financial-ratios' },
    { id: 'quickRatio', label: 'Quick Ratio', format: 'ratio', source: 'financial-ratios' },
    { id: 'cashRatio', label: 'Cash Ratio', format: 'ratio', source: 'financial-ratios' },
    { id: 'grossProfitMargin', label: 'Gross Profit Margin', format: 'percentage', source: 'financial-ratios' },
    { id: 'operatingProfitMargin', label: 'Operating Profit Margin', format: 'percentage', source: 'financial-ratios' },
    { id: 'pretaxProfitMargin', label: 'Pretax Profit Margin', format: 'percentage', source: 'financial-ratios' },
    { id: 'netProfitMargin', label: 'Net Profit Margin', format: 'percentage', source: 'financial-ratios' },
    { id: 'effectiveTaxRate', label: 'Effective Tax Rate', format: 'percentage', source: 'financial-ratios' },
    { id: 'returnOnAssets', label: 'Return on Assets (ROA)', format: 'percentage', source: 'financial-ratios' },
    { id: 'returnOnEquity', label: 'Return on Equity (ROE)', format: 'percentage', source: 'financial-ratios' },
    { id: 'returnOnCapitalEmployed', label: 'Return on Capital Employed', format: 'percentage', source: 'financial-ratios' },
    { id: 'debtRatio', label: 'Debt Ratio', format: 'ratio', source: 'financial-ratios' },
    { id: 'debtEquityRatio', label: 'Debt to Equity Ratio', format: 'ratio', source: 'financial-ratios' },
    { id: 'longTermDebtToCapitalization', label: 'Long Term Debt to Capitalization', format: 'ratio', source: 'financial-ratios' },
    { id: 'interestCoverage', label: 'Interest Coverage', format: 'ratio', source: 'financial-ratios' },
    { id: 'cashFlowToDebtRatio', label: 'Cash Flow to Debt Ratio', format: 'ratio', source: 'financial-ratios' },
    { id: 'assetTurnover', label: 'Asset Turnover', format: 'ratio', source: 'financial-ratios' },
    { id: 'dividendYield', label: 'Dividend Yield', format: 'percentage', source: 'financial-ratios' },
    { id: 'dividendPayoutRatio', label: 'Dividend Payout Ratio', format: 'percentage', source: 'financial-ratios' },
    { id: 'priceToBookRatio', label: 'Price to Book Ratio', format: 'ratio', source: 'financial-ratios' },
    { id: 'priceToSalesRatio', label: 'Price to Sales Ratio', format: 'ratio', source: 'financial-ratios' },
    { id: 'priceEarningsRatio', label: 'P/E Ratio', format: 'ratio', source: 'financial-ratios' },
    { id: 'priceToFreeCashFlowsRatio', label: 'Price to FCF Ratio', format: 'ratio', source: 'financial-ratios' },
    { id: 'priceEarningsToGrowthRatio', label: 'PEG Ratio', format: 'ratio', source: 'financial-ratios' },
    { id: 'enterpriseValueMultiple', label: 'EV Multiple', format: 'ratio', source: 'financial-ratios' },
  ];
  
  // Combine all metrics for easier lookup
  export const ALL_METRICS = [
    ...INCOME_STATEMENT_METRICS,
    ...BALANCE_SHEET_METRICS,
    ...CASH_FLOW_METRICS,
    ...KEY_METRICS,
    ...FINANCIAL_RATIO_METRICS
  ];
  
  // Get the display name for a metric ID
  export const getMetricDisplayName = (metricId: string): string => {
    const metric = ALL_METRICS.find(m => m.id === metricId);
    if (metric) return metric.label;
    
    // If not found, try to generate a display name from the ID
    return formatMetricId(metricId);
  };
  
  // Get the format for a metric ID
  export const getMetricFormat = (metricId: string): string => {
    const metric = ALL_METRICS.find(m => m.id === metricId);
    return metric ? metric.format : 'currency';
  };
  
  // Format a metric value based on its format
  export const formatValue = (value: number | null, format?: string): string => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    
    switch (format) {
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'ratio':
        return value.toFixed(2);
      case 'number':
        return value.toLocaleString(undefined, { 
          maximumFractionDigits: 2 
        });
      case 'currency':
      default:
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: 'compact',
          maximumFractionDigits: 1
        }).format(value);
    }
  };
  
  // Calculate a metric value (for metrics that require calculation)
  export const calculateMetricValue = (
    metric: any,
    current: any,
    previous: any = null
  ): number | null => {
    if (!current) return null;
    
    const parseValue = (val: any): number => {
      if (val === null || val === undefined) return 0;
      if (typeof val === 'number') return val;
      return parseFloat(String(val).replace(/[^0-9.-]/g, "")) || 0;
    };
    
    // If the metric has a custom calculation function, use it
    if (metric.calculate) {
      return metric.calculate(current, previous);
    }
    
    // Growth metrics (require previous period)
    if (metric.format === 'percentage' && metric.id.includes('Growth') && previous) {
      const baseMetricId = metric.id.replace('Growth', '');
      const currentValue = parseValue(current[baseMetricId]);
      const previousValue = parseValue(previous[baseMetricId]);
      
      if (previousValue === 0) return null;
      return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
    }
    
    // Special case for cash growth
    if (metric.id === 'cashGrowth' && previous) {
      const currentCash = parseValue(current.cashAndShortTermInvestments || current.cashAndCashEquivalents);
      const previousCash = parseValue(previous.cashAndShortTermInvestments || previous.cashAndCashEquivalents);
      
      if (previousCash === 0) return null;
      return ((currentCash - previousCash) / Math.abs(previousCash)) * 100;
    }
    
    // Direct value metrics
    return parseValue(current[metric.id]);
  };
  
  // Helper function to format metric ID into a display name
  const formatMetricId = (id: string): string => {
    // Replace camelCase with spaces
    let label = id.replace(/([A-Z])/g, ' $1').trim();
    
    // Capitalize first letter of each word
    label = label.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Handle common acronyms
    return label
      .replace(/Ebit/g, 'EBIT')
      .replace(/Ebitda/g, 'EBITDA')
      .replace(/Eps/g, 'EPS')
      .replace(/Roa/g, 'ROA')
      .replace(/Roe/g, 'ROE')
      .replace(/Fcf/g, 'FCF')
      .replace(/R And D/g, 'R&D')
      .replace(/Sg And A/g, 'SG&A')
      .replace(/Pp And E/g, 'PP&E')
      .replace(/Ev/g, 'EV')
      .replace(/Pe /g, 'P/E ');
  };