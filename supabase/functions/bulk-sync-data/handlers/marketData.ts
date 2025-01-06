export async function syncMarketData(apiKey: string, supabase: any) {
  console.log('Fetching market data...');
  const results = {
    peers: 0,
    priceTargets: 0,
    recommendations: 0
  };

  // Sync stock peers
  const peersUrl = `https://financialmodelingprep.com/api/v4/stock-peers-bulk?apikey=${apiKey}`;
  const peersResponse = await fetch(peersUrl);
  const peersData = await peersResponse.json();

  if (Array.isArray(peersData)) {
    const { error: peersError } = await supabase
      .from('stock_peers')
      .upsert(peersData.map(peer => ({
        symbol: peer.symbol,
        peer_symbol: peer.peerSymbol
      })));

    if (peersError) throw peersError;
    results.peers = peersData.length;
  }

  // Sync price targets
  const targetsUrl = `https://financialmodelingprep.com/api/v4/price-target-summary-bulk?apikey=${apiKey}`;
  const targetsResponse = await fetch(targetsUrl);
  const targetsData = await targetsResponse.json();

  if (Array.isArray(targetsData)) {
    const { error: targetsError } = await supabase
      .from('price_targets')
      .upsert(targetsData.map(target => ({
        symbol: target.symbol,
        target_consensus: target.targetConsensus,
        target_high: target.targetHigh,
        target_low: target.targetLow,
        target_mean: target.targetMean,
        number_of_analysts: target.numberOfAnalysts
      })));

    if (targetsError) throw targetsError;
    results.priceTargets = targetsData.length;
  }

  // Sync analyst recommendations
  const recommendationsUrl = `https://financialmodelingprep.com/api/v4/upgrades-downgrades-consensus-bulk?apikey=${apiKey}`;
  const recommendationsResponse = await fetch(recommendationsUrl);
  const recommendationsData = await recommendationsResponse.json();

  if (Array.isArray(recommendationsData)) {
    const { error: recommendationsError } = await supabase
      .from('analyst_recommendations')
      .upsert(recommendationsData.map(rec => ({
        symbol: rec.symbol,
        date: rec.date,
        analyst_company: rec.analystCompany,
        analyst_name: rec.analystName,
        recommendation: rec.recommendation,
        previous_recommendation: rec.previousRecommendation,
        action: rec.action,
        target_price: rec.targetPrice,
        previous_target_price: rec.previousTargetPrice
      })));

    if (recommendationsError) throw recommendationsError;
    results.recommendations = recommendationsData.length;
  }

  return results;
}