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
        id: "marketCap",
        name: "Market Cap",
        description: "Total market value of company's shares",
        field: "marketCap",
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
        id: "averageVolume",
        name: "Average Volume",
        description: "Average trading volume",
        field: "averageVolume",
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
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "costOfRevenue",
        name: "Cost of Revenue",
        description: "Direct costs attributable to goods and services sold",
        field: "costOfRevenue",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "grossProfit",
        name: "Gross Profit",
        description: "Revenue minus cost of revenue",
        field: "grossProfit",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "grossProfitRatio",
        name: "Gross Profit Margin",
        description: "Gross profit as a percentage of revenue",
        field: "grossProfitRatio",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "operatingIncome",
        name: "Operating Income",
        description: "Profit from core business operations (EBIT)",
        field: "operatingIncome",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "operatingIncomeRatio",
        name: "Operating Margin",
        description: "Operating income as a percentage of revenue",
        field: "operatingIncomeRatio",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "netIncome",
        name: "Net Income",
        description: "Total earnings/profit for the period",
        field: "netIncome",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "netIncomeRatio",
        name: "Net Profit Margin",
        description: "Net income as a percentage of revenue",
        field: "netIncomeRatio",
        table: TableName.INCOME_STATEMENTS_ANNUAL
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
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "GeneralAndAdministrativeExpenses",
        name: "G&A Expenses",
        description: "General and administrative expenses",
        field: "GeneralAndAdministrativeExpenses",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "SellingAndMarketingExpenses",
        name: "Sales & Marketing",
        description: "Selling and marketing expenses",
        field: "SellingAndMarketingExpenses",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "SellingGeneralAndAdministrativeExpenses",
        name: "SG&A Expenses",
        description: "Combined selling, general, and administrative expenses",
        field: "SellingGeneralAndAdministrativeExpenses",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "otherExpenses",
        name: "Other Expenses",
        description: "Other operating expenses",
        field: "otherExpenses",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "operatingExpenses",
        name: "Operating Expenses",
        description: "Total operating expenses",
        field: "operatingExpenses",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "costAndExpenses",
        name: "Total Costs & Expenses",
        description: "Total of all costs and expenses",
        field: "costAndExpenses",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      }
    ]
  },
  {
    category: "Income Statement - Financial & Tax",
    metrics: [
      {
        id: "interestIncome",
        name: "Interest Income",
        description: "Income earned from interest-bearing assets",
        field: "interestIncome",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "interestExpense",
        name: "Interest Expense",
        description: "Cost of borrowed funds",
        field: "interestExpense",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "totalOtherIncomeExpensesNet",
        name: "Other Income/Expenses",
        description: "Net of other non-operating income and expenses",
        field: "totalOtherIncomeExpensesNet",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "incomeBeforeTax",
        name: "Pre-tax Income",
        description: "Income before tax expenses",
        field: "incomeBeforeTax",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "incomeBeforeTaxRatio",
        name: "Pre-tax Margin",
        description: "Pre-tax income as a percentage of revenue",
        field: "incomeBeforeTaxRatio",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "incomeTaxExpense",
        name: "Income Tax Expense",
        description: "Total tax expense for the period",
        field: "incomeTaxExpense",
        table: TableName.INCOME_STATEMENTS_ANNUAL
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
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "EPSDiluted",
        name: "Diluted EPS",
        description: "Diluted earnings per share",
        field: "EPSDiluted",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "weightedAverageShsOut",
        name: "Shares Outstanding",
        description: "Weighted average shares outstanding",
        field: "weightedAverageShsOut",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "weightedAverageShsOutDil",
        name: "Diluted Shares Outstanding",
        description: "Weighted average diluted shares outstanding",
        field: "weightedAverageShsOutDil",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "EBITDA",
        name: "EBITDA",
        description: "Earnings before interest, taxes, depreciation, and amortization",
        field: "EBITDA",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "EBITDARatio",
        name: "EBITDA Margin",
        description: "EBITDA as a percentage of revenue",
        field: "EBITDARatio",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      },
      {
        id: "depreciationAndAmortization",
        name: "D&A",
        description: "Depreciation and amortization expense",
        field: "depreciationAndAmortization",
        table: TableName.INCOME_STATEMENTS_ANNUAL
      }
    ]
  },
  {
    category: "Balance Sheet - Current Assets",
    metrics: [
      {
        id: "cashAndCashEquivalents",
        name: "Cash & Equivalents",
        description: "Cash and highly liquid investments",
        field: "cashAndCashEquivalents",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "shortTermInvestments",
        name: "Short Term Investments",
        description: "Investments maturing within one year",
        field: "shortTermInvestments",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "cashAndShortTermInvestments",
        name: "Cash & Short Term Investments",
        description: "Total of cash and short-term investments",
        field: "cashAndShortTermInvestments",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "netReceivables",
        name: "Net Receivables",
        description: "Accounts receivable net of allowances",
        field: "netReceivables",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "inventory",
        name: "Inventory",
        description: "Value of goods and materials held for sale",
        field: "inventory",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "otherCurrentAssets",
        name: "Other Current Assets",
        description: "Additional current assets not categorized elsewhere",
        field: "otherCurrentAssets",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "totalCurrentAssets",
        name: "Total Current Assets",
        description: "Sum of all current assets",
        field: "totalCurrentAssets",
        table: TableName.BALANCE_SHEET_STATEMENTS
      }
    ]
  },
  {
    category: "Balance Sheet - Non-Current Assets",
    metrics: [
      {
        id: "propertyPlantEquipmentNet",
        name: "PP&E (Net)",
        description: "Net value of property, plant, and equipment",
        field: "propertyPlantEquipmentNet",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "goodwill",
        name: "Goodwill",
        description: "Premium paid for acquired companies",
        field: "goodwill",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "intangibleAssets",
        name: "Intangible Assets",
        description: "Non-physical assets like patents and trademarks",
        field: "intangibleAssets",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "goodwillAndIntangibleAssets",
        name: "Goodwill & Intangibles",
        description: "Combined goodwill and intangible assets",
        field: "goodwillAndIntangibleAssets",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "longTermInvestments",
        name: "Long Term Investments",
        description: "Investments held for more than one year",
        field: "longTermInvestments",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "taxAssets",
        name: "Tax Assets",
        description: "Deferred tax assets and tax-related receivables",
        field: "taxAssets",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "otherNonCurrentAssets",
        name: "Other Non-Current Assets",
        description: "Additional long-term assets not categorized elsewhere",
        field: "otherNonCurrentAssets",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "totalNonCurrentAssets",
        name: "Total Non-Current Assets",
        description: "Sum of all non-current assets",
        field: "totalNonCurrentAssets",
        table: TableName.BALANCE_SHEET_STATEMENTS
      }
    ]
  },
  {
    category: "Balance Sheet - Current Liabilities",
    metrics: [
      {
        id: "accountPayables",
        name: "Accounts Payable",
        description: "Money owed to suppliers",
        field: "accountPayables",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "shortTermDebt",
        name: "Short Term Debt",
        description: "Debt due within one year",
        field: "shortTermDebt",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "taxPayables",
        name: "Tax Payables",
        description: "Taxes owed but not yet paid",
        field: "taxPayables",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "deferredRevenue",
        name: "Deferred Revenue",
        description: "Advanced payments received for products/services",
        field: "deferredRevenue",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "otherCurrentLiabilities",
        name: "Other Current Liabilities",
        description: "Additional short-term obligations",
        field: "otherCurrentLiabilities",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "totalCurrentLiabilities",
        name: "Total Current Liabilities",
        description: "Sum of all current liabilities",
        field: "totalCurrentLiabilities",
        table: TableName.BALANCE_SHEET_STATEMENTS
      }
    ]
  },
  {
    category: "Balance Sheet - Non-Current Liabilities",
    metrics: [
      {
        id: "longTermDebt",
        name: "Long Term Debt",
        description: "Debt due after one year",
        field: "longTermDebt",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "deferredRevenueNonCurrent",
        name: "Deferred Revenue (Non-Current)",
        description: "Long-term deferred revenue",
        field: "deferredRevenueNonCurrent",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "deferrredTaxLiabilitiesNonCurrent",
        name: "Deferred Tax Liabilities",
        description: "Future tax obligations",
        field: "deferrredTaxLiabilitiesNonCurrent",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "otherNonCurrentLiabilities",
        name: "Other Non-Current Liabilities",
        description: "Additional long-term obligations",
        field: "otherNonCurrentLiabilities",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "totalNonCurrentLiabilities",
        name: "Total Non-Current Liabilities",
        description: "Sum of all non-current liabilities",
        field: "totalNonCurrentLiabilities",
        table: TableName.BALANCE_SHEET_STATEMENTS
      }
    ]
  },
  {
    category: "Balance Sheet - Equity",
    metrics: [
      {
        id: "preferredStock",
        name: "Preferred Stock",
        description: "Value of preferred shares",
        field: "preferredStock",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "commonStock",
        name: "Common Stock",
        description: "Value of common shares",
        field: "commonStock",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "retainedEarnings",
        name: "Retained Earnings",
        description: "Accumulated profits not paid as dividends",
        field: "retainedEarnings",
        table: TableName.BALANCE_SHEET_STATEMENTS
      },
      {
        id: "accumulatedOtherComprehensiveIncomeLoss",
        name: "Accumulated Other Comprehensive Income",
        description: "Accumulated other comprehensive income or loss",
        field: "accumulatedOtherComprehensiveIncomeLoss",
        table: TableName.BALANCE_SHEET_STATEMENTS
      }
]},
{
  category: "Key Metrics - Per Share Values",
  metrics: [
    {
      id: "revenuePerShare",
      name: "Revenue Per Share",
      description: "Total revenue divided by shares outstanding",
      field: "revenuePerShare",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "netIncomePerShare",
      name: "Net Income Per Share",
      description: "Net income divided by shares outstanding",
      field: "netIncomePerShare",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "operatingCashFlowPerShare",
      name: "Operating Cash Flow Per Share",
      description: "Operating cash flow divided by shares outstanding",
      field: "operatingCashFlowPerShare",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "freeCashFlowPerShare",
      name: "Free Cash Flow Per Share",
      description: "Free cash flow divided by shares outstanding",
      field: "freeCashFlowPerShare",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "cashPerShare",
      name: "Cash Per Share",
      description: "Total cash divided by shares outstanding",
      field: "cashPerShare",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "bookValuePerShare",
      name: "Book Value Per Share",
      description: "Total equity divided by shares outstanding",
      field: "bookValuePerShare",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "tangibleBookValuePerShare",
      name: "Tangible Book Value Per Share",
      description: "Tangible book value divided by shares outstanding",
      field: "tangibleBookValuePerShare",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "shareholdersEquityPerShare",
      name: "Shareholders Equity Per Share",
      description: "Total shareholders' equity divided by shares outstanding",
      field: "shareholdersEquityPerShare",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "interestDebtPerShare",
      name: "Interest Debt Per Share",
      description: "Total interest-bearing debt divided by shares outstanding",
      field: "interestDebtPerShare",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "capexPerShare",
      name: "Capital Expenditure Per Share",
      description: "Capital expenditure divided by shares outstanding",
      field: "capexPerShare",
      table: TableName.KEY_METRICS_ANNUAL
    }
  ]
},
{
  category: "Key Metrics - Valuation",
  metrics: [
    {
      id: "marketCap",
      name: "Market Capitalization",
      description: "Total market value of company's outstanding shares",
      field: "marketCap",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "enterpriseValue",
      name: "Enterprise Value",
      description: "Total company value (market cap plus debt minus cash)",
      field: "enterpriseValue",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "peRatio",
      name: "P/E Ratio",
      description: "Price to earnings ratio",
      field: "peRatio",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "priceToSalesRatio",
      name: "P/S Ratio",
      description: "Price to sales ratio",
      field: "priceToSalesRatio",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "pocfratio",
      name: "P/OCF Ratio",
      description: "Price to operating cash flow ratio",
      field: "pocfratio",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "pfcfRatio",
      name: "P/FCF Ratio",
      description: "Price to free cash flow ratio",
      field: "pfcfRatio",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "pbRatio",
      name: "P/B Ratio",
      description: "Price to book ratio",
      field: "pbRatio",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "ptbRatio",
      name: "P/TB Ratio",
      description: "Price to tangible book ratio",
      field: "ptbRatio",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "evToSales",
      name: "EV/Sales",
      description: "Enterprise value to sales ratio",
      field: "evToSales",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "enterpriseValueOverEBITDA",
      name: "EV/EBITDA",
      description: "Enterprise value to EBITDA ratio",
      field: "enterpriseValueOverEBITDA",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "evToOperatingCashFlow",
      name: "EV/Operating Cash Flow",
      description: "Enterprise value to operating cash flow ratio",
      field: "evToOperatingCashFlow",
      table: TableName.KEY_METRICS_ANNUAL
    }
  ]
},
{
  category: "Key Metrics - Returns & Yield",
  metrics: [
    {
      id: "earningsYield",
      name: "Earnings Yield",
      description: "Earnings per share divided by share price",
      field: "earningsYield",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "freeCashFlowYield",
      name: "Free Cash Flow Yield",
      description: "Free cash flow per share divided by share price",
      field: "freeCashFlowYield",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "dividendYield",
      name: "Dividend Yield",
      description: "Annual dividends per share divided by share price",
      field: "dividendYield",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "payoutRatio",
      name: "Payout Ratio",
      description: "Proportion of earnings paid out as dividends",
      field: "payoutRatio",
      table: TableName.KEY_METRICS_ANNUAL
    }
  ]
},
{
  category: "Key Metrics - Financial Health",
  metrics: [
    {
      id: "debtToEquity",
      name: "Debt to Equity",
      description: "Total debt divided by shareholders' equity",
      field: "debtToEquity",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "debtToAssets",
      name: "Debt to Assets",
      description: "Total debt divided by total assets",
      field: "debtToAssets",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "netDebtToEBITDA",
      name: "Net Debt to EBITDA",
      description: "Net debt divided by EBITDA",
      field: "netDebtToEBITDA",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "currentRatio",
      name: "Current Ratio",
      description: "Current assets divided by current liabilities",
      field: "currentRatio",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "interestCoverage",
      name: "Interest Coverage",
      description: "Operating income divided by interest expense",
      field: "interestCoverage",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "incomeQuality",
      name: "Income Quality",
      description: "Operating cash flow divided by net income",
      field: "incomeQuality",
      table: TableName.KEY_METRICS_ANNUAL
    }
  ]
},
{
  category: "Key Metrics - Efficiency",
  metrics: [
    {
      id: "roic",
      name: "ROIC",
      description: "Return on invested capital",
      field: "roic",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "returnOnTangibleAssets",
      name: "Return on Tangible Assets",
      description: "Net income divided by tangible assets",
      field: "returnOnTangibleAssets",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "grahamNumber",
      name: "Graham Number",
      description: "Square root of (22.5 x EPS x Book Value per Share)",
      field: "grahamNumber",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "grahamNetNet",
      name: "Graham Net-Net",
      description: "Working capital minus total liabilities",
      field: "grahamNetNet",
      table: TableName.KEY_METRICS_ANNUAL
    }
  ]
},
{
  category: "Key Metrics - Working Capital",
  metrics: [
    {
      id: "workingCapital",
      name: "Working Capital",
      description: "Current assets minus current liabilities",
      field: "workingCapital",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "tangibleAssetValue",
      name: "Tangible Asset Value",
      description: "Total assets minus intangible assets",
      field: "tangibleAssetValue",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "netCurrentAssetValue",
      name: "Net Current Asset Value",
      description: "Current assets minus total liabilities",
      field: "netCurrentAssetValue",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "investedCapital",
      name: "Invested Capital",
      description: "Total investment in the business",
      field: "investedCapital",
      table: TableName.KEY_METRICS_ANNUAL
    }
  ]
},
{
  category: "Key Metrics - Operational Efficiency",
  metrics: [
    {
      id: "averageReceivables",
      name: "Average Receivables",
      description: "Average accounts receivable for the period",
      field: "averageReceivables",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "averagePayables",
      name: "Average Payables",
      description: "Average accounts payable for the period",
      field: "averagePayables",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "averageInventory",
      name: "Average Inventory",
      description: "Average inventory for the period",
      field: "averageInventory",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "daysSalesOutstanding",
      name: "Days Sales Outstanding",
      description: "Average number of days to collect payment",
      field: "daysSalesOutstanding",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "daysPayablesOutstanding",
      name: "Days Payables Outstanding",
      description: "Average number of days to pay suppliers",
      field: "daysPayablesOutstanding",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "daysOfInventoryOnHand",
      name: "Days Inventory Outstanding",
      description: "Average number of days to sell inventory",
      field: "daysOfInventoryOnHand",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "receivablesTurnover",
      name: "Receivables Turnover",
      description: "Number of times receivables are collected per year",
      field: "receivablesTurnover",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "payablesTurnover",
      name: "Payables Turnover",
      description: "Number of times payables are paid per year",
      field: "payablesTurnover",
      table: TableName.KEY_METRICS_ANNUAL
    },
    {
      id: "inventoryTurnover",
      name: "Inventory Turnover",
      description: "Number of times inventory is sold per year",
      field: "inventoryTurnover",
      table: TableName.KEY_METRICS_ANNUAL
    }
  ]
},
{
  category: "Financial Ratios - Liquidity",
  metrics: [
    {
      id: "currentRatio",
      name: "Current Ratio",
      description: "Current assets divided by current liabilities",
      field: "currentRatio",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "quickRatio",
      name: "Quick Ratio",
      description: "Quick assets divided by current liabilities",
      field: "quickRatio",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "cashRatio",
      name: "Cash Ratio",
      description: "Cash and equivalents divided by current liabilities",
      field: "cashRatio",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "daysOfSalesOutstanding",
      name: "Days of Sales Outstanding",
      description: "Average number of days to collect revenue after a sale",
      field: "daysOfSalesOutstanding",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "daysOfInventoryOutstanding",
      name: "Days of Inventory Outstanding",
      description: "Average number of days a company holds inventory before selling it",
      field: "daysOfInventoryOutstanding",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "operatingCycle",
      name: "Operating Cycle",
      description: "Time taken to convert inventory and receivables to cash",
      field: "operatingCycle",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "daysOfPayablesOutstanding",
      name: "Days of Payables Outstanding",
      description: "Average time taken by a company to pay suppliers",
      field: "daysOfPayablesOutstanding",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "cashConversionCycle",
      name: "Cash Conversion Cycle",
      description: "Time taken to convert inventory into cash from sales",
      field: "cashConversionCycle",
      table: TableName.RATIOS_ANNUAL
    }
  ]
},
{
  category: "Financial Ratios - Profitability",
  metrics: [
    {
      id: "grossProfitMargin",
      name: "Gross Profit Margin",
      description: "Gross profit as a percentage of revenue",
      field: "grossProfitMargin",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "operatingProfitMargin",
      name: "Operating Profit Margin",
      description: "Operating profit as a percentage of revenue",
      field: "operatingProfitMargin",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "pretaxProfitMargin",
      name: "Pretax Profit Margin",
      description: "Income before taxes as a percentage of revenue",
      field: "pretaxProfitMargin",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "netProfitMargin",
      name: "Net Profit Margin",
      description: "Net income as a percentage of revenue",
      field: "netProfitMargin",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "effectiveTaxRate",
      name: "Effective Tax Rate",
      description: "Total tax expense divided by pre-tax income",
      field: "effectiveTaxRate",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "returnOnAssets",
      name: "Return on Assets",
      description: "Net income as a percentage of total assets",
      field: "returnOnAssets",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "returnOnEquity",
      name: "Return on Equity",
      description: "Net income as a percentage of shareholders' equity",
      field: "returnOnEquity",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "returnOnCapitalEmployed",
      name: "Return on Capital Employed",
      description: "EBIT divided by capital employed",
      field: "returnOnCapitalEmployed",
      table: TableName.RATIOS_ANNUAL
    }
  ]
},
{
  category: "Financial Ratios - Debt and Solvency",
  metrics: [
    {
      id: "debtRatio",
      name: "Debt Ratio",
      description: "Total liabilities divided by total assets",
      field: "debtRatio",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "debtEquityRatio",
      name: "Debt to Equity Ratio",
      description: "Total debt divided by shareholders' equity",
      field: "debtEquityRatio",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "longTermDebtToCapitalization",
      name: "Long Term Debt to Capitalization",
      description: "Long-term debt divided by total capitalization",
      field: "longTermDebtToCapitalization",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "totalDebtToCapitalization",
      name: "Total Debt to Capitalization",
      description: "Total debt divided by total capitalization",
      field: "totalDebtToCapitalization",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "interestCoverage",
      name: "Interest Coverage Ratio",
      description: "EBIT divided by interest expense",
      field: "interestCoverage",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "cashFlowToDebtRatio",
      name: "Cash Flow to Debt Ratio",
      description: "Operating cash flow divided by total debt",
      field: "cashFlowToDebtRatio",
      table: TableName.RATIOS_ANNUAL
    }
  ]
},
{
  category: "Financial Ratios - Efficiency",
  metrics: [
    {
      id: "receivablesTurnover",
      name: "Receivables Turnover",
      description: "Number of times receivables are collected per year",
      field: "receivablesTurnover",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "payablesTurnover",
      name: "Payables Turnover",
      description: "Number of times payables are paid per year",
      field: "payablesTurnover",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "inventoryTurnover",
      name: "Inventory Turnover",
      description: "Number of times inventory is sold per year",
      field: "inventoryTurnover",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "fixedAssetTurnover",
      name: "Fixed Asset Turnover",
      description: "Revenue generated per dollar of fixed assets",
      field: "fixedAssetTurnover",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "assetTurnover",
      name: "Asset Turnover",
      description: "Revenue generated per dollar of total assets",
      field: "assetTurnover",
      table: TableName.RATIOS_ANNUAL
    }
  ]
},
{
  category: "Financial Ratios - Market Valuation",
  metrics: [
    {
      id: "priceBookValueRatio",
      name: "Price to Book Value",
      description: "Market price per share divided by book value per share",
      field: "priceBookValueRatio",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "priceEarningsRatio",
      name: "P/E Ratio",
      description: "Market price per share divided by earnings per share",
      field: "priceEarningsRatio",
      table: TableName.RATIOS_ANNUAL
    },
    {
      id: "dividendYield",
      name: "Dividend Yield",
      description: "Annual dividends per share divided by share price",
      field: "dividendYield",
      table: TableName.RATIOS_ANNUAL
    }
  ]
},
{
  category: "Cash Flow - Operating Activities",
  metrics: [
    {
      id: "netIncome",
      name: "Net Income",
      description: "Total earnings after all expenses",
      field: "netIncome",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "depreciationAndAmortization",
      name: "Depreciation & Amortization",
      description: "Non-cash expenses related to asset depreciation and amortization",
      field: "depreciationAndAmortization",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "deferredIncomeTax",
      name: "Deferred Income Tax",
      description: "Tax expenses that are deferred to future periods",
      field: "deferredIncomeTax",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "stockBasedCompensation",
      name: "Stock-Based Compensation",
      description: "Compensation expense paid in stock options",
      field: "stockBasedCompensation",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "changeInWorkingCapital",
      name: "Change in Working Capital",
      description: "Change in net working capital during the period",
      field: "changeInWorkingCapital",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "accountsReceivables",
      name: "Accounts Receivables",
      description: "Amount of money owed by customers for goods or services",
      field: "accountsReceivables",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "inventory",
      name: "Inventory",
      description: "Total value of inventory changes",
      field: "inventory",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "accountsPayables",
      name: "Accounts Payables",
      description: "Outstanding payments due to suppliers",
      field: "accountsPayables",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "otherWorkingCapital",
      name: "Other Working Capital",
      description: "Other short-term assets and liabilities affecting working capital",
      field: "otherWorkingCapital",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "otherNonCashItems",
      name: "Other Non-Cash Items",
      description: "Non-cash adjustments affecting net income",
      field: "otherNonCashItems",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "netCashProvidedByOperatingActivites",
      name: "Net Cash from Operating Activities",
      description: "Cash generated from core business operations",
      field: "netCashProvidedByOperatingActivites",
      table: TableName.CASH_FLOW_STATEMENTS
    }
  ]
},
{
  category: "Cash Flow - Investing Activities",
  metrics: [
    {
      id: "investmentsInPropertyPlantAndEquipment",
      name: "Capital Expenditure (CAPEX)",
      description: "Cash spent on purchasing property, plants, and equipment",
      field: "investmentsInPropertyPlantAndEquipment",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "acquisitionsNet",
      name: "Acquisitions (Net)",
      description: "Cash spent or received from acquisitions",
      field: "acquisitionsNet",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "purchasesOfInvestments",
      name: "Purchases of Investments",
      description: "Cash spent on purchasing investments",
      field: "purchasesOfInvestments",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "salesMaturitiesOfInvestments",
      name: "Sales & Maturities of Investments",
      description: "Cash received from selling investments",
      field: "salesMaturitiesOfInvestments",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "otherInvestingActivites",
      name: "Other Investing Activities",
      description: "Other cash activities related to investing",
      field: "otherInvestingActivites",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "netCashUsedForInvestingActivites",
      name: "Net Cash from Investing Activities",
      description: "Total net cash used in investing activities",
      field: "netCashUsedForInvestingActivites",
      table: TableName.CASH_FLOW_STATEMENTS
    }
  ]
},
{
  category: "Cash Flow - Financing Activities",
  metrics: [
    {
      id: "debtRepayment",
      name: "Debt Repayment",
      description: "Cash used to pay off debt obligations",
      field: "debtRepayment",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "commonStockIssued",
      name: "Common Stock Issued",
      description: "Cash raised from issuing new common shares",
      field: "commonStockIssued",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "commonStockRepurchased",
      name: "Common Stock Repurchased",
      description: "Cash spent on repurchasing common stock",
      field: "commonStockRepurchased",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "dividendsPaid",
      name: "Dividends Paid",
      description: "Cash paid out as dividends to shareholders",
      field: "dividendsPaid",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "otherFinancingActivites",
      name: "Other Financing Activities",
      description: "Other cash activities related to financing",
      field: "otherFinancingActivites",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "netCashUsedProvidedByFinancingActivities",
      name: "Net Cash from Financing Activities",
      description: "Total net cash from financing activities",
      field: "netCashUsedProvidedByFinancingActivities",
      table: TableName.CASH_FLOW_STATEMENTS
    }
  ]
},
{
  category: "Cash Flow - Currency & Cash Movements",
  metrics: [
    {
      id: "effectOfForexChangesOnCash",
      name: "Effect of Forex Changes on Cash",
      description: "Impact of foreign exchange rate fluctuations on cash",
      field: "effectOfForexChangesOnCash",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "netChangeInCash",
      name: "Net Change in Cash",
      description: "Total change in cash balance over the period",
      field: "netChangeInCash",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "cashAtEndOfPeriod",
      name: "Cash at End of Period",
      description: "Cash balance at the end of the reporting period",
      field: "cashAtEndOfPeriod",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "cashAtBeginningOfPeriod",
      name: "Cash at Beginning of Period",
      description: "Cash balance at the start of the reporting period",
      field: "cashAtBeginningOfPeriod",
      table: TableName.CASH_FLOW_STATEMENTS
    }
  ]
},
{
  category: "Key Cash Flow Metrics",
  metrics: [
    {
      id: "operatingCashFlow",
      name: "Operating Cash Flow",
      description: "Cash generated from core business operations",
      field: "operatingCashFlow",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "capitalExpenditure",
      name: "Capital Expenditure",
      description: "Investments in long-term assets",
      field: "capitalExpenditure",
      table: TableName.CASH_FLOW_STATEMENTS
    },
    {
      id: "freeCashFlow",
      name: "Free Cash Flow",
      description: "Operating cash flow minus capital expenditures",
      field: "freeCashFlow",
      table: TableName.CASH_FLOW_STATEMENTS
    }
  ]
}
];