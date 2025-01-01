import { MetricDefinition } from './types';

export const OPERATING_METRICS: MetricDefinition[] = [
  {
    id: 'sellingGeneralAndAdministrativeExpenses',
    displayName: 'Selling, General & Admin',
    type: 'api',
    format: 'currency'
  },
  {
    id: 'researchAndDevelopmentExpenses',
    displayName: 'Research & Development',
    type: 'api',
    format: 'currency'
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
  }
];