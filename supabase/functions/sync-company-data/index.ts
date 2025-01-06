import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol } = await req.json();
    const apiKey = Deno.env.get("FMP_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!apiKey || !supabaseUrl || !supabaseKey) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log(`Starting company data sync for symbol: ${symbol}`);

    // Fetch company profile
    const profileUrl = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`;
    const profileResponse = await fetch(profileUrl);
    const profileData = await profileResponse.json();

    if (profileData && Array.isArray(profileData) && profileData.length > 0) {
      const { error: profileError } = await supabase
        .from('company_profiles')
        .upsert([{
          symbol,
          ...profileData[0]
        }]);

      if (profileError) {
        console.error('Error inserting company profile:', profileError);
      }
    }

    // Fetch analyst recommendations
    const recommendationsUrl = `https://financialmodelingprep.com/api/v3/analyst-recommendations/${symbol}?apikey=${apiKey}`;
    const recommendationsResponse = await fetch(recommendationsUrl);
    const recommendationsData = await recommendationsResponse.json();

    if (recommendationsData && Array.isArray(recommendationsData)) {
      const { error: recommendationsError } = await supabase
        .from('analyst_recommendations')
        .upsert(
          recommendationsData.map(rec => ({
            symbol,
            date: rec.date,
            analyst_company: rec.analystCompany,
            analyst_name: rec.analystName,
            recommendation: rec.recommendation,
            previous_recommendation: rec.previousRecommendation,
            action: rec.action,
            target_price: rec.targetPrice,
            previous_target_price: rec.previousTargetPrice
          })),
          { onConflict: 'symbol,date,analyst_company' }
        );

      if (recommendationsError) {
        console.error('Error inserting recommendations:', recommendationsError);
      }
    }

    // Fetch stock peers
    const peersUrl = `https://financialmodelingprep.com/api/v4/stock_peers?symbol=${symbol}&apikey=${apiKey}`;
    const peersResponse = await fetch(peersUrl);
    const peersData = await peersResponse.json();

    if (peersData && Array.isArray(peersData) && peersData.length > 0) {
      const peerRecords = peersData[0].peersList.map((peer: string) => ({
        symbol,
        peer_symbol: peer
      }));

      const { error: peersError } = await supabase
        .from('stock_peers')
        .upsert(peerRecords);

      if (peersError) {
        console.error('Error inserting peers:', peersError);
      }
    }

    // Fetch price targets
    const targetsUrl = `https://financialmodelingprep.com/api/v4/price-target?symbol=${symbol}&apikey=${apiKey}`;
    const targetsResponse = await fetch(targetsUrl);
    const targetsData = await targetsResponse.json();

    if (targetsData && Array.isArray(targetsData) && targetsData.length > 0) {
      const { error: targetsError } = await supabase
        .from('price_targets')
        .upsert([{
          symbol,
          target_low: targetsData[0].targetLow,
          target_mean: targetsData[0].targetMean,
          target_high: targetsData[0].targetHigh,
          target_consensus: targetsData[0].targetConsensus,
          number_of_analysts: targetsData[0].numberOfAnalysts
        }]);

      if (targetsError) {
        console.error('Error inserting price targets:', targetsError);
      }
    }

    return new Response(
      JSON.stringify({ message: 'Company data sync completed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});