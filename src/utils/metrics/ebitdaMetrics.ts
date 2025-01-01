import { MetricDefinition } from './types';

export const EBITDA_METRICS: MetricDefinition[] = [
  {
    id: 'ebitda',
    displayName: 'EBITDA',
    type: 'api',
    format: 'currency'
  },
  {
    id: 'ebitdaGrowth',
    displayName: 'EBITDA Growth',
    type: 'calculated',
    calculation: (current, previous) => {
      if (!previous?.ebitda) return null;
      return ((parseFloat(current.ebitda) - parseFloat(previous.ebitda)) / Math.abs(parseFloat(previous.ebitda))) * 100;
    },
    format: 'percentage'
  },
  {
    id: 'ebitdaratio',
    displayName: 'EBITDA Margin',
    type: 'api',
    format: 'percentage'
  },
  {
    id: 'depreciationAndAmortization',
    displayName: 'D&A For EBITDA',
    type: 'api',
    format: 'currency'
  }
];