export interface MetricDefinition {
  id: string;
  displayName: string;
  type: 'api' | 'calculated';
  calculation?: (current: any, previous: any) => number | null;
  format?: 'percentage' | 'currency';
}

export const INCOME_STATEMENT_METRICS: MetricDefinition[] = [
  {
    id: 'revenue',
    displayName: 'Revenue',
    type: 'api'
  },
  {
    id: 'revenueGrowth',
    displayName: 'Revenue Growth (YoY)',
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
    type: 'api'
  },
  {
    id: 'grossProfit',
    displayName: 'Gross Profit',
    type: 'api'
  },
  {
    id: 'sellingGeneralAndAdministrative',
    displayName: 'Selling, General & Admin',
    type: 'api'
  },
  {
    id: 'researchAndDevelopment',
    displayName: 'Research & Development',
    type: 'api'
  },
  {
    id: 'operatingExpenses',
    displayName: 'Operating Expenses',
    type: 'api'
  },
  {
    id: 'operatingIncome',
    displayName: 'Operating Income',
    type: 'api'
  },
  {
    id: 'interestExpense',
    displayName: 'Interest Expense',
    type: 'api'
  },
  {
    id: 'interestAndInvestmentIncome',
    displayName: 'Interest & Investment Income',
    type: 'api'
  },
  {
    id: 'totalOtherIncomeExpensesNet',
    displayName: 'Other Non Operating Income (Expenses)',
    type: 'api'
  },
  {
    id: 'incomeBeforeTax',
    displayName: 'Pretax Income',
    type: 'api'
  },
  {
    id: 'incomeTaxExpense',
    displayName: 'Income Tax Expense',
    type: 'api'
  },
  {
    id: 'netIncome',
    displayName: 'Net Income',
    type: 'api'
  },
  {
    id: 'netIncomeGrowth',
    displayName: 'Net Income Growth',
    type: 'calculated',
    calculation: (current, previous) => {
      if (!previous?.netIncome) return null;
      return ((current.netIncome - previous.netIncome) / previous.netIncome * 100);
    }
  },
  {
    id: 'weightedAverageShsOut',
    displayName: 'Shares Outstanding (Basic)',
    type: 'api'
  },
  {
    id: 'weightedAverageShsOutDil',
    displayName: 'Shares Outstanding (Diluted)',
    type: 'api'
  },
  {
    id: 'sharesChangeYoY',
    displayName: 'Shares Change (YoY)',
    type: 'calculated',
    calculation: (current, previous) => {
      if (!previous?.weightedAverageShsOut) return null;
      return ((current.weightedAverageShsOut - previous.weightedAverageShsOut) / previous.weightedAverageShsOut * 100);
    }
  },
  {
    id: 'eps',
    displayName: 'EPS (Basic)',
    type: 'api'
  },
  {
    id: 'epsdiluted',
    displayName: 'EPS (Diluted)',
    type: 'api'
  },
  {
    id: 'epsGrowth',
    displayName: 'EPS Growth',
    type: 'calculated',
    calculation: (current, previous) => {
      if (!previous?.epsdiluted) return null;
      return ((current.epsdiluted - previous.epsdiluted) / previous.epsdiluted * 100);
    },
    format: 'percentage'
  },
  {
    id: 'grossProfitRatio',
    displayName: 'Gross Margin',
    type: 'api',
    format: 'percentage'
  },
  {
    id: 'operatingIncomeRatio',
    displayName: 'Operating Margin',
    type: 'api',
    format: 'percentage'
  },
  {
    id: 'netIncomeRatio',
    displayName: 'Profit Margin',
    type: 'api',
    format: 'percentage'
  },
  {
    id: 'ebitda',
    displayName: 'EBITDA',
    type: 'api'
  },
  {
    id: 'ebitdaMargin',
    displayName: 'EBITDA Margin',
    type: 'api',
    format: 'percentage'
  }
];

export const getMetricDisplayName = (metricId: string): string => {
  const metric = INCOME_STATEMENT_METRICS.find(m => m.id === metricId);
  return metric?.displayName || metricId;
};

export const calculateMetricValue = (
  metric: MetricDefinition,
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
