import { MetricDefinition } from './types';

export const SHARE_METRICS: MetricDefinition[] = [
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
  }
];