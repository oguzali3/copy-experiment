import { corsHeaders } from '../utils/cors';

export async function syncTTMData(apiKey: string, supabase: any) {
  console.log('Fetching TTM data...');
  
  const ttmMetricsUrl = `https://financialmodelingprep.com/api/v4/key-metrics-ttm-bulk?apikey=${apiKey}`;
  const ttmRatiosUrl = `https://financialmodelingprep.com/api/v4/ratios-ttm-bulk?apikey=${apiKey}`;

  const [ttmMetricsResponse, ttmRatiosResponse] = await Promise.all([
    fetch(ttmMetricsUrl),
    fetch(ttmRatiosUrl)
  ]);

  const [ttmMetricsData, ttmRatiosData] = await Promise.all([
    ttmMetricsResponse.json(),
    ttmRatiosResponse.json()
  ]);

  if (Array.isArray(ttmRatiosData)) {
    const { error: ttmRatiosError } = await supabase
      .from('ttm_ratios')
      .upsert(ttmRatiosData.map(ratio => ({
        symbol: ratio.symbol,
        gross_margin_ttm: ratio.grossProfitMarginTTM,
        operating_margin_ttm: ratio.operatingProfitMarginTTM,
        net_profit_margin_ttm: ratio.netProfitMarginTTM,
        return_on_equity_ttm: ratio.returnOnEquityTTM,
        return_on_assets_ttm: ratio.returnOnAssetsTTM,
        pe_ratio_ttm: ratio.priceEarningsRatioTTM,
        price_to_book_ttm: ratio.priceToBookRatioTTM,
        dividend_yield_ttm: ratio.dividendYieldTTM
      })));

    if (ttmRatiosError) throw ttmRatiosError;
    return ttmRatiosData.length;
  }
  return 0;
}