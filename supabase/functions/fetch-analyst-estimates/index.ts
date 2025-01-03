import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    console.log('Received request for analyst estimates');
    const { symbol } = await req.json();
    
    if (!symbol) {
      console.error('No symbol provided');
      throw new Error("Symbol is required");
    }

    const apiKey = Deno.env.get("FMP_API_KEY");
    if (!apiKey) {
      console.error('FMP_API_KEY not found in environment variables');
      throw new Error("FMP_API_KEY is not set");
    }

    console.log(`Fetching analyst estimates for symbol: ${symbol}`);
    const url = `https://financialmodelingprep.com/api/v3/analyst-estimates/${symbol}?apikey=${apiKey}`;
    
    // Log the URL we're fetching (without the API key)
    console.log(`Fetching from: https://financialmodelingprep.com/api/v3/analyst-estimates/${symbol}`);
    
    const response = await fetch(url);
    
    // Log the response status
    console.log(`API Response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`FMP API responded with status: ${response.status}`);
      throw new Error(`Failed to fetch data from FMP API: ${response.statusText}`);
    }

    const rawData = await response.json();
    console.log('Raw API response:', JSON.stringify(rawData).slice(0, 200) + '...'); // Log first 200 chars of response

    // Check if we got an error message from FMP
    if (Array.isArray(rawData) && rawData.length === 0) {
      console.log('FMP API returned empty array');
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (typeof rawData === 'object' && 'Error Message' in rawData) {
      console.error('FMP API returned error:', rawData);
      throw new Error(rawData['Error Message']);
    }

    // Transform data for chart visualization
    const transformedData = rawData.map((estimate: any) => ({
      period: estimate.date,
      revenue: {
        mean: estimate.estimatedRevenue,
        high: estimate.revenueHighEstimate,
        low: estimate.revenueLowEstimate,
        actual: estimate.actualRevenue
      },
      eps: {
        mean: estimate.estimatedEps,
        high: estimate.epsHighEstimate,
        low: estimate.epsLowEstimate,
        actual: estimate.actualEps
      },
      ebitda: {
        mean: estimate.estimatedEbitda,
        high: estimate.ebitdaHighEstimate,
        low: estimate.ebitdaLowEstimate,
        actual: estimate.actualEbitda
      },
      netIncome: {
        mean: estimate.estimatedNetIncome,
        high: estimate.netIncomeHighEstimate,
        low: estimate.netIncomeLowEstimate,
        actual: estimate.actualNetIncome
      }
    }));

    console.log(`Successfully transformed data. Number of periods: ${transformedData.length}`);
    console.log('First transformed entry:', JSON.stringify(transformedData[0]));

    return new Response(JSON.stringify(transformedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-analyst-estimates:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})