import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { symbol } = await req.json();
    
    if (!symbol) {
      throw new Error("Symbol is required");
    }

    const apiKey = Deno.env.get("FMP_API_KEY");
    if (!apiKey) {
      throw new Error("FMP_API_KEY is not set");
    }

    console.log(`Fetching analyst estimates for symbol: ${symbol}`);
    const url = `https://financialmodelingprep.com/api/v3/analyst-estimates/${symbol}?apikey=${apiKey}`;
    
    const response = await fetch(url);
    console.log(`API Response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data from FMP API: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw API response:', JSON.stringify(data).slice(0, 200) + '...');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-analyst-estimates:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})