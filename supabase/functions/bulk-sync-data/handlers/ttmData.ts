export async function syncTTMData(apiKey: string, supabase: any) {
  console.log('Fetching TTM data...');
  const results = {
    metrics: 0,
    ratios: 0
  };

  // Sync TTM metrics
  const metricsUrl = `https://financialmodelingprep.com/api/v4/key-metrics-ttm-bulk?apikey=${apiKey}`;
  const metricsResponse = await fetch(metricsUrl);
  const metricsData = await metricsResponse.json();

  if (Array.isArray(metricsData)) {
    const { error: metricsError } = await supabase
      .from('ttm_ratios')
      .upsert(metricsData.map(metric => ({
        symbol: metric.symbol,
        gross_margin_ttm: metric.grossMarginTTM,
        operating_margin_ttm: metric.operatingMarginTTM,
        net_profit_margin_ttm: metric.netProfitMarginTTM,
        return_on_equity_ttm: metric.returnOnEquityTTM,
        return_on_assets_ttm: metric.returnOnAssetsTTM
      })));

    if (metricsError) throw metricsError;
    results.metrics = metricsData.length;
  }

  // Sync TTM ratios
  const ratiosUrl = `https://financialmodelingprep.com/api/v4/ratios-ttm-bulk?apikey=${apiKey}`;
  const ratiosResponse = await fetch(ratiosUrl);
  const ratiosData = await ratiosResponse.json();

  if (Array.isArray(ratiosData)) {
    const { error: ratiosError } = await supabase
      .from('ttm_ratios')
      .upsert(ratiosData.map(ratio => ({
        symbol: ratio.symbol,
        pe_ratio_ttm: ratio.peRatioTTM,
        price_to_book_ttm: ratio.priceToBookTTM,
        price_to_sales_ttm: ratio.priceToSalesTTM,
        ev_to_ebitda_ttm: ratio.evToEbitdaTTM,
        dividend_yield_ttm: ratio.dividendYieldTTM
      })));

    if (ratiosError) throw ratiosError;
    results.ratios = ratiosData.length;
  }

  return results;
}