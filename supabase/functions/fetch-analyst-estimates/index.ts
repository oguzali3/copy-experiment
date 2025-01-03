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
    
    console.log(`Fetching from: https://financialmodelingprep.com/api/v3/analyst-estimates/${symbol}`);
    
    const response = await fetch(url);
    
    console.log(`API Response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`FMP API responded with status: ${response.status}`);
      throw new Error(`Failed to fetch data from FMP API: ${response.statusText}`);
    }

    const rawData = await response.json();
    console.log('Raw API response:', JSON.stringify(rawData).slice(0, 200) + '...');

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

    // Transform data for chart visualization with proper type checking
    const transformedData = rawData.map((estimate: any) => {
      // Parse numeric values and handle undefined/null cases
      const parseNumeric = (value: any) => {
        if (value === undefined || value === null || value === "") return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
      };

      return {
        period: estimate.date,
        revenue: {
          mean: parseNumeric(estimate.estimatedRevenue),
          high: parseNumeric(estimate.revenueHighEstimate),
          low: parseNumeric(estimate.revenueLowEstimate),
          actual: parseNumeric(estimate.actualRevenue)
        },
        eps: {
          mean: parseNumeric(estimate.estimatedEps),
          high: parseNumeric(estimate.epsHighEstimate),
          low: parseNumeric(estimate.epsLowEstimate),
          actual: parseNumeric(estimate.actualEps)
        },
        ebitda: {
          mean: parseNumeric(estimate.estimatedEbitda),
          high: parseNumeric(estimate.ebitdaHighEstimate),
          low: parseNumeric(estimate.ebitdaLowEstimate),
          actual: parseNumeric(estimate.actualEbitda)
        },
        netIncome: {
          mean: parseNumeric(estimate.estimatedNetIncome),
          high: parseNumeric(estimate.netIncomeHighEstimate),
          low: parseNumeric(estimate.netIncomeLowEstimate),
          actual: parseNumeric(estimate.actualNetIncome)
        }
      };
    });

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