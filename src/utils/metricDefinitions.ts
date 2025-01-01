export interface MetricDefinition {
  id: string;
  displayName: string;
  type: 'api' | 'calculated';
  calculation?: (current: any, previous: any) => number | null;
  format?: 'currency' | 'percentage' | 'shares';
}

export const INCOME_STATEMENT_METRICS: MetricDefinition[] = [
  {
    id: 'revenue',
    displayName: 'Revenue',
    type: 'api',
    format: 'currency'
  },
  {
    id: 'revenueGrowth',
    displayName: 'Revenue Growth',
    type: 'calculated',
    calculation: (current, previous) => {
      if (!previous?.revenue) return null;
      return ((current.revenue - previous.revenue) / previous.revenue * 100);
    },
    format: 'percentage'
  },
  {
    id: 'costOfRevenue',
    displayName: 'Cost of Revenue',
    type: 'api',
    format: 'currency'
  },
  {
    id: 'grossProfit',
    displayName: 'Gross Profit',
    type: 'api',
    format: 'currency'
  },
  {
    id: 'grossProfitMargin',
    displayName: 'Gross Profit Margin',
    type: 'calculated',
    calculation: (current) => {
      if (!current.revenue) return null;
      return (current.grossProfit / current.revenue * 100);
    },
    format: 'percentage'
  },
  {
    id: 'operatingExpenses',
    displayName: 'Operating Expenses',
    type: 'api',
    format: 'currency'
  },
  {
    id: 'operatingIncome',
    displayName: 'Operating Income',
    type: 'api',
    format: 'currency'
  },
  {
    id: 'operatingMargin',
    displayName: 'Operating Margin',
    type: 'calculated',
    calculation: (current) => {
      if (!current.revenue) return null;
      return (current.operatingIncome / current.revenue * 100);
    },
    format: 'percentage'
  },
  {
    id: 'netIncome',
    displayName: 'Net Income',
    type: 'api',
    format: 'currency'
  },
  {
    id: 'netIncomeMargin',
    displayName: 'Net Income Margin',
    type: 'calculated',
    calculation: (current) => {
      if (!current.revenue) return null;
      return (current.netIncome / current.revenue * 100);
    },
    format: 'percentage'
  },
  {
    id: 'weightedAverageShsOut',
    displayName: 'Shares Outstanding (Basic)',
    type: 'api',
    format: 'shares'
  },
  {
    id: 'weightedAverageShsOutDil',
    displayName: 'Shares Outstanding (Diluted)',
    type: 'api',
    format: 'shares'
  },
  {
    id: 'sharesChange',
    displayName: 'Shares Change (YoY)',
    type: 'calculated',
    calculation: (current, previous) => {
      if (!previous?.weightedAverageShsOut) return null;
      return ((current.weightedAverageShsOut - previous.weightedAverageShsOut) / previous.weightedAverageShsOut * 100);
    },
    format: 'percentage'
  },
  {
    id: 'ebitda',
    displayName: 'EBITDA',
    type: 'api',
    format: 'currency'
  },
  {
    id: 'ebitdaMargin',
    displayName: 'EBITDA Margin',
    type: 'calculated',
    calculation: (current) => {
      if (!current.revenue) return null;
      return (current.ebitda / current.revenue * 100);
    },
    format: 'percentage'
  }
];

export const calculateMetricValue = (
  metric: typeof INCOME_STATEMENT_METRICS[0],
  currentPeriod: any,
  previousPeriod: any
): number | null => {
  if (metric.type === 'api') {
    const value = currentPeriod[metric.id];
    if (typeof value === 'string') {
      // Remove currency symbols and convert to number
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
      // Format shares in millions/billions
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
  const metric = INCOME_STATEMENT_METRICS.find(m => m.id === metricId);
  return metric ? metric.displayName : metricId;
};

export const getMetricFormat = (metricId: string): string | undefined => {
  const metric = INCOME_STATEMENT_METRICS.find(m => m.id === metricId);
  return metric?.format;
};