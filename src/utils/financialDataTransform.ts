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
  
  // Debug: log extracted data keys
  console.log('Extracted data periods:', Object.keys(extractedData));
  
  // Convert to array and sort
  let transformedData = Object.values(extractedData);
  
  // Debug: log data before sorting
  console.log('Data before sorting, count:', transformedData.length);
  if (transformedData.length > 0) {
    console.log('Sample first item period:', transformedData[0].period);
  }

  // Sort based on time frame
  if (timeFrame === 'quarterly') {
    // For quarterly, sort in ascending order (oldest to newest)
    transformedData = transformedData.sort((a, b) => {
      // TTM handling for quarterly view
      if (a.period === 'TTM') return 1; // TTM at end for ascending
      if (b.period === 'TTM') return -1;
      
      // Extract year and quarter for comparison
      const aMatches = a.period.match(/Q(\d+)\s+(\d+)/);
      const bMatches = b.period.match(/Q(\d+)\s+(\d+)/);
      
      if (!aMatches || !bMatches) return 0;
      
      const [, aQuarter, aYear] = aMatches;
      const [, bQuarter, bYear] = bMatches;
      
      // Compare years first
      if (aYear !== bYear) {
        return parseInt(aYear) - parseInt(bYear); // Ascending
      }
      
      // Then compare quarters
      return parseInt(aQuarter) - parseInt(bQuarter); // Ascending
    });
  } else {
    // For annual and TTM, sort in ascending order (oldest to newest)
    transformedData = transformedData.sort((a, b) => {
      // TTM handling
      if (a.period === 'TTM') return 1;
      if (b.period === 'TTM') return -1;
      
      // Annual data (years)
      return parseInt(a.period) - parseInt(b.period); // Ascending
    });
  }
  
  // Debug: log data after sorting
  console.log('Data after sorting, first 3 periods:', 
    transformedData.slice(0, 3).map(item => item.period)
  );
  console.log('Data after sorting, last 3 periods:', 
    transformedData.slice(-3).map(item => item.period)
  );

  // Filter data to only include the selected time periods from slider
  if (timePeriods.length && sliderValue?.length === 2) {
    const startIdx = Math.min(sliderValue[0], sliderValue[1]);
    const endIdx = Math.max(sliderValue[0], sliderValue[1]);
    
    if (startIdx >= 0 && endIdx < timePeriods.length) {
      const selectedPeriods = timePeriods.slice(startIdx, endIdx + 1);
      
      // Debug: log selected periods
      console.log('Selected periods from slider:', selectedPeriods);
      
      transformedData = transformedData.filter(item => selectedPeriods.includes(item.period));
      
      // Debug: log filtered data
      console.log('Data after period filtering:', 
        transformedData.map(item => item.period)
      );
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
  
  // Debug: check for metrics in first item
  if (filteredData.length > 0 && selectedMetrics.length > 0) {
    const firstItem = filteredData[0];
    const metricsFound = selectedMetrics.filter(metric => firstItem[metric] !== undefined);
    console.log(`Found ${metricsFound.length}/${selectedMetrics.length} metrics in first data item`);
    
    if (metricsFound.length < selectedMetrics.length) {
      const missingMetrics = selectedMetrics.filter(metric => firstItem[metric] === undefined);
      console.log('Missing metrics:', missingMetrics);
    }
  }
  
  return filteredData;
};