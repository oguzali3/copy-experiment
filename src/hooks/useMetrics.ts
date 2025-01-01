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

    const startYear = timePeriods[sliderValue[0]];
    const endYear = timePeriods[sliderValue[1]];
    
    const filteredData = combinedData.filter(item => {
      if (item.period === 'TTM') {
        return endYear === 'TTM';
      }
      const year = parseInt(item.period);
      const startYearInt = parseInt(startYear);
      const endYearInt = endYear === 'TTM' ? 
        parseInt(timePeriods[timePeriods.length - 2]) : 
        parseInt(endYear);
      
      return year >= startYearInt && year <= endYearInt;
    });

    return filteredData.map((item, index) => {
      const point: Record<string, any> = { period: item.period };
      const previousItem = filteredData[index + 1];
      
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
    handleMetricTypeChange,
    getMetricData
  };
};