export const calculateMetricStatistics = (
  data: any[],
  selectedMetrics: string[]
) => {
  if (!data || data.length < 2) return data;

  const nonTTMData = data.filter(item => item.period !== 'TTM');
  const years = nonTTMData.length - 1;

  const calculateChange = (values: number[]) => {
    if (values.length < 2) return 0;
    const firstValue = values[values.length - 1];
    const lastValue = values[0];
    return firstValue !== 0 ? ((lastValue - firstValue) / Math.abs(firstValue)) * 100 : 0;
  };

  const calculateCAGR = (values: number[], years: number) => {
    if (values.length < 2 || years <= 0) return 0;
    const firstValue = values[values.length - 1];
    const lastValue = values[0];
    if (firstValue <= 0 || lastValue <= 0) return 0;
    return ((Math.pow(lastValue / firstValue, 1 / years) - 1) * 100);
  };

  return data.map((item: any) => {
    const enhancedDataPoint = { ...item };
    
    selectedMetrics.forEach(metric => {
      const values = nonTTMData
        .map(d => d[metric])
        .filter(v => v !== undefined && v !== null)
        .reverse();
      
      const totalChange = calculateChange(values);
      const cagr = calculateCAGR(values, years);

      enhancedDataPoint[`${metric}_totalChange`] = !isNaN(totalChange) ? `${totalChange.toFixed(2)}%` : '0.00%';
      enhancedDataPoint[`${metric}_cagr`] = !isNaN(cagr) ? `${cagr.toFixed(2)}%` : '0.00%';
    });

    return enhancedDataPoint;
  });
};