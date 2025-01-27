// src/utils/graphqlUtils.ts
import { 
    ScreeningMetric, 
    GraphQLScreeningFilter,
    GraphQLScreeningResponse
  } from "@/types/screening";
  import { COMPANY_PROFILE_COLUMNS } from "@/constants/columns";
  
  export const buildScreeningQuery = (metrics: ScreeningMetric[]) => {
    const filters: GraphQLScreeningFilter[] = metrics
      .filter(metric => metric.min || metric.max)
      .flatMap(metric => {
        const fieldFilters: GraphQLScreeningFilter[] = [];
        
        if (metric.min) {
          fieldFilters.push({
            table: 'COMPANY_PROFILES_DYNAMIC',
            field: metric.field,
            operator: 'GREATER_THAN',
            value: metric.min
          });
        }
        
        if (metric.max) {
          fieldFilters.push({
            table: 'COMPANY_PROFILES_DYNAMIC',
            field: metric.field,
            operator: 'LESS_THAN',
            value: metric.max
          });
        }
        
        return fieldFilters;
      });
  
    // Create the fields section of the query
    const fieldsStr = COMPANY_PROFILE_COLUMNS
      .map(col => `{ fieldName: "company_profiles_dynamic_${col}" }`)
      .join('\n');
  
    // Build the filters section
    const filtersStr = filters.map(filter => `{
      table: ${filter.table}
      field: "${filter.field}"
      operator: ${filter.operator}
      value: "${filter.value}"
    }`).join('\n');
  
    const query = `
      query {
        screenCompanies(
          filters: [
            ${filtersStr}
          ]
        ) {
          symbol
          fields {
            fieldName
            value
          }
        }
      }
    `;
  
    return { query };
  };
  
  export const transformGraphQLResponse = (data: GraphQLScreeningResponse | null) => {
    if (!data?.screenCompanies) return [];
  
    return data.screenCompanies.map((company) => {
      const transformedCompany: Record<string, any> = {
        symbol: company.symbol
      };
  
      company.fields.forEach((field) => {
        const fieldName = field.fieldName.replace('company_profiles_dynamic_', '');
        const value = field.value;
        
        // Convert string values to numbers where appropriate
        if (['price', 'market_cap', 'beta', 'volume', 'last_dividend', 'change', 
             'change_percentage', 'average_volume'].includes(fieldName)) {
          transformedCompany[fieldName] = !isNaN(parseFloat(value)) && value !== '' 
            ? parseFloat(value) 
            : value;
        } else {
          transformedCompany[fieldName] = value;
        }
      });
  
      return transformedCompany;
    });
  };