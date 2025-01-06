export interface ScreeningMetric {
  id: string;
  name: string;
  category: string;
  description?: string;
  min: string;
  max: string;
}

export type MetricOperator = "greater_than" | "less_than" | "equal_to" | "between" | "not_equal_to";