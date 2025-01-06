import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { corsHeaders } from './utils/cors.ts';
import { syncCompanyProfiles } from './handlers/companyProfiles.ts';
import { syncFinancialStatements } from './handlers/financialStatements.ts';
import { syncMetricsAndRatios } from './handlers/metricsAndRatios.ts';
import { syncTTMData } from './handlers/ttmData.ts';
import { syncGrowthMetrics } from './handlers/growthMetrics.ts';
import { syncMarketData } from './handlers/marketData.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("FMP_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!apiKey || !supabaseUrl || !supabaseKey) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const results: Record<string, any> = {};

    // Sync company profiles
    results.profiles = await syncCompanyProfiles(apiKey, supabase);
    console.log('Completed syncing profiles:', results.profiles);

    // Sync financial statements for both annual and quarterly periods
    const periods = ['annual', 'quarter'] as const;
    for (const period of periods) {
      results[`${period}_statements`] = await syncFinancialStatements(apiKey, supabase, period);
      console.log(`Completed syncing ${period} statements:`, results[`${period}_statements`]);
      
      const metricsResults = await syncMetricsAndRatios(apiKey, supabase, period);
      results[`${period}_metrics`] = metricsResults.metrics;
      results[`${period}_ratios`] = metricsResults.ratios;
      console.log(`Completed syncing ${period} metrics and ratios:`, metricsResults);
    }

    // Sync TTM data
    results.ttm = await syncTTMData(apiKey, supabase);
    console.log('Completed syncing TTM data:', results.ttm);

    // Sync growth metrics
    results.growth = await syncGrowthMetrics(apiKey, supabase);
    console.log('Completed syncing growth metrics:', results.growth);

    // Sync market data (peers, targets, recommendations)
    const marketResults = await syncMarketData(apiKey, supabase);
    results.market = marketResults;
    console.log('Completed syncing market data:', marketResults);

    console.log('Bulk sync completed successfully:', results);
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in bulk sync:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});