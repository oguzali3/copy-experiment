export const formatValue = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
};

export const parseNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  return parseFloat(value.toString().replace(/,/g, ''));
};

export const metrics = [
  // Assets
  { id: "cashAndCashEquivalents", label: "Cash & Equivalents" },
  { id: "shortTermInvestments", label: "Short-Term Investments" },
  { id: "cashAndShortTermInvestments", label: "Cash & Short-Term Investments" },
  { id: "cashGrowth", label: "Cash Growth" },
  { id: "netReceivables", label: "Receivables" },
  { id: "inventory", label: "Inventory" },
  { id: "prepaidExpenses", label: "Prepaid Expenses" },
  { id: "totalCurrentAssets", label: "Total Current Assets" },
  { id: "propertyPlantEquipmentNet", label: "Property, Plant & Equipment" },
  { id: "longTermInvestments", label: "Long-Term Investments" },
  { id: "goodwill", label: "Goodwill" },
  { id: "intangibleAssets", label: "Other Intangible Assets" },
  { id: "longTermInvestmentAssets", label: "Long-Term Investment Assets" },
  { id: "otherLongTermAssets", label: "Other Long-Term Assets" },
  { id: "totalAssets", label: "Total Assets" },
  
  // Liabilities
  { id: "accountsPayable", label: "Accounts Payable" },
  { id: "accruedExpenses", label: "Accrued Expenses" },
  { id: "currentPortionOfLongTermDebt", label: "Current Portion of Long-Term Debt" },
  { id: "currentLeaseObligations", label: "Current Portion of Leases" },
  { id: "currentIncomeTaxPayable", label: "Current Income Taxes Payable" },
  { id: "deferredRevenue", label: "Current Unearned Revenue" },
  { id: "otherCurrentLiabilities", label: "Other Current Liabilities" },
  { id: "totalCurrentLiabilities", label: "Total Current Liabilities" },
  { id: "longTermDebt", label: "Long-Term Debt" },
  { id: "leaseObligations", label: "Long-Term Leases" },
  { id: "deferredRevenueNonCurrent", label: "Long-Term Unearned Revenue" },
  { id: "deferredTaxLiabilitiesNonCurrent", label: "Long-Term Deferred Tax Liabilities" },
  { id: "otherLongTermLiabilities", label: "Other Long-Term Liabilities" },
  { id: "totalLiabilities", label: "Total Liabilities" },
  
  // Shareholders' Equity
  { id: "commonStock", label: "Common Stock" },
  { id: "additionalPaidInCapital", label: "Additional Paid-In Capital" },
  { id: "retainedEarnings", label: "Retained Earnings" },
  { id: "treasuryStock", label: "Treasury Stock" },
  { id: "accumulatedOtherComprehensiveIncome", label: "Comprehensive Income & Other" },
  { id: "totalEquity", label: "Shareholders' Equity" },
  { id: "totalLiabilitiesAndEquity", label: "Total Liabilities & Equity" },
  
  // Additional Metrics
  { id: "totalDebt", label: "Total Debt" },
  { id: "netDebt", label: "Net Debt" },
  { id: "netCashGrowth", label: "Net Cash Growth" },
  { id: "netCashPerShare", label: "Net Cash Per Share" },
  { id: "filingSharesOutstanding", label: "Filing Shares Outstanding" },
  { id: "totalSharesOutstanding", label: "Total Shares Outstanding" },
  { id: "workingCapital", label: "Working Capital" },
  { id: "bookValuePerShare", label: "Book Value Per Share" },
  { id: "tangibleBookValue", label: "Tangible Book Value" },
  { id: "tangibleBookValuePerShare", label: "Tangible Book Value Per Share" },
  { id: "land", label: "Land" },
  { id: "buildings", label: "Buildings" },
  { id: "machinery", label: "Machinery" },
  { id: "constructionInProgress", label: "Construction In Progress" },
  { id: "leaseholdImprovements", label: "Leasehold Improvements" }
];