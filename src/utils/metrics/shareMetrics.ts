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
  },
  {
    id: 'eps',
    displayName: 'EPS (Basic)',
    type: 'api',
    format: 'currency'
  },
  {
    id: 'epsdiluted',
    displayName: 'EPS (Diluted)',
    type: 'api',
    format: 'currency'
  },
  {
    id: 'epsGrowth',
    displayName: 'EPS Growth',
    type: 'calculated',
    calculation: (current, previous) => {
      // This calculation will be handled in FinancialDataTable component
      // similar to how we handle revenue growth and net income growth
      if (!previous?.eps) return null;
      return ((parseFloat(current.eps) - parseFloat(previous.eps)) / Math.abs(parseFloat(previous.eps))) * 100;
    },
    format: 'percentage'
  }
];