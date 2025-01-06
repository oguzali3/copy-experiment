export async function syncGrowthMetrics(apiKey: string, supabase: any) {
  console.log('Fetching growth metrics...');
  const statements = ['income-statement', 'balance-sheet', 'cash-flow-statement'];
  const results: Record<string, number> = {};

  for (const statement of statements) {
    const url = `https://financialmodelingprep.com/api/v4/${statement}-growth-bulk?apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (Array.isArray(data)) {
      const { error } = await supabase
        .from('growth_metrics')
        .upsert(data.map(item => ({
          symbol: item.symbol,
          date: item.date,
          calendar_year: new Date(item.date).getFullYear(),
          revenue_growth: item.revenueGrowth,
          gross_profit_growth: item.grossProfitGrowth,
          ebit_growth: item.ebitGrowth,
          operating_income_growth: item.operatingIncomeGrowth,
          net_income_growth: item.netIncomeGrowth,
          eps_growth: item.epsgrowth,
          operating_cash_flow_growth: item.operatingCashFlowGrowth,
          free_cash_flow_growth: item.freeCashFlowGrowth
        })));

      if (error) throw error;
      results[statement] = data.length;
    }
  }

  return results;
}