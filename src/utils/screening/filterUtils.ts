import { ScreeningMetric } from "@/types/screening";

export type FilterOperator = '>' | '<' | '>=' | '<=' | '=' | 'between';

export interface AdvancedFilter {
  metric: string;
  operator: FilterOperator;
  value: number | [number, number];
}

const BASIC_METRICS = [
  'marketCap',
  'price',
  'beta',
  'volume',
  'dividendYield',
  'peRatio',
  'priceToBook'
];

export const categorizeFilters = (filters: ScreeningMetric[]) => {
  return filters.reduce(
    (acc, filter) => {
      if (BASIC_METRICS.includes(filter.id)) {
        acc.basicFilters.push(filter);
      } else {
        acc.advancedFilters.push(filter);
      }
      return acc;
    },
    { basicFilters: [], advancedFilters: [] } as {
      basicFilters: ScreeningMetric[];
      advancedFilters: ScreeningMetric[];
    }
  );
};

export const evaluateCondition = (
  actual: number | undefined,
  operator: FilterOperator,
  expected: number | [number, number]
): boolean => {
  if (actual === undefined) return false;
  
  switch (operator) {
    case '>':
      return actual > (expected as number);
    case '<':
      return actual < (expected as number);
    case '>=':
      return actual >= (expected as number);
    case '<=':
      return actual <= (expected as number);
    case '=':
      return actual === (expected as number);
    case 'between':
      const [min, max] = expected as [number, number];
      return actual >= min && actual <= max;
    default:
      return false;
  }
};