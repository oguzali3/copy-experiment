import { MetricDefinition } from './types';
import { REVENUE_METRICS } from './revenueMetrics';
import { OPERATING_METRICS } from './operatingMetrics';
import { INCOME_METRICS } from './incomeMetrics';
import { SHARE_METRICS } from './shareMetrics';
import { EBITDA_METRICS } from './ebitdaMetrics';

export const INCOME_STATEMENT_METRICS: MetricDefinition[] = [
  ...REVENUE_METRICS,
  ...OPERATING_METRICS,
  ...INCOME_METRICS,
  ...SHARE_METRICS,
  ...EBITDA_METRICS
];

export const calculateMetricValue = (
  metric: MetricDefinition,
  currentPeriod: any,
  previousPeriod: any
): number | null => {
  if (metric.type === 'api') {
    const value = currentPeriod[metric.id];
    if (typeof value === 'string') {
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

export type { MetricDefinition };