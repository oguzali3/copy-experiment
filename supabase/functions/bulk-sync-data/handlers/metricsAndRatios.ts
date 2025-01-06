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
        ...metric
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
        ...ratio
      })));

    if (ratiosError) throw ratiosError;
    results.ratios = ratiosData.length;
  }

  return results;
}