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
  { id: "cashAndCashEquivalents", label: "Cash & Cash Equivalents" },
  { id: "shortTermInvestments", label: "Short Term Investments" },
  { id: "cashAndShortTermInvestments", label: "Cash & Short Term Investments" },
  { id: "netReceivables", label: "Net Receivables" },
  { id: "inventory", label: "Inventory" },
  { id: "otherCurrentAssets", label: "Other Current Assets" },
  { id: "totalCurrentAssets", label: "Total Current Assets" },
  { id: "propertyPlantEquipmentNet", label: "Property Plant & Equipment (Net)" },
  { id: "goodwill", label: "Goodwill" },
  { id: "intangibleAssets", label: "Intangible Assets" },
  { id: "goodwillAndIntangibleAssets", label: "Goodwill & Intangible Assets" },
  { id: "longTermInvestments", label: "Long Term Investments" },
  { id: "taxAssets", label: "Tax Assets" },
  { id: "otherNonCurrentAssets", label: "Other Non-Current Assets" },
  { id: "totalNonCurrentAssets", label: "Total Non-Current Assets" },
  { id: "otherAssets", label: "Other Assets" },
  { id: "totalAssets", label: "Total Assets" },
  { id: "accountPayables", label: "Account Payables" },
  { id: "shortTermDebt", label: "Short Term Debt" },
  { id: "taxPayables", label: "Tax Payables" },
  { id: "deferredRevenue", label: "Deferred Revenue" },
  { id: "otherCurrentLiabilities", label: "Other Current Liabilities" },
  { id: "totalCurrentLiabilities", label: "Total Current Liabilities" },
  { id: "longTermDebt", label: "Long Term Debt" },
  { id: "deferredRevenueNonCurrent", label: "Deferred Revenue (Non-Current)" },
  { id: "deferredTaxLiabilitiesNonCurrent", label: "Deferred Tax Liabilities (Non-Current)" },
  { id: "otherNonCurrentLiabilities", label: "Other Non-Current Liabilities" },
  { id: "totalNonCurrentLiabilities", label: "Total Non-Current Liabilities" },
  { id: "otherLiabilities", label: "Other Liabilities" },
  { id: "capitalLeaseObligations", label: "Capital Lease Obligations" },
  { id: "totalLiabilities", label: "Total Liabilities" },
  { id: "preferredStock", label: "Preferred Stock" },
  { id: "commonStock", label: "Common Stock" },
  { id: "retainedEarnings", label: "Retained Earnings" },
  { id: "accumulatedOtherComprehensiveIncomeLoss", label: "Accumulated Other Comprehensive Income/Loss" },
  { id: "othertotalStockholdersEquity", label: "Other Total Stockholders Equity" },
  { id: "totalStockholdersEquity", label: "Total Stockholders Equity" },
  { id: "totalEquity", label: "Total Equity" },
  { id: "totalLiabilitiesAndStockholdersEquity", label: "Total Liabilities & Stockholders Equity" },
  { id: "minorityInterest", label: "Minority Interest" },
  { id: "totalLiabilitiesAndTotalEquity", label: "Total Liabilities & Total Equity" },
  { id: "totalInvestments", label: "Total Investments" },
  { id: "totalDebt", label: "Total Debt" },
  { id: "netDebt", label: "Net Debt" }
];