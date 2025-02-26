// Define financial metrics with their display names, formats, and other properties
export const INCOME_STATEMENT_METRICS = [
    { id: 'revenue', label: 'Revenue', format: 'currency' },
    { id: 'revenueGrowth', label: 'Revenue Growth', format: 'percentage' },
    { id: 'grossProfit', label: 'Gross Profit', format: 'currency' },
    { id: 'operatingIncome', label: 'Operating Income', format: 'currency' },
    { id: 'netIncome', label: 'Net Income', format: 'currency' },
    { id: 'netIncomeGrowth', label: 'Net Income Growth', format: 'percentage' },
    { id: 'eps', label: 'EPS', format: 'currency' },
    { id: 'epsGrowth', label: 'EPS Growth', format: 'percentage' },
    { id: 'ebitda', label: 'EBITDA', format: 'currency' },
    { id: 'ebitdaGrowth', label: 'EBITDA Growth', format: 'percentage' },
    { id: 'weightedAverageShsOut', label: 'Shares Outstanding', format: 'number' },
    { id: 'weightedAverageShsOutDil', label: 'Diluted Shares Outstanding', format: 'number' },
    { id: 'sharesChange', label: 'Shares Change', format: 'percentage' },
  ];
  
  export const BALANCE_SHEET_METRICS = [
    { id: 'totalAssets', label: 'Total Assets', format: 'currency' },
    { id: 'totalLiabilities', label: 'Total Liabilities', format: 'currency' },
    { id: 'totalEquity', label: 'Total Equity', format: 'currency' },
    { id: 'cashAndCashEquivalents', label: 'Cash & Equivalents', format: 'currency' },
    { id: 'cashGrowth', label: 'Cash Growth', format: 'percentage' },
    { id: 'totalDebt', label: 'Total Debt', format: 'currency' },
    { id: 'netDebt', label: 'Net Debt', format: 'currency' },
  ];
  
  export const CASH_FLOW_METRICS = [
    { id: 'operatingCashFlow', label: 'Operating Cash Flow', format: 'currency' },
    { id: 'freeCashFlow', label: 'Free Cash Flow', format: 'currency' },
    { id: 'capitalExpenditure', label: 'Capital Expenditure', format: 'currency' },
    { id: 'netCashProvidedByOperatingActivities', label: 'Net Cash from Operations', format: 'currency' },
    { id: 'netCashUsedForInvestingActivites', label: 'Net Cash from Investing', format: 'currency' },
    { id: 'netCashUsedProvidedByFinancingActivities', label: 'Net Cash from Financing', format: 'currency' },
  ];
  
  export const FINANCIAL_RATIO_METRICS = [
    { id: 'returnOnAssets', label: 'Return on Assets (ROA)', format: 'percentage' },
    { id: 'returnOnEquity', label: 'Return on Equity (ROE)', format: 'percentage' },
    { id: 'profitMargin', label: 'Profit Margin', format: 'percentage' },
    { id: 'operatingMargin', label: 'Operating Margin', format: 'percentage' },
    { id: 'currentRatio', label: 'Current Ratio', format: 'number' },
    { id: 'quickRatio', label: 'Quick Ratio', format: 'number' },
    { id: 'debtToEquity', label: 'Debt to Equity', format: 'number' },
    { id: 'debtToAssets', label: 'Debt to Assets', format: 'number' },
    { id: 'interestCoverage', label: 'Interest Coverage', format: 'number' },
    { id: 'assetTurnover', label: 'Asset Turnover', format: 'number' },
  ];
  
  // Combine all metrics for easier lookup
  export const ALL_METRICS = [
    ...INCOME_STATEMENT_METRICS,
    ...BALANCE_SHEET_METRICS,
    ...CASH_FLOW_METRICS,
    ...FINANCIAL_RATIO_METRICS
  ];
  
  // Get the display name for a metric ID
  export const getMetricDisplayName = (metricId: string): string => {
    const metric = ALL_METRICS.find(m => m.id === metricId);
    if (metric) return metric.label;
    
    // If not found, try to generate a display name from the ID
    return formatMetricId(metricId);
  };
  
  // Get the format for a metric ID
  export const getMetricFormat = (metricId: string): string => {
    const metric = ALL_METRICS.find(m => m.id === metricId);
    return metric ? metric.format : 'currency';
  };
  
  // Format a metric value based on its format
  export const formatValue = (value: number | null, format?: string): string => {
    if (value === null) return 'N/A';
    
    switch (format) {
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'number':
        return value.toLocaleString(undefined, { 
          maximumFractionDigits: 2 
        });
      case 'currency':
      default:
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: 'compact',
          maximumFractionDigits: 1
        }).format(value);
    }
  };
  
  // Calculate a metric value (for metrics that require calculation)
  export const calculateMetricValue = (
    metric: any,
    current: any,
    previous: any = null
  ): number | null => {
    if (!current) return null;
    
    const parseValue = (val: any): number => {
      if (val === null || val === undefined) return 0;
      if (typeof val === 'number') return val;
      return parseFloat(String(val).replace(/[^0-9.-]/g, "")) || 0;
    };
    
    // Growth metrics (require previous period)
    if (metric.format === 'percentage' && previous) {
      const currentValue = parseValue(current[metric.id.replace('Growth', '')]);
      const previousValue = parseValue(previous[metric.id.replace('Growth', '')]);
      
      if (previousValue === 0) return null;
      return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
    }
    
    // Direct value metrics
    return parseValue(current[metric.id]);
  };
  
  // Helper function to format metric ID into a display name
  const formatMetricId = (id: string): string => {
    // Replace camelCase with spaces
    let label = id.replace(/([A-Z])/g, ' $1').trim();
    
    // Capitalize first letter of each word
    label = label.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Handle common acronyms
    return label
      .replace(/Ebit/g, 'EBIT')
      .replace(/Ebitda/g, 'EBITDA')
      .replace(/Eps/g, 'EPS')
      .replace(/Roa/g, 'ROA')
      .replace(/Roe/g, 'ROE')
      .replace(/R And D/g, 'R&D')
      .replace(/Sg And A/g, 'SG&A');
  };