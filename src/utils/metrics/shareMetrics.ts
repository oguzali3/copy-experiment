import { MetricDefinition } from './types';

export const SHARE_METRICS: MetricDefinition[] = [
  {
    id: 'weightedAverageShsOut',
    displayName: 'Shares Outstanding (Basic)',
    type: 'api',
    format: 'shares',
    calculation: (current) => {
      if (!current?.weightedAverageShsOut) return null;
      // Convert to billions
      return parseFloat(current.weightedAverageShsOut) / 1000000000;
    }
  },
  {
    id: 'weightedAverageShsOutDil',
    displayName: 'Shares Outstanding (Diluted)',
    type: 'api',
    format: 'shares',
    calculation: (current) => {
      if (!current?.weightedAverageShsOutDil) return null;
      // Convert to billions
      return parseFloat(current.weightedAverageShsOutDil) / 1000000000;
    }
  },
  {
    id: 'sharesChange',
    displayName: 'Shares Change (YoY)',
    type: 'calculated',
    calculation: (current, previous) => {
      if (!current?.weightedAverageShsOutDil || !previous?.weightedAverageShsOutDil) return null;
      const currentShares = parseFloat(current.weightedAverageShsOutDil) / 1000000000;
      const previousShares = parseFloat(previous.weightedAverageShsOutDil) / 1000000000;
      return ((currentShares - previousShares) / Math.abs(previousShares)) * 100;
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
      if (!previous?.eps) return null;
      return ((parseFloat(current.eps) - parseFloat(previous.eps)) / Math.abs(parseFloat(previous.eps))) * 100;
    },
    format: 'percentage'
  }
];