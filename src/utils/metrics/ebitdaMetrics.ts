import { MetricDefinition } from './types';

export const EBITDA_METRICS: MetricDefinition[] = [
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