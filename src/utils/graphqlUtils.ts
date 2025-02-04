// src/utils/graphqlUtils.ts
import { ScreeningMetric } from "@/types/screening";

const fieldNameCasing: Record<string, string> = {
  // Market Data
  price: "price",
  marketCap: "marketCap",
  beta: "beta",
  volume: "volume",
  averageVolume: "averageVolume",

  // Income Statement Fields (exact casing from DB schema)
  revenue: "revenue",
  costOfRevenue: "costOfRevenue",
  grossProfit: "grossProfit",
  grossProfitRatio: "grossProfitRatio",
  ResearchAndDevelopmentExpenses: "ResearchAndDevelopmentExpenses",
  GeneralAndAdministrativeExpenses: "GeneralAndAdministrativeExpenses",
  SellingAndMarketingExpenses: "SellingAndMarketingExpenses",
  SellingGeneralAndAdministrativeExpenses: "SellingGeneralAndAdministrativeExpenses",
  otherExpenses: "otherExpenses",
  operatingExpenses: "operatingExpenses",
  costAndExpenses: "costAndExpenses",
  interestExpense: "interestExpense",
  interestIncome: "interestIncome",
  depreciationAndAmortization: "depreciationAndAmortization",
  EBITDA: "EBITDA",
  EBITDARatio: "EBITDARatio",
  operatingIncome: "operatingIncome",
  operatingIncomeRatio: "operatingIncomeRatio",
  totalOtherIncomeExpensesNet: "totalOtherIncomeExpensesNet",
  incomeBeforeTax: "incomeBeforeTax",
  incomeBeforeTaxRatio: "incomeBeforeTaxRatio",
  incomeTaxExpense: "incomeTaxExpense",
  netIncome: "netIncome",
  netIncomeRatio: "netIncomeRatio",
  EPS: "EPS",
  EPSDiluted: "EPSDiluted",
  weightedAverageShsOut: "weightedAverageShsOut",
  weightedAverageShsOutDil: "weightedAverageShsOutDil",

};

const fieldToTableMapping: Record<string, string> = {
  // Company Profiles Dynamic fields
  price: "COMPANY_PROFILES_DYNAMIC",
  marketCap: "COMPANY_PROFILES_DYNAMIC",
  beta: "COMPANY_PROFILES_DYNAMIC",
  volume: "COMPANY_PROFILES_DYNAMIC",
  averageVolume: "COMPANY_PROFILES_DYNAMIC",

  // Income Statement fields
  revenue: "INCOME_STATEMENTS_ANNUAL",
  costOfRevenue: "INCOME_STATEMENTS_ANNUAL",
  grossProfit: "INCOME_STATEMENTS_ANNUAL",
  grossProfitRatio: "INCOME_STATEMENTS_ANNUAL",
  ResearchAndDevelopmentExpenses: "INCOME_STATEMENTS_ANNUAL",
  GeneralAndAdministrativeExpenses: "INCOME_STATEMENTS_ANNUAL",
  SellingAndMarketingExpenses: "INCOME_STATEMENTS_ANNUAL",
  SellingGeneralAndAdministrativeExpenses: "INCOME_STATEMENTS_ANNUAL",
  otherExpenses: "INCOME_STATEMENTS_ANNUAL",
  operatingExpenses: "INCOME_STATEMENTS_ANNUAL",
  costAndExpenses: "INCOME_STATEMENTS_ANNUAL",
  interestExpense: "INCOME_STATEMENTS_ANNUAL",
  interestIncome: "INCOME_STATEMENTS_ANNUAL",
  depreciationAndAmortization: "INCOME_STATEMENTS_ANNUAL",
  EBITDA: "INCOME_STATEMENTS_ANNUAL",
  EBITDARatio: "INCOME_STATEMENTS_ANNUAL",
  operatingIncome: "INCOME_STATEMENTS_ANNUAL",
  operatingIncomeRatio: "INCOME_STATEMENTS_ANNUAL",
  totalOtherIncomeExpensesNet: "INCOME_STATEMENTS_ANNUAL",
  incomeBeforeTax: "INCOME_STATEMENTS_ANNUAL",
  incomeBeforeTaxRatio: "INCOME_STATEMENTS_ANNUAL",
  incomeTaxExpense: "INCOME_STATEMENTS_ANNUAL",
  netIncome: "INCOME_STATEMENTS_ANNUAL",
  netIncomeRatio: "INCOME_STATEMENTS_ANNUAL",
  EPS: "INCOME_STATEMENTS_ANNUAL",
  EPSDiluted: "INCOME_STATEMENTS_ANNUAL",
  weightedAverageShsOut: "INCOME_STATEMENTS_ANNUAL",
  weightedAverageShsOutDil: "INCOME_STATEMENTS_ANNUAL",


};

interface PaginationOptions {
  cursor?: string;
  limit?: number;
}

// Helper function to get correct field casing
const getFieldWithCorrectCasing = (field: string): string => {
  return fieldNameCasing[field] || field;
};

export const buildScreeningQuery = (
  metrics: ScreeningMetric[],
  pagination: PaginationOptions = {}
) => {
  const { cursor = '', limit = 25 } = pagination;

  const filters = metrics
    .map(metric => {
      const filters = [];
      const fieldName = getFieldWithCorrectCasing(metric.field);
      // Get the table name from the mapping or use the provided table name
      const table = fieldToTableMapping[fieldName] || metric.table;

      if (!table) {
        console.warn(`No table mapping found for field: ${metric.field}`);
        return filters;
      }

      if (metric.min) {
        filters.push({
          table: table.toUpperCase(), // Ensure table name is uppercase
          field: fieldName,
          operator: "GREATER_THAN",
          value: metric.min
        });
      }
      if (metric.max) {
        filters.push({
          table: table.toUpperCase(), // Ensure table name is uppercase
          field: fieldName,
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
        const fieldName = field.fieldName;
        const value = !isNaN(field.value) ? parseFloat(field.value) : field.value;
        result[fieldName] = value;
      });
    }
    
    // Ensure required fields exist
    const requiredFields = ['price', 'marketCap', 'companyName'];
    requiredFields.forEach(field => {
      if (!result.hasOwnProperty(field)) {
        result[field] = null;
      }
    });
    
    return result;
  });
};