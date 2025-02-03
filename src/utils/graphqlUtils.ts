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
  revenue: "INCOME_STATEMENTS",
  costOfRevenue: "INCOME_STATEMENTS",
  grossProfit: "INCOME_STATEMENTS",
  grossProfitRatio: "INCOME_STATEMENTS",
  ResearchAndDevelopmentExpenses: "INCOME_STATEMENTS",
  GeneralAndAdministrativeExpenses: "INCOME_STATEMENTS",
  SellingAndMarketingExpenses: "INCOME_STATEMENTS",
  SellingGeneralAndAdministrativeExpenses: "INCOME_STATEMENTS",
  otherExpenses: "INCOME_STATEMENTS",
  operatingExpenses: "INCOME_STATEMENTS",
  costAndExpenses: "INCOME_STATEMENTS",
  interestExpense: "INCOME_STATEMENTS",
  interestIncome: "INCOME_STATEMENTS",
  depreciationAndAmortization: "INCOME_STATEMENTS",
  EBITDA: "INCOME_STATEMENTS",
  EBITDARatio: "INCOME_STATEMENTS",
  operatingIncome: "INCOME_STATEMENTS",
  operatingIncomeRatio: "INCOME_STATEMENTS",
  totalOtherIncomeExpensesNet: "INCOME_STATEMENTS",
  incomeBeforeTax: "INCOME_STATEMENTS",
  incomeBeforeTaxRatio: "INCOME_STATEMENTS",
  incomeTaxExpense: "INCOME_STATEMENTS",
  netIncome: "INCOME_STATEMENTS",
  netIncomeRatio: "INCOME_STATEMENTS",
  EPS: "INCOME_STATEMENTS",
  EPSDiluted: "INCOME_STATEMENTS",
  weightedAverageShsOut: "INCOME_STATEMENTS",
  weightedAverageShsOutDil: "INCOME_STATEMENTS",

  cashAndCashEquivalents: "BALANCE_SHEET_STATEMENTS",
  shortTermInvestments: "BALANCE_SHEET_STATEMENTS",
  cashAndShortTermInvestments: "BALANCE_SHEET_STATEMENTS",
  netReceivables: "BALANCE_SHEET_STATEMENTS",
  inventory: "BALANCE_SHEET_STATEMENTS",
  otherCurrentAssets: "BALANCE_SHEET_STATEMENTS",
  totalCurrentAssets: "BALANCE_SHEET_STATEMENTS",
  propertyPlantEquipmentNet: "BALANCE_SHEET_STATEMENTS",
  goodwill: "BALANCE_SHEET_STATEMENTS",
  intangibleAssets: "BALANCE_SHEET_STATEMENTS",
  goodwillAndIntangibleAssets: "BALANCE_SHEET_STATEMENTS",
  longTermInvestments: "BALANCE_SHEET_STATEMENTS",
  taxAssets: "BALANCE_SHEET_STATEMENTS",
  otherNonCurrentAssets: "BALANCE_SHEET_STATEMENTS",
  totalNonCurrentAssets: "BALANCE_SHEET_STATEMENTS",
  otherAssets: "BALANCE_SHEET_STATEMENTS",
  totalAssets: "BALANCE_SHEET_STATEMENTS",
  totalInvestments: "BALANCE_SHEET_STATEMENTS",

  // Balance Sheet - Liabilities
  accountPayables: "BALANCE_SHEET_STATEMENTS",
  shortTermDebt: "BALANCE_SHEET_STATEMENTS",
  taxPayables: "BALANCE_SHEET_STATEMENTS",
  deferredRevenue: "BALANCE_SHEET_STATEMENTS",
  otherCurrentLiabilities: "BALANCE_SHEET_STATEMENTS",
  totalCurrentLiabilities: "BALANCE_SHEET_STATEMENTS",
  longTermDebt: "BALANCE_SHEET_STATEMENTS",
  deferredRevenueNonCurrent: "BALANCE_SHEET_STATEMENTS",
  deferrredTaxLiabilitiesNonCurrent: "BALANCE_SHEET_STATEMENTS",
  otherNonCurrentLiabilities: "BALANCE_SHEET_STATEMENTS",
  totalNonCurrentLiabilities: "BALANCE_SHEET_STATEMENTS",
  otherLiabilities: "BALANCE_SHEET_STATEMENTS",
  totalLiabilities: "BALANCE_SHEET_STATEMENTS",
  totalDebt: "BALANCE_SHEET_STATEMENTS",
  netDebt: "BALANCE_SHEET_STATEMENTS",
  capitalLeaseObligations: "BALANCE_SHEET_STATEMENTS",

  // Balance Sheet - Equity
  preferredStock: "BALANCE_SHEET_STATEMENTS",
  commonStock: "BALANCE_SHEET_STATEMENTS",
  retainedEarnings: "BALANCE_SHEET_STATEMENTS",
  accumulatedOtherComprehensiveIncomeLoss: "BALANCE_SHEET_STATEMENTS",
  othertotalStockholdersEquity: "BALANCE_SHEET_STATEMENTS",
  totalStockholdersEquity: "BALANCE_SHEET_STATEMENTS",
  minorityInterest: "BALANCE_SHEET_STATEMENTS",
  totalEquity: "BALANCE_SHEET_STATEMENTS",
  totalLiabilitiesAndStockholdersEquity: "BALANCE_SHEET_STATEMENTS"
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