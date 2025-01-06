import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Map of our country names to FMP API country codes
const countryCodeMap: { [key: string]: string } = {
  'United States': 'US',
  'United Kingdom': 'UK',
  'Turkey': 'TR',
  'Japan': 'JP',
  'China': 'CN',
  'Germany': 'DE',
  'India': 'IN',
  'Brazil': 'BR',
  'Australia': 'AU',
  'Canada': 'CA'
};

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

    // Convert country names to codes and add to query
    if (countries?.length > 0) {
      const countryCodes = countries.map(country => countryCodeMap[country] || country);
      queryParams.append('country', countryCodes.join(','));
      console.log('Using country codes:', countryCodes);
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
      if (metric.min !== undefined && metric.min !== '') {
        queryParams.append(`${metric.id}MoreThan`, metric.min)
      }
      if (metric.max !== undefined && metric.max !== '') {
        queryParams.append(`${metric.id}LowerThan`, metric.max)
      }
    })

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