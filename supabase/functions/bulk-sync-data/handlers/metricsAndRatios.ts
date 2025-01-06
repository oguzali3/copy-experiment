import { corsHeaders } from '../utils/cors';

export async function syncMetricsAndRatios(apiKey: string, supabase: any, period: 'annual' | 'quarter') {
  console.log(`Fetching ${period} metrics and ratios...`);
  
  const metricsUrl = `https://financialmodelingprep.com/api/v4/key-metrics-bulk?period=${period}&apikey=${apiKey}`;
  const ratiosUrl = `https://financialmodelingprep.com/api/v4/ratios-bulk?period=${period}&apikey=${apiKey}`;

  const [metricsResponse, ratiosResponse] = await Promise.all([
    fetch(metricsUrl),
    fetch(ratiosUrl)
  ]);

  const [metricsData, ratiosData] = await Promise.all([
    metricsResponse.json(),
    ratiosResponse.json()
  ]);

  let results = { metrics: 0, ratios: 0 };

  if (Array.isArray(metricsData)) {
    const { error: metricsError } = await supabase
      .from('financial_metrics')
      .upsert(metricsData.map(metric => ({
        symbol: metric.symbol,
        period,
        date: metric.date,
        calendar_year: new Date(metric.date).getFullYear(),
        pe_ratio: metric.peRatio,
        price_to_book: metric.priceToBookRatio,
        debt_to_equity: metric.debtToEquity,
        free_cash_flow_yield: metric.freeCashFlowYield,
        dividend_yield: metric.dividendYield,
        operating_margin: metric.operatingProfitMargin,
        net_margin: metric.netProfitMargin,
        roa: metric.returnOnAssets,
        roe: metric.returnOnEquity
      })));

    if (metricsError) throw metricsError;
    results.metrics = metricsData.length;
  }

  if (Array.isArray(ratiosData)) {
    const { error: ratiosError } = await supabase
      .from('financial_ratios')
      .upsert(ratiosData.map(ratio => ({
        symbol: ratio.symbol,
        period,
        date: ratio.date,
        calendar_year: new Date(ratio.date).getFullYear(),
        gross_margin_ratio: ratio.grossProfitMargin,
        operating_margin_ratio: ratio.operatingProfitMargin,
        net_profit_margin: ratio.netProfitMargin,
        return_on_equity: ratio.returnOnEquity,
        return_on_assets: ratio.returnOnAssets,
        current_ratio: ratio.currentRatio,
        quick_ratio: ratio.quickRatio,
        debt_ratio: ratio.debtRatio,
        debt_equity_ratio: ratio.debtToEquity,
        interest_coverage: ratio.interestCoverage
      })));

    if (ratiosError) throw ratiosError;
    results.ratios = ratiosData.length;
  }

  return results;
}