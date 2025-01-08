import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const FMP_API_KEY = Deno.env.get('FMP_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { endpoint, symbol, from, to, page } = await req.json()
    let url: string;

    console.log(`Processing request for endpoint: ${endpoint}, symbol: ${symbol}`)

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
        url = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?apikey=${FMP_API_KEY}`
        break
      case 'cash-flow-statement':
        url = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?apikey=${FMP_API_KEY}`
        break
      case 'insider-trades':
        url = `https://financialmodelingprep.com/api/v4/insider-trading?symbol=${symbol}&apikey=${FMP_API_KEY}`
        break
      case 'institutional-holders':
        url = `https://financialmodelingprep.com/api/v3/institutional-holder/${symbol}?apikey=${FMP_API_KEY}`
        break
      case 'company-news':
        if (!from || !to) {
          throw new Error('From and to dates are required for company news endpoint')
        }
        url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&from=${from}&to=${to}&apikey=${FMP_API_KEY}`
        break
      default:
        throw new Error(`Unsupported endpoint: ${endpoint}`)
    }

    console.log(`Fetching data from: ${url}`)
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`Successfully fetched data for ${endpoint}`)

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error) {
    console.error(`Error in fetch-financial-data:`, error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    )
  }
})