import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { countries, industries, exchanges, metrics } = await req.json()
    console.log('Received filters:', { countries, industries, exchanges, metrics });

    const apiKey = Deno.env.get('FMP_API_KEY')
    if (!apiKey) {
      throw new Error('FMP API key not configured')
    }

    // Build query parameters
    const queryParams = new URLSearchParams()
    queryParams.append('apikey', apiKey)

    // Add countries if they exist
    if (countries?.length > 0) {
      queryParams.append('country', countries.join(','));
      console.log('Using countries:', countries);
    }

    // Add industries if they exist
    if (industries?.length > 0) {
      queryParams.append('industry', industries.join(','))
    }

    // Add exchanges if they exist
    if (exchanges?.length > 0) {
      queryParams.append('exchange', exchanges.join(','))
    }

    // Add metric filters with min/max values
    metrics?.forEach((metric: any) => {
      const { id, min, max } = metric;
      if (min !== undefined && min !== '') {
        switch(id) {
          case 'marketCap':
            queryParams.append('marketCapMoreThan', min);
            break;
          case 'price':
            queryParams.append('priceMoreThan', min);
            break;
          case 'volume':
            queryParams.append('volumeMoreThan', min);
            break;
          case 'beta':
            queryParams.append('betaMoreThan', min);
            break;
          case 'dividendYield':
            queryParams.append('dividendMoreThan', min);
            break;
        }
      }
      if (max !== undefined && max !== '') {
        switch(id) {
          case 'marketCap':
            queryParams.append('marketCapLowerThan', max);
            break;
          case 'price':
            queryParams.append('priceLowerThan', max);
            break;
          case 'volume':
            queryParams.append('volumeLowerThan', max);
            break;
          case 'beta':
            queryParams.append('betaLowerThan', max);
            break;
          case 'dividendYield':
            queryParams.append('dividendLowerThan', max);
            break;
        }
      }
    });

    console.log('Fetching from FMP with params:', queryParams.toString());

    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/stock-screener?${queryParams}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`FMP API responded with status ${response.status}`)
    }

    const data = await response.json()
    console.log('FMP API response received, count:', data.length);

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in fetch-screener-results:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})