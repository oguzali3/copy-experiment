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

    const rawData = await response.json();
    console.log('Raw API response:', JSON.stringify(rawData).slice(0, 200) + '...');

    if (!Array.isArray(rawData) || rawData.length === 0) {
      console.log('No data returned from API');
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if ('Error Message' in rawData) {
      throw new Error(rawData['Error Message']);
    }

    const transformedData = rawData.map((estimate: any) => {
      // Convert string numbers to actual numbers and handle null/undefined
      const toNumber = (value: any): number | null => {
        if (value === null || value === undefined || value === '') return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
      };

      const date = estimate.date;
      console.log(`Processing estimate for date: ${date}`);
      console.log('Raw estimate data:', estimate);

      return {
        period: date,
        revenue: {
          actual: toNumber(estimate.revenueEstimatedActual),
          mean: toNumber(estimate.revenueEstimated),
          high: toNumber(estimate.revenueEstimatedHighEstimate),
          low: toNumber(estimate.revenueEstimatedLowEstimate)
        },
        eps: {
          actual: toNumber(estimate.epsActual),
          mean: toNumber(estimate.epsEstimated),
          high: toNumber(estimate.epsHighEstimate),
          low: toNumber(estimate.epsLowEstimate)
        },
        ebitda: {
          actual: toNumber(estimate.ebitdaActual),
          mean: toNumber(estimate.ebitdaEstimated),
          high: toNumber(estimate.ebitdaHighEstimate),
          low: toNumber(estimate.ebitdaLowEstimate)
        },
        netIncome: {
          actual: toNumber(estimate.netIncomeActual),
          mean: toNumber(estimate.netIncomeEstimated),
          high: toNumber(estimate.netIncomeHighEstimate),
          low: toNumber(estimate.netIncomeLowEstimate)
        }
      };
    });

    console.log('Transformed data sample:', JSON.stringify(transformedData[0], null, 2));

    return new Response(JSON.stringify(transformedData), {
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