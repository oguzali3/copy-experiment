export const getMetricColor = (index: number): string => {
  // We'll use the bright blue from the image as the primary color
  return '#1EAEDB';
};

export const formatYAxis = (value: number) => {
  if (value === 0) return '0';
  if (Math.abs(value) >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  return value.toString();
};

export const calculateCAGR = (startValue: number, endValue: number, years: number) => {
  if (startValue <= 0 || endValue <= 0 || years <= 0) return 0;
  return ((Math.pow(endValue / startValue, 1 / years) - 1) * 100);
};

export const transformChartData = (
  data: Array<{ period: string; metrics: Array<{ name: string; value: string | number }> }>,
  metrics: string[]
) => {
  return data
    .slice()
    .sort((a, b) => parseInt(a.period) - parseInt(b.period))
    .map(item => {
      const transformed: { [key: string]: string | number } = { period: item.period };
      
      metrics.forEach(metricName => {
        const metricData = item.metrics.find(m => m.name === metricName);
        if (metricData) {
          const value = typeof metricData.value === 'number' 
            ? metricData.value 
            : parseFloat(metricData.value.toString().replace(/[^0-9.-]/g, ''));
          
          console.log(`Transforming data for ${metricName} in period ${item.period}: ${value}`);
          
          if (!isNaN(value)) {
            transformed[metricName] = value;
          } else {
            console.warn(`Invalid value for metric ${metricName} in period ${item.period}: ${metricData.value}`);
            transformed[metricName] = 0;
          }
        } else {
          console.warn(`Missing data for metric ${metricName} in period ${item.period}`);
          transformed[metricName] = 0;
        }
      });
      
      return transformed;
    });
};
