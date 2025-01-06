import { corsHeaders } from '../utils/cors';

export async function syncMarketData(apiKey: string, supabase: any) {
  console.log('Fetching market data...');
  
  const peersUrl = `https://financialmodelingprep.com/api/v4/stock-peers-bulk?apikey=${apiKey}`;
  const targetsUrl = `https://financialmodelingprep.com/api/v4/price-target-summary-bulk?apikey=${apiKey}`;
  const recommendationsUrl = `https://financialmodelingprep.com/api/v4/upgrades-downgrades-consensus-bulk?apikey=${apiKey}`;

  const [peersResponse, targetsResponse, recommendationsResponse] = await Promise.all([
    fetch(peersUrl),
    fetch(targetsUrl),
    fetch(recommendationsUrl)
  ]);

  const [peersData, targetsData, recommendationsData] = await Promise.all([
    peersResponse.json(),
    targetsResponse.json(),
    recommendationsResponse.json()
  ]);

  let results = { peers: 0, targets: 0, recommendations: 0 };

  if (Array.isArray(peersData)) {
    const peerRecords = peersData.flatMap(item => 
      item.peersList.map((peer: string) => ({
        symbol: item.symbol,
        peer_symbol: peer
      }))
    );

    const { error: peersError } = await supabase
      .from('stock_peers')
      .upsert(peerRecords);

    if (peersError) throw peersError;
    results.peers = peerRecords.length;
  }

  if (Array.isArray(targetsData)) {
    const { error: targetsError } = await supabase
      .from('price_targets')
      .upsert(targetsData.map(target => ({
        symbol: target.symbol,
        target_low: target.targetLow,
        target_mean: target.targetMean,
        target_high: target.targetHigh,
        target_consensus: target.targetConsensus,
        number_of_analysts: target.numberOfAnalysts
      })));

    if (targetsError) throw targetsError;
    results.targets = targetsData.length;
  }

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