import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScreenerParams {
  countries?: string[];
  industries?: string[];
  exchanges?: string[];
  metrics?: {
    id: string;
    min?: string;
    max?: string;
  }[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { countries, industries, exchanges, metrics } = await req.json() as ScreenerParams;
    console.log('Received params:', { countries, industries, exchanges, metrics });

    // Construct FMP API query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('apikey', Deno.env.get('FMP_API_KEY') || '');

    // Add filters
    if (countries?.length) {
      queryParams.append('country', countries.join(','));
    }
    if (industries?.length) {
      queryParams.append('sector', industries.join(','));
    }
    if (exchanges?.length) {
      queryParams.append('exchange', exchanges.join(','));
    }

    // Add metric filters
    metrics?.forEach(metric => {
      if (metric.min) {
        queryParams.append(`${metric.id}MoreThan`, metric.min);
      }
      if (metric.max) {
        queryParams.append(`${metric.id}LowerThan`, metric.max);
      }
    });

    console.log('FMP API URL:', `https://financialmodelingprep.com/api/v3/stock-screener?${queryParams.toString()}`);

    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/stock-screener?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error(`FMP API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('FMP API Response:', data);

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Error in fetch-screener-results:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    );
  }
})