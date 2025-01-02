import { MetricDefinition } from './types';
import { REVENUE_METRICS } from './revenueMetrics';
import { OPERATING_METRICS } from './operatingMetrics';
import { INCOME_METRICS } from './incomeMetrics';
import { SHARE_METRICS } from './shareMetrics';
import { EBITDA_METRICS } from './ebitdaMetrics';

// Balance Sheet metric display names mapping
const BALANCE_SHEET_DISPLAY_NAMES: Record<string, string> = {
  cashAndCashEquivalents: "Cash and Cash Equivalents",
  shortTermInvestments: "Short Term Investments",
  netReceivables: "Net Receivables",
  inventory: "Inventory",
  otherCurrentAssets: "Other Current Assets",
  totalCurrentAssets: "Total Current Assets",
  propertyPlantEquipmentNet: "Property Plant & Equipment",
  goodwill: "Goodwill",
  intangibleAssets: "Intangible Assets",
  longTermInvestments: "Long Term Investments",
  otherNonCurrentAssets: "Other Non-Current Assets",
  totalNonCurrentAssets: "Total Non-Current Assets",
  totalAssets: "Total Assets",
  accountPayables: "Account Payables",
  shortTermDebt: "Short Term Debt",
  taxPayables: "Tax Payables",
  deferredRevenue: "Deferred Revenue",
  otherCurrentLiabilities: "Other Current Liabilities",
  totalCurrentLiabilities: "Total Current Liabilities",
  longTermDebt: "Long Term Debt",
  deferredRevenueNonCurrent: "Deferred Revenue Non-Current",
  deferredTaxLiabilitiesNonCurrent: "Deferred Tax Liabilities",
  otherNonCurrentLiabilities: "Other Non-Current Liabilities",
  totalNonCurrentLiabilities: "Total Non-Current Liabilities",
  totalLiabilities: "Total Liabilities",
  commonStock: "Common Stock",
  retainedEarnings: "Retained Earnings",
  accumulatedOtherComprehensiveIncomeLoss: "Accumulated Other Comprehensive Income/Loss",
  othertotalStockholdersEquity: "Other Stockholders Equity",
  totalStockholdersEquity: "Total Stockholders Equity",
  totalLiabilitiesAndStockholdersEquity: "Total Liabilities and Stockholders Equity",
  totalInvestments: "Total Investments",
  totalDebt: "Total Debt",
  netDebt: "Net Debt"
};

export const INCOME_STATEMENT_METRICS: MetricDefinition[] = [
  ...REVENUE_METRICS,
  ...OPERATING_METRICS,
  ...INCOME_METRICS,
  ...SHARE_METRICS,
  ...EBITDA_METRICS
];

export const calculateMetricValue = (
  metric: MetricDefinition,
  currentPeriod: any,
  previousPeriod: any
): number | null => {
  if (metric.type === 'api') {
    const value = currentPeriod[metric.id];
    if (typeof value === 'string') {
      return parseFloat(value.replace(/[$,B]/g, ''));
    }
    return value;
  }
  
  if (metric.type === 'calculated' && metric.calculation) {
    return metric.calculation(currentPeriod, previousPeriod);
  }
  
  return null;
};

export const formatValue = (value: number | null, format?: string): string => {
  if (value === null) return 'N/A';

  switch (format) {
    case 'percentage':
      return `${value.toFixed(2)}%`;
    case 'shares':
      if (Math.abs(value) >= 1e9) {
        return `${(value / 1e9).toFixed(2)}B`;
      } else if (Math.abs(value) >= 1e6) {
        return `${(value / 1e6).toFixed(2)}M`;
      }
      return value.toLocaleString();
    default:
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(value);
  }
};

export const getMetricDisplayName = (metricId: string): string => {
  // First check if it's an income statement metric
  const incomeMetric = INCOME_STATEMENT_METRICS.find(m => m.id === metricId);
  if (incomeMetric) {
    return incomeMetric.displayName;
  }
  
  // Then check if it's a balance sheet metric
  const balanceSheetDisplayName = BALANCE_SHEET_DISPLAY_NAMES[metricId];
  if (balanceSheetDisplayName) {
    return balanceSheetDisplayName;
  }
  
  // If no display name is found, format the metric ID as a fallback
  return metricId
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim();
};

export const getMetricFormat = (metricId: string): string | undefined => {
  const metric = INCOME_STATEMENT_METRICS.find(m => m.id === metricId);
  return metric?.format;
};

export type { MetricDefinition };