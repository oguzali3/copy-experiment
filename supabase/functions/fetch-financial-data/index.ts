import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FMP_API_KEY = Deno.env.get('FMP_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { endpoint, symbol, query } = await req.json()

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

    // Fetch financial statements
    if (endpoint === 'income-statement' || endpoint === 'balance-sheet-statement' || endpoint === 'cash-flow-statement') {
      const url = `https://financialmodelingprep.com/api/v3/${endpoint}/${symbol}?period=annual&limit=5&apikey=${FMP_API_KEY}`
      const response = await fetch(url)
      const data = await response.json()
      
      console.log(`Fetched ${endpoint} for ${symbol}:`, data.length, 'periods')
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch key metrics
    if (endpoint === 'key-metrics') {
      const url = `https://financialmodelingprep.com/api/v3/key-metrics/${symbol}?limit=5&apikey=${FMP_API_KEY}`
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

    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
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