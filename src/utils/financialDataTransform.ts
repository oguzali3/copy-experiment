// financialDataTransform.ts
import { getMetricFormat } from "@/utils/metricDefinitions";

export const transformFinancialData = (
  incomeStatementData: any[],
  balanceSheetData: any[],
  cashFlowData: any[],
  keyMetricsData: any[] = [],
  financialRatiosData: any[] = [],
  selectedMetrics: string[],
  timePeriods: string[],
  sliderValue: number[],
  ticker: string,
  timeFrame: "annual" | "quarterly" | "ttm"
) => {
  if (!selectedMetrics.length) return [];

  // Extract data from all data sources
  const extractedData: Record<string, Record<string, any>> = {};
  
  // Helper function to process each data source
  const processDataSource = (
    data: any[], 
    dataType: 'income-statement' | 'balance-sheet' | 'cash-flow' | 'key-metrics' | 'financial-ratios'
  ) => {
    if (!data?.length) return;
    
    data.forEach(item => {
      // Determine the period key
      let periodKey: string;
      
      if (item.period === 'TTM') {
        periodKey = 'TTM';
      } else if (timeFrame === 'quarterly' && item.date) {
        // For quarterly data, format as Q1 2023, etc.
        const date = new Date(item.date);
        const quarter = Math.floor((date.getMonth() + 3) / 3);
        const year = date.getFullYear();
        periodKey = `Q${quarter} ${year}`;
      } else if (item.date) {
        // For annual data, just use the year
        const date = new Date(item.date);
        periodKey = date.getFullYear().toString();
      } else {
        // If no date, use existing period if it exists
        periodKey = item.period || 'Unknown';
      }
      
      // Initialize period data if it doesn't exist
      if (!extractedData[periodKey]) {
        extractedData[periodKey] = { period: periodKey };
      }
      
      // Copy all metrics from this item to the period data
      Object.keys(item).forEach(key => {
        if (key !== 'date' && key !== 'period' && key !== 'reportedCurrency' && 
            key !== 'fillingDate' && key !== 'acceptedDate' && key !== 'calendarYear' && 
            key !== 'symbol') {
          
          // Store source of the metric to handle potential duplicates
          extractedData[periodKey][`${key}_${dataType}`] = item[key];
          
          // Also store without source for backward compatibility
          if (!extractedData[periodKey][key]) {
            extractedData[periodKey][key] = item[key];
          }
        }
      });
    });
  };
  
  // Process all data sources
  processDataSource(incomeStatementData, 'income-statement');
  processDataSource(balanceSheetData, 'balance-sheet');
  processDataSource(cashFlowData, 'cash-flow');
  processDataSource(keyMetricsData, 'key-metrics');
  processDataSource(financialRatiosData, 'financial-ratios');
  
  // Convert to array and sort in ASCENDING order (oldest to newest)
  let transformedData = Object.values(extractedData)
    .sort((a, b) => {
      // TTM handling - place at the end for ascending sort
      if (a.period === 'TTM') return 1;
      if (b.period === 'TTM') return -1;
      
      // Quarterly data handling
      if (a.period?.includes('Q') && b.period?.includes('Q')) {
        const [aQ, aYear] = a.period.split(' ');
        const [bQ, bYear] = b.period.split(' ');
        
        // First compare years
        if (aYear !== bYear) {
          return parseInt(aYear) - parseInt(bYear); // Ascending by year
        }
        
        // Then compare quarters
        return parseInt(aQ.slice(1)) - parseInt(bQ.slice(1)); // Ascending by quarter
      }
      
      // Annual data handling
      if (!isNaN(parseInt(a.period)) && !isNaN(parseInt(b.period))) {
        return parseInt(a.period) - parseInt(b.period); // Ascending order
      }
      
      // Fallback to string comparison
      return a.period.localeCompare(b.period);
    });

  // Filter data to only include the selected time periods
  if (timePeriods.length && sliderValue?.length === 2) {
    const startIdx = sliderValue[0];
    const endIdx = sliderValue[1];
    
    if (startIdx >= 0 && endIdx < timePeriods.length) {
      const selectedPeriods = timePeriods.slice(startIdx, endIdx + 1);
      transformedData = transformedData.filter(item => selectedPeriods.includes(item.period));
    }
  }

  // Filter out any metrics that weren't selected
  const filteredData = transformedData.map(item => {
    const filteredItem: Record<string, any> = { period: item.period };
    
    selectedMetrics.forEach(metric => {
      // Check for the metric in all variants (with source suffix and without)
      const sourceVariants = [
        metric, 
        `${metric}_income-statement`, 
        `${metric}_balance-sheet`, 
        `${metric}_cash-flow`,
        `${metric}_key-metrics`,
        `${metric}_financial-ratios`
      ];
      
      // Find the first available variant
      for (const variant of sourceVariants) {
        if (item[variant] !== undefined) {
          // Parse value to number if possible
          let value = item[variant];
          if (typeof value === 'string') {
            // Remove any non-numeric characters except decimal point and minus
            const numericValue = value.replace(/[^0-9.-]/g, '');
            if (numericValue !== '') {
              value = parseFloat(numericValue);
            }
          }
          
          // Format based on metric type
          const format = getMetricFormat(metric);
          if (format === 'percentage' && typeof value === 'number' && !metric.includes('Growth')) {
            // Convert decimal percentages to actual percentages (e.g., 0.15 -> 15)
            if (value < 1 && value > -1) {
              value = value * 100;
            }
          }
          
          filteredItem[metric] = value;
          break;
        }
      }
    });
    
    return filteredItem;
  });
  
  return filteredData;
};