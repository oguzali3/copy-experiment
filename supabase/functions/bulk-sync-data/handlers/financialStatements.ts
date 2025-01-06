import { corsHeaders } from '../utils/cors';

export async function syncFinancialStatements(apiKey: string, supabase: any, period: 'annual' | 'quarter') {
  console.log(`Fetching ${period} financial statements...`);
  
  const incomeUrl = `https://financialmodelingprep.com/api/v4/income-statement-bulk?period=${period}&apikey=${apiKey}`;
  const balanceSheetUrl = `https://financialmodelingprep.com/api/v4/balance-sheet-statement-bulk?period=${period}&apikey=${apiKey}`;
  const cashFlowUrl = `https://financialmodelingprep.com/api/v4/cash-flow-statement-bulk?period=${period}&apikey=${apiKey}`;

  const [incomeResponse, balanceSheetResponse, cashFlowResponse] = await Promise.all([
    fetch(incomeUrl),
    fetch(balanceSheetUrl),
    fetch(cashFlowUrl)
  ]);

  const [incomeData, balanceSheetData, cashFlowData] = await Promise.all([
    incomeResponse.json(),
    balanceSheetResponse.json(),
    cashFlowResponse.json()
  ]);

  const balanceSheetsMap = new Map(
    balanceSheetData.map((bs: any) => [`${bs.symbol}-${bs.date}`, bs])
  );
  const cashFlowsMap = new Map(
    cashFlowData.map((cf: any) => [`${cf.symbol}-${cf.date}`, cf])
  );

  const financialStatements = incomeData.map((income: any) => {
    const key = `${income.symbol}-${income.date}`;
    const balanceSheet = balanceSheetsMap.get(key);
    const cashFlow = cashFlowsMap.get(key);

    return {
      symbol: income.symbol,
      period,
      date: income.date,
      calendar_year: new Date(income.date).getFullYear(),
      revenue: income.revenue,
      cost_of_revenue: income.costOfRevenue,
      gross_profit: income.grossProfit,
      operating_expenses: income.operatingExpenses,
      operating_income: income.operatingIncome,
      net_income: income.netIncome,
      total_assets: balanceSheet?.totalAssets,
      total_liabilities: balanceSheet?.totalLiabilities,
      total_equity: balanceSheet?.totalStockholdersEquity,
      cash_and_equivalents: balanceSheet?.cashAndCashEquivalents,
      short_term_investments: balanceSheet?.shortTermInvestments,
      net_receivables: balanceSheet?.netReceivables,
      inventory: balanceSheet?.inventory,
      operating_cash_flow: cashFlow?.operatingCashFlow,
      capital_expenditure: cashFlow?.capitalExpenditure,
      free_cash_flow: cashFlow?.freeCashFlow,
      dividend_payments: cashFlow?.dividendsPaid,
      stock_repurchase: cashFlow?.commonStockRepurchased
    };
  });

  const { error: statementsError } = await supabase
    .from('financial_statements')
    .upsert(financialStatements);

  if (statementsError) throw statementsError;
  return financialStatements.length;
}