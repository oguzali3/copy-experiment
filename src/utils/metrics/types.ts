export interface MetricDefinition {
  id: string;
  displayName: string;
  type: 'api' | 'calculated';
  calculation?: (current: any, previous: any) => number | null;
  format?: 'currency' | 'percentage' | 'shares';
}