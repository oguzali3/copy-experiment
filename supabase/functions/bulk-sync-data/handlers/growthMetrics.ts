import { corsHeaders } from '../utils/cors';

export async function syncGrowthMetrics(apiKey: string, supabase: any) {
  console.log('Fetching growth metrics...');
  
  const growthUrls = [
    `https://financialmodelingprep.com/api/v4/income-statement-growth-bulk?apikey=${apiKey}`,
    `https://financialmodelingprep.com/api/v4/balance-sheet-growth-bulk?apikey=${apiKey}`,
    `https://financialmodelingprep.com/api/v4/cash-flow-statement-growth-bulk?apikey=${apiKey}`
  ];

  const growthResponses = await Promise.all(growthUrls.map(url => fetch(url)));
  const [incomeGrowth, balanceGrowth, cashFlowGrowth] = await Promise.all(
    growthResponses.map(response => response.json())
  );

  if (Array.isArray(incomeGrowth)) {
    const { error: growthError } = await supabase
      .from('growth_metrics')
      .upsert(incomeGrowth.map(growth => ({
        symbol: growth.symbol,
        period: 'annual',
        date: growth.date,
        calendar_year: new Date(growth.date).getFullYear(),
        revenue_growth: growth.revenueGrowth,
        gross_profit_growth: growth.grossProfitGrowth,
        ebit_growth: growth.ebitGrowth,
        operating_income_growth: growth.operatingIncomeGrowth,
        net_income_growth: growth.netIncomeGrowth,
        eps_growth: growth.epsgrowth
      })));

    if (growthError) throw growthError;
    return incomeGrowth.length;
  }
  return 0;
}