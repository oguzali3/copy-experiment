// src/utils/graphqlUtils.ts
import { ScreeningMetric } from "@/types/screening";

const fieldToTableMapping: Record<string, string> = {
  // Company Profiles Dynamic fields
  price: "COMPANY_PROFILES_DYNAMIC",
  market_cap: "COMPANY_PROFILES_DYNAMIC",
  beta: "COMPANY_PROFILES_DYNAMIC",
  volume: "COMPANY_PROFILES_DYNAMIC",
  average_volume: "COMPANY_PROFILES_DYNAMIC",

  // Income Statement fields
  revenue: "INCOME_STATEMENTS",
  costofrevenue: "INCOME_STATEMENTS",
  grossprofit: "INCOME_STATEMENTS",
  grossprofitratio: "INCOME_STATEMENTS",
  operatingincome: "INCOME_STATEMENTS",
  operatingincomeratio: "INCOME_STATEMENTS",
  netincome: "INCOME_STATEMENTS",
  netincomeratio: "INCOME_STATEMENTS",
  ebitda: "INCOME_STATEMENTS",
  ebitdaratio: "INCOME_STATEMENTS",
  eps: "INCOME_STATEMENTS",
  epsdiluted: "INCOME_STATEMENTS"
};

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
      // Convert field to lowercase for consistent comparison
      const fieldLower = metric.field.toLowerCase();
      const table = fieldToTableMapping[fieldLower];
      
      if (!table) {
        console.warn(`No table mapping found for field: ${metric.field}`);
        return filters;
      }

      if (metric.min) {
        filters.push({
          table,
          field: fieldLower, // Use lowercase field name
          operator: "GREATER_THAN",
          value: metric.min
        });
      }
      if (metric.max) {
        filters.push({
          table,
          field: fieldLower, // Use lowercase field name
          operator: "LESS_THAN",
          value: metric.max
        });
      }
      return filters;
    })
    .flat()
    .filter(filter => filter);

  const filterInputs = filters.map(filter => `{
    table: ${filter.table}
    field: "${filter.field}"
    operator: ${filter.operator}
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

  console.log('Generated GraphQL Query:', query);
  return { query };
};

export const transformGraphQLResponse = (data: any[]) => {
  return data.map(item => {
    const result: any = {
      symbol: item.symbol
    };
    
    if (item.fields && Array.isArray(item.fields)) {
      item.fields.forEach((field: any) => {
        console.log('Processing field:', field);
        const fieldParts = field.fieldName.split('_');
        const fieldName = fieldParts[fieldParts.length - 1].toLowerCase();
        const value = !isNaN(field.value) ? parseFloat(field.value) : field.value;
        result[fieldName] = value;
      });
    }
    
    console.log('Transformed result:', result);
    return result;
  });
};