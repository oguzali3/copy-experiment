import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const FMP_API_KEY = Deno.env.get('FMP_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { endpoint, symbol } = await req.json()
    let url: string;

    switch (endpoint) {
      case 'actives':
        url = `https://financialmodelingprep.com/api/v3/stock_market/actives?apikey=${FMP_API_KEY}`
        break
      case 'quote':
        url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${FMP_API_KEY}`
        break
      case 'profile':
        url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`
        break
      case 'income-statement':
        url = `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?apikey=${FMP_API_KEY}`
        break
      case 'balance-sheet':
        url = `https://financialmodelingprep.com/api/v3/balance-sheet/${symbol}?apikey=${FMP_API_KEY}`
        break
      case 'cash-flow-statement':
        url = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?apikey=${FMP_API_KEY}`
        break
      default:
        throw new Error(`Unsupported endpoint: ${endpoint}`)
    }

    const response = await fetch(url)
    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    )
  }
})
