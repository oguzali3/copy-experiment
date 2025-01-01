import { MetricDefinition } from './types';

export const REVENUE_METRICS: MetricDefinition[] = [
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
  }
];