import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const FMP_API_KEY = Deno.env.get('FMP_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    const { endpoint, symbol, from, to, page } = await req.json()
    const baseUrl = 'https://financialmodelingprep.com/api/v3'
    
    let url = `${baseUrl}`
    
    switch (endpoint) {
      case 'profile':
        url += `/profile/${symbol}?apikey=${FMP_API_KEY}`
        break
      case 'quote':
        url += `/quote/${symbol}?apikey=${FMP_API_KEY}`
        break
      case 'income-statement':
        url += `/income-statement/${symbol}?apikey=${FMP_API_KEY}&limit=120`
        break
      case 'company-news':
        url += `/stock_news?tickers=${symbol}&limit=50&apikey=${FMP_API_KEY}`
        if (from && to) {
          url += `&from=${from}&to=${to}`
        }
        break
      default:
        throw new Error(`Unsupported endpoint: ${endpoint}`)
    }

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