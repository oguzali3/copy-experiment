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
      // Convert min/max to numbers
      const min = filter.min ? parseFloat(filter.min) : undefined;
      const max = filter.max ? parseFloat(filter.max) : undefined;

      // Skip filters with no values
      if (min === undefined && max === undefined) {
        return acc;
      }

      const filterObj = {
        metric: filter.id,
        operator: max && min ? 'between' as FilterOperator : min ? '>' as FilterOperator : '<' as FilterOperator,
        value: max && min ? [min, max] : (min || max) as number
      };

      if (BASIC_METRICS.includes(filter.id)) {
        acc.basicFilters.push(filterObj);
      } else {
        acc.advancedFilters.push(filterObj);
      }
      
      return acc;
    },
    { basicFilters: [], advancedFilters: [] } as {
      basicFilters: AdvancedFilter[];
      advancedFilters: AdvancedFilter[];
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