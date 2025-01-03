import { useState, useEffect } from "react";
import { INCOME_STATEMENT_METRICS, calculateMetricValue } from "@/utils/metricDefinitions";

export const useMetrics = (ticker: string) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [metricTypes, setMetricTypes] = useState<Record<string, 'bar' | 'line'>>({});

  useEffect(() => {
    setSelectedMetrics([]);
    setMetricTypes({});
  }, [ticker]);

  const handleMetricTypeChange = (metric: string, type: 'bar' | 'line') => {
    setMetricTypes(prev => ({
      ...prev,
      [metric]: type
    }));
  };

  const getMetricData = (combinedData: any[], timePeriods: string[], sliderValue: number[]) => {
    if (!selectedMetrics.length || !combinedData?.length) return [];

    // Get the date range from the slider values
    const startPeriod = timePeriods[sliderValue[0]];
    const endPeriod = timePeriods[sliderValue[1]];
    
    // Filter data based on the selected date range
    const filteredData = combinedData.filter(item => {
      if (item.period === 'TTM') {
        return endPeriod === 'TTM';
      }
      const itemYear = parseInt(item.period);
      const startYear = startPeriod === 'TTM' ? 0 : parseInt(startPeriod);
      const endYear = endPeriod === 'TTM' ? Infinity : parseInt(endPeriod);
      
      return itemYear >= startYear && itemYear <= endYear;
    });

    // Sort data chronologically
    const sortedData = [...filteredData].sort((a, b) => {
      if (a.period === 'TTM') return 1;
      if (b.period === 'TTM') return -1;
      return parseInt(a.period) - parseInt(b.period);
    });

    return sortedData.map((item, index) => {
      const point: Record<string, any> = { period: item.period };
      const previousItem = sortedData[index - 1];
      
      selectedMetrics.forEach(metric => {
        const metricDef = INCOME_STATEMENT_METRICS.find(m => m.id === metric);
        if (metricDef) {
          point[metric] = calculateMetricValue(metricDef, item, previousItem);
        }
      });
      
      return point;
    });
  };

  return {
    selectedMetrics,
    setSelectedMetrics,
    metricTypes,
    setMetricTypes,
    handleMetricTypeChange,
    getMetricData
  };
};