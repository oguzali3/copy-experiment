export const formatMetricLabel = (key: string): string => {
  let label = key.replace(/^total|^gross|^net/, '');
  label = label.replace(/([A-Z])/g, ' $1').trim();
  label = label.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return label.replace(/Ebit/g, 'EBIT')
    .replace(/Ebitda/g, 'EBITDA')
    .replace(/R And D/g, 'R&D')
    .replace(/Sg And A/g, 'SG&A');
};

export const parseNumber = (value: any, isGrowthMetric: boolean = false): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  let result;
  if (isGrowthMetric) {
    result = typeof value === 'string' 
      ? parseFloat(value.replace('%', '')) 
      : parseFloat(value);
  } else {
    result = parseFloat(value.toString().replace(/,/g, ''));
  }
  
  return isNaN(result) ? 0 : result;
};

export const formatValue = (value: number, isPercentage?: boolean) => {
  if (isPercentage) {
    return `${value.toFixed(2)}%`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
};