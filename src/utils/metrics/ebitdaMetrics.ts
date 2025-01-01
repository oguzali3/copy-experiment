import { MetricDefinition } from './types';

export const EBITDA_METRICS: MetricDefinition[] = [
  {
    id: 'ebitda',
    displayName: 'EBITDA',
    type: 'api',
    format: 'currency'
  },
  {
    id: 'depreciationAndAmortization',
    displayName: 'Depreciation & Amortization',
    type: 'api',
    format: 'currency'
  }
];