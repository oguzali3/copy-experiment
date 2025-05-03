/**
 * Utility functions to transform API data into chart-compatible format
 */

/**
 * Transforms the API response for a single metric into chart data format
 * @param apiData - Raw data from the API for a single metric
 * @param metricId - The ID of the metric
 */
 export const transformSingleMetricData = (apiData, metricId) => {
    if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
      console.warn('Invalid or empty API data received for metric:', metricId);
      return [];
    }
  
    // Convert each data point to a format with year as period and the value properly parsed
    return apiData.map(item => {
      // Extract the year from the date
      const year = new Date(item.date).getFullYear().toString();
      
      // Parse the value to a number (handle null/undefined gracefully)
      const value = item.value !== undefined && item.value !== null 
        ? parseFloat(item.value) 
        : null;
      
      return {
        period: year,
        [metricId]: value
      };
    });
  };
  
  /**
   * Merges multiple metric datasets into a single dataset for charting
   * @param metricsData - Object mapping metric IDs to their datasets
   */
  export const mergeMetricsData = (metricsData) => {
    if (!metricsData || Object.keys(metricsData).length === 0) {
      console.warn('No metrics data to merge');
      return [];
    }
  
    // Get all unique periods across all metrics
    const allPeriods = new Set();
    Object.values(metricsData).forEach(metricData => {
      metricData.forEach(dataPoint => {
        allPeriods.add(dataPoint.period);
      });
    });
  
    // Sort periods chronologically
    const sortedPeriods = Array.from(allPeriods).sort();
    
    // Create a data point for each period with all available metrics
    return sortedPeriods.map(period => {
      const dataPoint = { period };
      
      // Add each metric value to this period's data point
      Object.entries(metricsData).forEach(([metricId, metricData]) => {
        // Find the data for this metric and period
        const dataForPeriod = metricData.find(item => item.period === period);
        
        // Add the value to the data point (null if not found)
        dataPoint[metricId] = dataForPeriod ? dataForPeriod[metricId] : null;
      });
      
      return dataPoint;
    });
  };
  
  /**
   * Transforms merged metric data into the format expected by the MetricChart component
   * @param mergedData - Data from mergeMetricsData
   * @param metricIds - Array of metric IDs to include
   */
  export const transformToChartFormat = (mergedData, metricIds) => {
    if (!mergedData || !Array.isArray(mergedData) || mergedData.length === 0) {
      console.warn('Invalid or empty merged data');
      return [];
    }
  
    return mergedData.map(item => {
      // Create metrics array from the data point
      const metrics = metricIds.map(metricId => ({
        name: metricId,
        value: item[metricId]
      }));
      
      return {
        period: item.period,
        metrics
      };
    });
  };
  
  /**
   * Debug helper to log the data at each transformation stage
   */
  export const debugTransformation = (apiResponses, transformedData, mergedData, chartData) => {
    console.group('Data Transformation Debug');
    console.log('API Responses:', apiResponses);
    console.log('Transformed Data:', transformedData);
    console.log('Merged Data:', mergedData);
    console.log('Chart Data:', chartData);
    console.groupEnd();
  };