import { useState, useEffect, useCallback } from "react";
import { 
  ALL_METRICS,
  INCOME_STATEMENT_METRICS,
  BALANCE_SHEET_METRICS,
  CASH_FLOW_METRICS,
  KEY_METRICS,
  FINANCIAL_RATIO_METRICS,
  getMetricFormat 
} from "@/utils/metricDefinitions";

export const useMetrics = (ticker: string) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [metricTypes, setMetricTypes] = useState<Record<string, 'bar' | 'line'>>({});

  // Reset selected metrics when ticker changes
  useEffect(() => {
    setSelectedMetrics([]);
    setMetricTypes({});
  }, [ticker]);

  // Set default chart type for newly selected metrics
  useEffect(() => {
    // Only handle metrics that don't already have a type set
    const newMetrics = selectedMetrics.filter(metric => metricTypes[metric] === undefined);
    
    if (newMetrics.length === 0) return;
    
    const updatedTypes = { ...metricTypes };
    
    newMetrics.forEach(metric => {
      // Default to bar for currency metrics and line for percentage/ratio metrics
      const format = getMetricFormat(metric);
      if (format === 'percentage' || format === 'ratio') {
        updatedTypes[metric] = 'line';
      } else {
        updatedTypes[metric] = 'bar';
      }
    });
    
    setMetricTypes(updatedTypes);
  }, [selectedMetrics, metricTypes]);

  // Memoize handlers to prevent recreating them on every render
  const handleMetricTypeChange = useCallback((metric: string, type: 'bar' | 'line') => {
    setMetricTypes(prev => ({
      ...prev,
      [metric]: type
    }));
  }, []);

  const handleAddMetric = useCallback((metricId: string) => {
    if (!metricId) return;
    
    setSelectedMetrics(prev => {
      if (prev.includes(metricId)) return prev;
      return [...prev, metricId];
    });
  }, []);

  const handleRemoveMetric = useCallback((metricId: string) => {
    if (!metricId) return;
    
    setSelectedMetrics(prev => prev.filter(id => id !== metricId));
    
    // Also remove from metric types
    setMetricTypes(prev => {
      const updated = { ...prev };
      delete updated[metricId];
      return updated;
    });
  }, []);

  const handleToggleMetric = useCallback((metricId: string) => {
    if (!metricId) return;
    
    setSelectedMetrics(prev => {
      if (prev.includes(metricId)) {
        return prev.filter(id => id !== metricId);
      } else {
        return [...prev, metricId];
      }
    });
  }, []);

  // Get metrics specific to a financial statement type - memoized to prevent recreation
  const getMetricsBySource = useCallback((source: 'income-statement' | 'balance-sheet' | 'cash-flow' | 'key-metrics' | 'financial-ratios') => {
    switch (source) {
      case 'income-statement':
        return INCOME_STATEMENT_METRICS.map(m => m.id);
      case 'balance-sheet':
        return BALANCE_SHEET_METRICS.map(m => m.id);
      case 'cash-flow':
        return CASH_FLOW_METRICS.map(m => m.id);
      case 'key-metrics':
        return KEY_METRICS.map(m => m.id);
      case 'financial-ratios':
        return FINANCIAL_RATIO_METRICS.map(m => m.id);
      default:
        return [];
    }
  }, []);

  return {
    selectedMetrics,
    setSelectedMetrics,
    metricTypes,
    handleMetricTypeChange,
    handleAddMetric,
    handleRemoveMetric,
    handleToggleMetric,
    getMetricsBySource
  };
};