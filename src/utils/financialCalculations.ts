export const calculateMetricChange = (data: any[]) => {
  if (data.length < 2) return null;
  const values = data.map(value => {
    if (typeof value === 'string') {
      return parseFloat(value.replace(/[^0-9.-]/g, '') || '0');
    }
    return parseFloat(value?.toString() || '0');
  }).filter(value => !isNaN(value));

  if (values.length < 2) return null;
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  
  if (firstValue === 0) return null;
  return ((lastValue - firstValue) / Math.abs(firstValue)) * 100;
};

export const calculateCAGR = (data: any[], years: number) => {
  if (data.length < 2 || years <= 0) return null;
  const values = data.map(value => {
    if (typeof value === 'string') {
      return parseFloat(value.replace(/[^0-9.-]/g, '') || '0');
    }
    return parseFloat(value?.toString() || '0');
  }).filter(value => !isNaN(value));

  if (values.length < 2) return null;
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  
  if (firstValue <= 0 || lastValue <= 0) return null;
  return ((Math.pow(lastValue / firstValue, 1 / years) - 1) * 100);
};