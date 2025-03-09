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

  // Pre-filter data based on timeFrame
  if (timeFrame === 'ttm') {
    // For TTM mode - only keep annual data and TTM entries
    const filterDataForTTM = (data: any[]) => {
      if (!data?.length) return [];
      
      return data.filter(item => {
        // Keep TTM items
        if (item.period === 'TTM') return true;
        
        // Filter out quarterly data
        if (item.period && item.period.includes('Q')) return false;
        
        // For other items, check if they have a date and extract year
        if (item.date) {
          const year = new Date(item.date).getFullYear();
          if (!isNaN(year)) {
            return true;
          }
        }
        
        // For items without dates, only keep those with 4-digit year periods
        if (item.period && /^\d{4}$/.test(item.period)) {
          return true;
        }
        
        // Exclude anything else
        return false;
      });
    };
    
    // Filter all data sources
    incomeStatementData = filterDataForTTM(incomeStatementData);
    balanceSheetData = filterDataForTTM(balanceSheetData);
    cashFlowData = filterDataForTTM(cashFlowData);
    keyMetricsData = filterDataForTTM(keyMetricsData);
    financialRatiosData = filterDataForTTM(financialRatiosData);
  }
  else if (timeFrame === 'quarterly') {
    // For quarterly mode - exclude TTM entries
    const filterDataForQuarterly = (data: any[]) => {
      if (!data?.length) return [];
      
      return data.filter(item => {
        // Filter out TTM items
        if (item.period === 'TTM') return false;
        
        // Keep only items with quarterly periods or date-based quarters
        if (item.period && item.period.includes('Q')) return true;
        
        if (item.date) {
          // Keep items with dates, they'll be formatted as quarters later
          return true;
        }
        
        // Exclude other items
        return false;
      });
    };
    
    // Filter all data sources to remove TTM entries in quarterly view
    incomeStatementData = filterDataForQuarterly(incomeStatementData);
    balanceSheetData = filterDataForQuarterly(balanceSheetData);
    cashFlowData = filterDataForQuarterly(cashFlowData);
    keyMetricsData = filterDataForQuarterly(keyMetricsData);
    financialRatiosData = filterDataForQuarterly(financialRatiosData);
  }

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
        periodKey = `Q${quarter} ${date.getFullYear()}`;
      } else if (item.date) {
        // For annual data, just use the year
        const date = new Date(item.date);
        periodKey = date.getFullYear().toString();
      } else {
        // If no date, use existing period if it exists
        periodKey = item.period || 'Unknown';
      }
      
      // Skip TTM periods in quarterly mode
      if (timeFrame === 'quarterly' && periodKey === 'TTM') {
        return;
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
  
  // Log extracted periods
  console.log('Extracted data periods:', Object.keys(extractedData));
  
  // Final check to ensure correct periods for each time frame
  if (timeFrame === 'quarterly') {
    // Remove any TTM entries that might have slipped through
    delete extractedData['TTM'];
  } else if (timeFrame === 'ttm') {
    // Final TTM check - ensure only annual periods + TTM
    const filteredData: Record<string, Record<string, any>> = {};
    
    Object.entries(extractedData).forEach(([period, data]) => {
      // Include TTM period
      if (period === 'TTM') {
        filteredData[period] = data;
      }
      // For other periods, only include exact 4-digit years
      else if (/^\d{4}$/.test(period)) {
        filteredData[period] = data;
      }
    });
    
    // Replace extractedData with the filtered version
    extractedData = filteredData;
  }
  
  // Convert to array and sort
  let transformedData = Object.values(extractedData);
  
  // Sort based on time frame
  if (timeFrame === 'quarterly') {
    // For quarterly, sort in ascending order (oldest to newest)
    transformedData = transformedData.sort((a, b) => {
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
  
  // Final check of transformed data periods
  console.log(`${timeFrame} mode - Transformed periods:`, transformedData.map(item => item.period));

  // Filter data to only include the selected time periods from slider
  if (timePeriods.length && sliderValue?.length === 2) {
    const startIdx = Math.min(sliderValue[0], sliderValue[1]);
    const endIdx = Math.max(sliderValue[0], sliderValue[1]);
    
    if (startIdx >= 0 && endIdx < timePeriods.length) {
      const selectedPeriods = timePeriods.slice(startIdx, endIdx + 1);
      
      console.log('Selected periods from slider:', selectedPeriods);
      
      transformedData = transformedData.filter(item => selectedPeriods.includes(item.period));
      
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
  
  return filteredData;
};