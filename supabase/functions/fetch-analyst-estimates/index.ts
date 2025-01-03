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
    const apiKey = Deno.env.get("FMP_API_KEY");

    if (!apiKey) {
      throw new Error("FMP_API_KEY is not set");
    }

    const url = `https://financialmodelingprep.com/api/v3/analyst-estimates/${symbol}?apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    // Transform data for chart visualization
    const transformedData = data.map((estimate: any) => ({
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

    return new Response(JSON.stringify(transformedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})