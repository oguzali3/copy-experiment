export const getMetricColor = (index: number): string => {
  const colors = [
    '#1A237E', // Deep Blue
    '#FB8C00', // Orange
    '#7E57C2', // Purple
    '#2E7D32', // Green
    '#C62828', // Red
    '#00838F', // Cyan
    '#EF6C00', // Dark Orange
    '#4527A0', // Deep Purple
    '#1565C0', // Blue
    '#2E7D32'  // Green
  ];
  return colors[index % colors.length];
};

export const formatYAxis = (value: number) => {
  if (value === 0) return '$0';
  if (Math.abs(value) >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1e3) {
    return `$${(value / 1e3).toFixed(1)}K`;
  }
  return `$${value}`;
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