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
    const { endpoint, symbol, period = 'annual', limit = 10 } = await req.json()
    
    // Construct the API URL based on the endpoint
    const baseUrl = 'https://financialmodelingprep.com/api/v3'
    let url = ''

    switch (endpoint) {
      case 'income-statement':
        url = `${baseUrl}/income-statement/${symbol}?period=${period}&limit=${limit}&apikey=${FMP_API_KEY}`
        break
      case 'balance-sheet-statement':
        url = `${baseUrl}/balance-sheet-statement/${symbol}?period=${period}&limit=${limit}&apikey=${FMP_API_KEY}`
        break
      case 'cash-flow-statement':
        url = `${baseUrl}/cash-flow-statement/${symbol}?period=${period}&limit=${limit}&apikey=${FMP_API_KEY}`
        break
      default:
        throw new Error('Invalid endpoint')
    }

    console.log(`Fetching ${endpoint} data for ${symbol} (${period}):`, url)
    
    const response = await fetch(url)
    const data = await response.json()
    
    console.log(`Received ${data.length} records for ${symbol}`)

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})