import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FMP_API_KEY = Deno.env.get('FMP_API_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { endpoint, symbol, from, to } = await req.json()
    console.log(`Processing request for endpoint: ${endpoint}, symbol: ${symbol}`)

    // Validate required parameters
    if (!endpoint || !symbol) {
      console.error('Missing required parameters')
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Map frontend endpoints to FMP API endpoints
    const endpointMap: Record<string, string> = {
      'profile': 'profile',
      'quote': 'quote',
      'income-statement': 'income-statement',
      'balance-sheet': 'balance-sheet',
      'cash-flow-statement': 'cash-flow-statement',
      'key-metrics': 'key-metrics',
      'key-metrics-ttm': 'key-metrics-ttm',
      'key-metrics-historical': 'key-metrics',
      'dcf': 'dcf',
      'company-news': 'stock_news'
    }

    const fmpEndpoint = endpointMap[endpoint]
    if (!fmpEndpoint) {
      console.error(`Invalid endpoint requested: ${endpoint}`)
      return new Response(
        JSON.stringify({ error: 'Invalid endpoint', validEndpoints: Object.keys(endpointMap) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Construct the URL based on the endpoint
    let url = `https://financialmodelingprep.com/api/v3/${fmpEndpoint}/${symbol}?apikey=${FMP_API_KEY}`
    
    // Add date parameters for company news endpoint
    if (endpoint === 'company-news' && from && to) {
      url = `https://financialmodelingprep.com/api/v3/${fmpEndpoint}?tickers=${symbol}&limit=50&from=${from}&to=${to}&apikey=${FMP_API_KEY}`
    }
    
    console.log(`Fetching data from FMP API: ${url}`)

    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      console.error(`FMP API error: ${response.status} ${response.statusText}`)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch data from FMP API', details: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      )
    }

    console.log(`Successfully fetched data for ${endpoint}`)
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})