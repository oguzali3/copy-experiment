import { calculateMetricChange, calculateCAGR } from '../financialCalculations';

export const calculateMetricStatistics = (
  data: any[],
  selectedMetrics: string[]
) => {
  const nonTTMData = data.filter(item => item.period !== 'TTM');
  const years = nonTTMData.length - 1;

  return data.map((item: any) => {
    const metricValues = selectedMetrics.map(metric => {
      const values = nonTTMData.map(d => d[metric]);
      const totalChange = calculateMetricChange(values);
      const cagr = calculateCAGR(values, years);
      return {
        metric,
        values,
        totalChange: totalChange !== null ? `${totalChange.toFixed(2)}%` : 'NaN%',
        cagr: cagr !== null ? `${cagr.toFixed(2)}%` : 'NaN%'
      };
    });

    const enhancedDataPoint = { ...item };
    metricValues.forEach(({ metric, totalChange, cagr }) => {
      enhancedDataPoint[`${metric}_totalChange`] = totalChange;
      enhancedDataPoint[`${metric}_cagr`] = cagr;
    });

    return enhancedDataPoint;
  });
};