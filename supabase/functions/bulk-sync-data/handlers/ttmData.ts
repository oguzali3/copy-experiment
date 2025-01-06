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
        ...metric
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
        ...ratio
      })));

    if (ratiosError) throw ratiosError;
    results.ratios = ratiosData.length;
  }

  return results;
}