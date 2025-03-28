// types/chartTypes.ts - Definitions for chart type options

// Define a type for the supported chart types
export type ChartType = 'bar' | 'line' | 'stacked';

// Interface for the metric type mapping
export interface MetricTypeMap {
  [metricId: string]: ChartType;
}