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
    console.log(`Starting sync for symbol: ${symbol}`);

    // Fetch financial statements
    const statementsUrl = `https://financialmodelingprep.com/api/v3/financial-statements/${symbol}?apikey=${apiKey}`;
    const statementsResponse = await fetch(statementsUrl);
    const statementsData = await statementsResponse.json();

    // Insert financial statements
    if (statementsData && Array.isArray(statementsData)) {
      const { error: statementsError } = await supabase
        .from('financial_statements')
        .upsert(
          statementsData.map(statement => ({
            symbol,
            period: statement.period,
            date: statement.date,
            calendar_year: new Date(statement.date).getFullYear(),
            ...statement
          })),
          { onConflict: 'symbol,period,date' }
        );

      if (statementsError) {
        console.error('Error inserting statements:', statementsError);
      }
    }

    // Fetch financial ratios
    const ratiosUrl = `https://financialmodelingprep.com/api/v3/ratios/${symbol}?apikey=${apiKey}`;
    const ratiosResponse = await fetch(ratiosUrl);
    const ratiosData = await ratiosResponse.json();

    // Insert financial ratios
    if (ratiosData && Array.isArray(ratiosData)) {
      const { error: ratiosError } = await supabase
        .from('financial_ratios')
        .upsert(
          ratiosData.map(ratio => ({
            symbol,
            period: 'annual',
            date: ratio.date,
            calendar_year: new Date(ratio.date).getFullYear(),
            ...ratio
          })),
          { onConflict: 'symbol,period,date' }
        );

      if (ratiosError) {
        console.error('Error inserting ratios:', ratiosError);
      }
    }

    // Fetch TTM ratios
    const ttmUrl = `https://financialmodelingprep.com/api/v3/ratios-ttm/${symbol}?apikey=${apiKey}`;
    const ttmResponse = await fetch(ttmUrl);
    const ttmData = await ttmResponse.json();

    if (ttmData && Array.isArray(ttmData) && ttmData.length > 0) {
      const { error: ttmError } = await supabase
        .from('ttm_ratios')
        .upsert([{
          symbol,
          ...ttmData[0]
        }]);

      if (ttmError) {
        console.error('Error inserting TTM ratios:', ttmError);
      }
    }

    // Fetch growth metrics
    const growthUrl = `https://financialmodelingprep.com/api/v3/financial-growth/${symbol}?apikey=${apiKey}`;
    const growthResponse = await fetch(growthUrl);
    const growthData = await growthResponse.json();

    if (growthData && Array.isArray(growthData)) {
      const { error: growthError } = await supabase
        .from('growth_metrics')
        .upsert(
          growthData.map(growth => ({
            symbol,
            period: 'annual',
            date: growth.date,
            calendar_year: new Date(growth.date).getFullYear(),
            ...growth
          })),
          { onConflict: 'symbol,period,date' }
        );

      if (growthError) {
        console.error('Error inserting growth metrics:', growthError);
      }
    }

    return new Response(
      JSON.stringify({ message: 'Financial data sync completed' }),
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