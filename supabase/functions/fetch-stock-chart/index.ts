import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const FMP_API_KEY = Deno.env.get('FMP_API_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    const { symbol, range } = await req.json()
    const baseUrl = 'https://financialmodelingprep.com/api/v3'
    
    let endpoint = ''
    switch (range) {
      case '1D':
        endpoint = '/historical-chart/5min'
        break
      case '1W':
        endpoint = '/historical-chart/1hour'
        break
      case '1M':
      case '6M':
      case '1Y':
      case '5Y':
        endpoint = '/historical-price-full'
        break
      default:
        throw new Error(`Unsupported range: ${range}`)
    }

    const url = `${baseUrl}${endpoint}/${symbol}?apikey=${FMP_API_KEY}`
    console.log(`Fetching data from: ${url}`)
    
    const response = await fetch(url)
    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})