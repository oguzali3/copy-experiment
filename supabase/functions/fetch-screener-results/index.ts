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
    const { 
      countries, 
      industries, 
      exchanges,
      marketCapMoreThan,
      marketCapLowerThan,
      priceMoreThan,
      priceLowerThan,
      betaMoreThan,
      betaLowerThan,
      volumeMoreThan,
      volumeLowerThan,
      dividendMoreThan,
      dividendLowerThan
    } = await req.json()

    console.log('Received filters:', { 
      countries, 
      industries, 
      exchanges,
      marketCapMoreThan,
      marketCapLowerThan,
      priceMoreThan,
      priceLowerThan,
      betaMoreThan,
      betaLowerThan,
      volumeMoreThan,
      volumeLowerThan,
      dividendMoreThan,
      dividendLowerThan
    });

    const apiKey = Deno.env.get('FMP_API_KEY')
    if (!apiKey) {
      throw new Error('FMP API key not configured')
    }

    // Build query parameters
    const queryParams = new URLSearchParams()
    queryParams.append('apikey', apiKey)

    // Add basic filters
    if (countries?.length > 0) {
      queryParams.append('country', countries.join(','))
    }
    if (industries?.length > 0) {
      queryParams.append('industry', industries.join(','))
    }
    if (exchanges?.length > 0) {
      queryParams.append('exchange', exchanges.join(','))
    }

    // Add metric filters
    if (marketCapMoreThan) queryParams.append('marketCapMoreThan', marketCapMoreThan)
    if (marketCapLowerThan) queryParams.append('marketCapLowerThan', marketCapLowerThan)
    if (priceMoreThan) queryParams.append('priceMoreThan', priceMoreThan)
    if (priceLowerThan) queryParams.append('priceLowerThan', priceLowerThan)
    if (betaMoreThan) queryParams.append('betaMoreThan', betaMoreThan)
    if (betaLowerThan) queryParams.append('betaLowerThan', betaLowerThan)
    if (volumeMoreThan) queryParams.append('volumeMoreThan', volumeMoreThan)
    if (volumeLowerThan) queryParams.append('volumeLowerThan', volumeLowerThan)
    if (dividendMoreThan) queryParams.append('dividendMoreThan', dividendMoreThan)
    if (dividendLowerThan) queryParams.append('dividendLowerThan', dividendLowerThan)

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