// src/constants/metrics.ts

import { TableName } from "./tables.enum";

const formatColumnName = (column: string): string => {
  return column
    .split(/(?=[A-Z])|_/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const METRICS_CONFIG = [
  {
    category: "Market Data",
    metrics: [
      {
        id: "price",
        name: "Price",
        description: "Current stock price",
        field: "price",
        table: TableName.COMPANY_PROFILES_DYNAMIC
      },
      {
        id: "marketcap",
        name: "Market Cap",
        description: "Total market value of company's shares",
        field: "marketcap",
        table: TableName.COMPANY_PROFILES_DYNAMIC
      },
      {
        id: "beta",
        name: "Beta",
        description: "Stock's volatility compared to the market",
        field: "beta",
        table: TableName.COMPANY_PROFILES_DYNAMIC
      },
      {
        id: "volume",
        name: "Volume",
        description: "Trading volume",
        field: "volume",
        table: TableName.COMPANY_PROFILES_DYNAMIC
      },
      {
        id: "averagevolume",
        name: "Average Volume",
        description: "Average trading volume",
        field: "averagevolume",
        table: TableName.COMPANY_PROFILES_DYNAMIC
      }
    ]
  },
  {
    category: "Income Statement - Revenue & Profitability",
    metrics: [
      {
        id: "revenue",
        name: "Revenue",
        description: "Total revenue/sales for the period",
        field: "revenue",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "costOfRevenue",
        name: "Cost of Revenue",
        description: "Direct costs attributable to goods and services sold",
        field: "costOfRevenue",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "grossProfit",
        name: "Gross Profit",
        description: "Revenue minus cost of revenue",
        field: "grossProfit",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "grossProfitRatio",
        name: "Gross Profit Margin",
        description: "Gross profit as a percentage of revenue",
        field: "grossProfitRatio",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "operatingIncome",
        name: "Operating Income",
        description: "Profit from core business operations (EBIT)",
        field: "operatingIncome",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "operatingIncomeRatio",
        name: "Operating Margin",
        description: "Operating income as a percentage of revenue",
        field: "operatingIncomeRatio",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "netIncome",
        name: "Net Income",
        description: "Total earnings/profit for the period",
        field: "netIncome",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "netIncomeRatio",
        name: "Net Profit Margin",
        description: "Net income as a percentage of revenue",
        field: "netIncomeRatio",
        table: TableName.INCOME_STATEMENTS
      }
    ]
  },
  {
    category: "Income Statement - Operating Expenses",
    metrics: [
      {
        id: "ResearchAndDevelopmentExpenses",
        name: "R&D Expenses",
        description: "Research and development costs",
        field: "ResearchAndDevelopmentExpenses",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "GeneralAndAdministrativeExpenses",
        name: "G&A Expenses",
        description: "General and administrative expenses",
        field: "GeneralAndAdministrativeExpenses",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "SellingAndMarketingExpenses",
        name: "Sales & Marketing",
        description: "Selling and marketing expenses",
        field: "SellingAndMarketingExpenses",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "SellingGeneralAndAdministrativeExpenses",
        name: "SG&A Expenses",
        description: "Combined selling, general, and administrative expenses",
        field: "SellingGeneralAndAdministrativeExpenses",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "operatingExpenses",
        name: "Operating Expenses",
        description: "Total operating expenses",
        field: "operatingExpenses",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "costAndExpenses",
        name: "Total Costs & Expenses",
        description: "Total of all costs and expenses",
        field: "costAndExpenses",
        table: TableName.INCOME_STATEMENTS
      }
    ]
  },
  {
    category: "Income Statement - Financial & Tax",
    metrics: [
      {
        id: "interestExpense",
        name: "Interest Expense",
        description: "Cost of borrowed funds",
        field: "interestExpense",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "interestIncome",
        name: "Interest Income",
        description: "Income earned from interest-bearing assets",
        field: "interestIncome",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "totalOtherIncomeExpensesNet",
        name: "Other Income/Expenses",
        description: "Net of other non-operating income and expenses",
        field: "totalOtherIncomeExpensesNet",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "incomeBeforeTax",
        name: "Pre-tax Income",
        description: "Income before tax expenses",
        field: "incomeBeforeTax",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "incomeBeforeTaxRatio",
        name: "Pre-tax Margin",
        description: "Pre-tax income as a percentage of revenue",
        field: "incomeBeforeTaxRatio",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "incomeTaxExpense",
        name: "Income Tax Expense",
        description: "Total tax expense for the period",
        field: "incomeTaxExpense",
        table: TableName.INCOME_STATEMENTS
      }
    ]
  },
  {
    category: "Income Statement - Per Share & Other Metrics",
    metrics: [
      {
        id: "EPS",
        name: "EPS",
        description: "Basic earnings per share",
        field: "EPS",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "EPSDiluted",
        name: "Diluted EPS",
        description: "Diluted earnings per share",
        field: "EPSDiluted",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "weightedAverageShsOut",
        name: "Shares Outstanding",
        description: "Weighted average shares outstanding",
        field: "weightedAverageShsOut",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "weightedAverageShsOutDil",
        name: "Diluted Shares Outstanding",
        description: "Weighted average diluted shares outstanding",
        field: "weightedAverageShsOutDil",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "EBITDA",
        name: "EBITDA",
        description: "Earnings before interest, taxes, depreciation, and amortization",
        field: "EBITDA",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "EBITDARatio",
        name: "EBITDA Margin",
        description: "EBITDA as a percentage of revenue",
        field: "EBITDARatio",
        table: TableName.INCOME_STATEMENTS
      },
      {
        id: "depreciationAndAmortization",
        name: "D&A",
        description: "Depreciation and amortization expense",
        field: "depreciationAndAmortization",
        table: TableName.INCOME_STATEMENTS
      }
    ]
  }
];