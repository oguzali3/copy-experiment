export async function syncMetricsAndRatios(apiKey: string, supabase: any, period: 'annual' | 'quarter') {
  console.log(`Fetching ${period} metrics and ratios...`);
  const results = {
    metrics: 0,
    ratios: 0
  };

  // Sync key metrics
  const metricsUrl = `https://financialmodelingprep.com/api/v4/key-metrics-bulk?period=${period}&apikey=${apiKey}`;
  const metricsResponse = await fetch(metricsUrl);
  const metricsData = await metricsResponse.json();

  if (Array.isArray(metricsData)) {
    const { error: metricsError } = await supabase
      .from('financial_metrics')
      .upsert(metricsData.map(metric => ({
        symbol: metric.symbol,
        period: period,
        date: metric.date,
        calendar_year: new Date(metric.date).getFullYear(),
        pe_ratio: metric.peRatio,
        price_to_book: metric.priceToBookRatio,
        debt_to_equity: metric.debtToEquityRatio,
        free_cash_flow_yield: metric.freeCashFlowYield,
        dividend_yield: metric.dividendYield,
        operating_margin: metric.operatingMargin,
        net_margin: metric.netMargin,
        roa: metric.roa,
        roe: metric.roe
      })));

    if (metricsError) throw metricsError;
    results.metrics = metricsData.length;
  }

  // Sync financial ratios
  const ratiosUrl = `https://financialmodelingprep.com/api/v4/ratios-bulk?period=${period}&apikey=${apiKey}`;
  const ratiosResponse = await fetch(ratiosUrl);
  const ratiosData = await ratiosResponse.json();

  if (Array.isArray(ratiosData)) {
    const { error: ratiosError } = await supabase
      .from('financial_ratios')
      .upsert(ratiosData.map(ratio => ({
        symbol: ratio.symbol,
        period: period,
        date: ratio.date,
        calendar_year: new Date(ratio.date).getFullYear(),
        gross_margin_ratio: ratio.grossMarginRatio,
        operating_margin_ratio: ratio.operatingMarginRatio,
        net_profit_margin: ratio.netProfitMargin,
        return_on_equity: ratio.returnOnEquity,
        return_on_assets: ratio.returnOnAssets,
        current_ratio: ratio.currentRatio,
        quick_ratio: ratio.quickRatio,
        debt_ratio: ratio.debtRatio,
        debt_equity_ratio: ratio.debtToEquityRatio
      })));

    if (ratiosError) throw ratiosError;
    results.ratios = ratiosData.length;
  }

  return results;
}