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
  { id: "totalAssets", label: "Total Assets" },
  { id: "totalLiabilities", label: "Total Liabilities" },
  { id: "totalEquity", label: "Total Equity" },
  { id: "cashAndCashEquivalents", label: "Cash & Cash Equivalents" },
  { id: "shortTermInvestments", label: "Short Term Investments" },
  { id: "netReceivables", label: "Net Receivables" },
  { id: "inventory", label: "Inventory" },
  { id: "propertyPlantEquipmentNet", label: "Property, Plant & Equipment" },
  { id: "goodwill", label: "Goodwill" },
  { id: "intangibleAssets", label: "Intangible Assets" },
  { id: "longTermDebt", label: "Long Term Debt" },
  { id: "accountsPayable", label: "Accounts Payable" },
  { id: "totalCurrentAssets", label: "Total Current Assets" },
  { id: "totalCurrentLiabilities", label: "Total Current Liabilities" },
  { id: "totalNonCurrentAssets", label: "Total Non-Current Assets" },
  { id: "totalNonCurrentLiabilities", label: "Total Non-Current Liabilities" }
];