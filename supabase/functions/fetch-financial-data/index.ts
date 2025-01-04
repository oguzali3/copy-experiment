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
    const { endpoint, symbol, period = 'annual', limit = 5, query } = await req.json()
    console.log(`Processing request for endpoint: ${endpoint}, symbol: ${symbol}`)

    // Search companies
    if (endpoint === 'search') {
      const searchUrl = `https://financialmodelingprep.com/api/v3/search?query=${query}&limit=10&apikey=${FMP_API_KEY}`
      const response = await fetch(searchUrl)
      const data = await response.json()
      
      console.log(`Search results for "${query}":`, data.length, 'companies found')
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch company profile
    if (endpoint === 'profile') {
      const url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`
      const response = await fetch(url)
      const data = await response.json()
      
      console.log(`Fetched profile for ${symbol}:`, data)
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch company quote
    if (endpoint === 'quote') {
      const url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${FMP_API_KEY}`
      const response = await fetch(url)
      const data = await response.json()
      
      console.log(`Fetched quote for ${symbol}:`, data)
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch financial statements
    const validEndpoints = ['income-statement', 'balance-sheet-statement', 'cash-flow-statement'];
    if (validEndpoints.includes(endpoint)) {
      const periodParam = period === 'quarter' ? 'quarter' : 'annual'
      const url = `https://financialmodelingprep.com/api/v3/${endpoint}/${symbol}?period=${periodParam}&limit=${limit}&apikey=${FMP_API_KEY}`
      
      console.log(`Fetching ${endpoint} data for ${symbol} with period ${periodParam}`)
      const response = await fetch(url)
      const data = await response.json()
      
      console.log(`Fetched ${endpoint} for ${symbol} (${periodParam}):`, data.length, 'periods')
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch key metrics
    if (endpoint === 'key-metrics') {
      const url = `https://financialmodelingprep.com/api/v3/key-metrics/${symbol}?limit=${limit}&apikey=${FMP_API_KEY}`
      const response = await fetch(url)
      const data = await response.json()
      
      console.log(`Fetched key metrics for ${symbol}:`, data.length, 'periods')
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch financial growth
    if (endpoint === 'financial-growth') {
      const url = `https://financialmodelingprep.com/api/v3/financial-growth/${symbol}?apikey=${FMP_API_KEY}`
      const response = await fetch(url)
      const data = await response.json()
      
      console.log(`Fetched financial growth for ${symbol}:`, data.length, 'periods')
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.error('Invalid endpoint requested:', endpoint)
    return new Response(
      JSON.stringify({ error: 'Invalid endpoint', requested: endpoint, validEndpoints: [...validEndpoints, 'search', 'profile', 'quote', 'key-metrics', 'financial-growth'] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})