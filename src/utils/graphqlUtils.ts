// src/utils/graphqlUtils.ts

import { ScreeningMetric } from "@/types/screening";

interface PaginationOptions {
  cursor?: string;
  limit?: number;
}

export const buildScreeningQuery = (
  metrics: ScreeningMetric[],
  pagination: PaginationOptions = {}
) => {
  const { cursor = '', limit = 25 } = pagination;
  
  const filters = metrics
    .map(metric => {
      const filters = [];
      if (metric.min) {
        filters.push({
          table: "COMPANY_PROFILES_DYNAMIC",
          field: metric.field,
          operator: "GREATER_THAN",
          value: metric.min
        });
      }
      if (metric.max) {
        filters.push({
          table: "COMPANY_PROFILES_DYNAMIC",
          field: metric.field,
          operator: "LESS_THAN",
          value: metric.max
        });
      }
      return filters;
    })
    .flat();

  const filterInputs = filters.map(filter => `{
    table: COMPANY_PROFILES_DYNAMIC,
    field: "${filter.field}",
    operator: ${filter.operator},
    value: "${filter.value}"
  }`).join(',');

  const query = `
    query ScreenCompanies {
      screenCompanies(input: {
        filters: [${filterInputs}],
        pagination: {
          cursor: "${cursor}",
          limit: ${limit}
        }
      }) {
        nodes {
          symbol
          fields {
            fieldName
            value
          }
        }
        pageInfo {
          endCursor
          hasNextPage
          total
        }
      }
    }
  `;

  return { query };
};

export const transformGraphQLResponse = (data: any[]) => {
  return data.map(item => {
    const result: any = {
      symbol: item.symbol
    };
    
    if (item.fields && Array.isArray(item.fields)) {
      item.fields.forEach((field: any) => {
        // Extract the base field name by removing the prefix
        const fieldName = field.fieldName
          .replace('company_profiles_dynamic_', '')
          .toLowerCase();
        
        // Convert the value to a number if possible
        const value = !isNaN(field.value) ? parseFloat(field.value) : field.value;
        result[fieldName] = value;
      });
    }
    
    return result;
  });
};