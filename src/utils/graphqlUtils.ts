// src/utils/graphqlUtils.ts
// src/utils/graphqlUtils.ts
import { ScreeningMetric } from "@/types/screening";

// Define exact field names with their proper casing
const fieldNameCasing: Record<string, string> = {
  // Market Data
  price: "price",
  marketcap: "marketcap",
  beta: "beta",
  volume: "volume",
  averagevolume: "averageVolume",

  // Income Statement - Revenue & Profitability
  revenue: "revenue",
  costofrevenue: "costOfRevenue",
  grossprofit: "grossProfit",
  grossprofitratio: "grossProfitRatio",
  operatingincome: "operatingIncome",
  operatingincomeratio: "operatingIncomeRatio",
  netincome: "netIncome",
  netincomeratio: "netIncomeRatio",

  // Income Statement - Operating Expenses
  researchanddevelopmentexpenses: "researchAndDevelopmentExpenses",
  generalandadministrativeexpenses: "generalAndAdministrativeExpenses",
  sellingandmarketingexpenses: "sellingAndMarketingExpenses",
  sellinggeneralandadministrativeexpenses: "sellingGeneralAndAdministrativeExpenses",
  operatingexpenses: "operatingExpenses",
  costandexpenses: "costAndExpenses",

  // Income Statement - Financial & Tax
  interestexpense: "interestExpense",
  interestincome: "interestIncome",
  totalotherincomeexpensesnet: "totalOtherIncomeExpensesNet",
  incomebeforetax: "incomeBeforeTax",
  incomebeforetaxratio: "incomeBeforeTaxRatio",
  incometaxexpense: "incomeTaxExpense",

  // Income Statement - Per Share & Other Metrics
  eps: "EPS",
  epsdiluted: "EPSDiluted",
  weightedaverageshsout: "weightedAverageShsOut",
  weightedaverageshsoutdil: "weightedAverageShsOutDil",
  ebitda: "EBITDA",
  ebitdaratio: "EBITDARatio",
  depreciationandamortization: "depreciationAndAmortization"
};

const fieldToTableMapping: Record<string, string> = {
  // Company Profiles Dynamic fields
  price: "COMPANY_PROFILES_DYNAMIC",
  marketcap: "COMPANY_PROFILES_DYNAMIC",
  beta: "COMPANY_PROFILES_DYNAMIC",
  volume: "COMPANY_PROFILES_DYNAMIC",
  averagevolume: "COMPANY_PROFILES_DYNAMIC",

  // Income Statement - Revenue & Profitability
  revenue: "INCOME_STATEMENTS",
  costofrevenue: "INCOME_STATEMENTS",
  grossprofit: "INCOME_STATEMENTS",
  grossprofitratio: "INCOME_STATEMENTS",
  operatingincome: "INCOME_STATEMENTS",
  operatingincomeratio: "INCOME_STATEMENTS",
  netincome: "INCOME_STATEMENTS",
  netincomeratio: "INCOME_STATEMENTS",

  // Income Statement - Operating Expenses
  researchanddevelopmentexpenses: "INCOME_STATEMENTS",
  generalandadministrativeexpenses: "INCOME_STATEMENTS",
  sellingandmarketingexpenses: "INCOME_STATEMENTS",
  sellinggeneralandadministrativeexpenses: "INCOME_STATEMENTS",
  operatingexpenses: "INCOME_STATEMENTS",
  costandexpenses: "INCOME_STATEMENTS",

  // Income Statement - Financial & Tax
  interestexpense: "INCOME_STATEMENTS",
  interestincome: "INCOME_STATEMENTS",
  totalotherincomeexpensesnet: "INCOME_STATEMENTS",
  incomebeforetax: "INCOME_STATEMENTS",
  incomebeforetaxratio: "INCOME_STATEMENTS",
  incometaxexpense: "INCOME_STATEMENTS",

  // Income Statement - Per Share & Other Metrics
  eps: "INCOME_STATEMENTS",
  epsdiluted: "INCOME_STATEMENTS",
  weightedaverageshsout: "INCOME_STATEMENTS",
  weightedaverageshsoutdil: "INCOME_STATEMENTS",
  ebitda: "INCOME_STATEMENTS",
  ebitdaratio: "INCOME_STATEMENTS",
  depreciationandamortization: "INCOME_STATEMENTS"
};

interface PaginationOptions {
  cursor?: string;
  limit?: number;
}

// Helper function to get correct field casing
const getFieldWithCorrectCasing = (field: string): string => {
  const lowerField = field.toLowerCase();
  return fieldNameCasing[lowerField] || lowerField;
};

export const buildScreeningQuery = (
  metrics: ScreeningMetric[],
  pagination: PaginationOptions = {}
) => {
  const { cursor = '', limit = 25 } = pagination;

  const filters = metrics
    .map(metric => {
      const filters = [];
      // Get the field with correct casing while using lowercase for mapping lookup
      const fieldLower = metric.field.toLowerCase();
      const fieldWithCasing = getFieldWithCorrectCasing(metric.field);
      const table = fieldToTableMapping[fieldLower];

      if (!table) {
        console.warn(`No table mapping found for field: ${metric.field}`);
        return filters;
      }

      if (metric.min) {
        filters.push({
          table,
          field: fieldWithCasing, // Use correct casing
          operator: "GREATER_THAN",
          value: metric.min
        });
      }
      if (metric.max) {
        filters.push({
          table,
          field: fieldWithCasing, // Use correct casing
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