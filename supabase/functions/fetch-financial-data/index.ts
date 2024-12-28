import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FMP_API_KEY = Deno.env.get('FMP_API_KEY')
const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { endpoint, symbol, query } = await req.json()

    if (endpoint === 'search' && query) {
      console.log('Searching for:', query)
      const searchUrl = `${FMP_BASE_URL}/search?query=${encodeURIComponent(query)}&limit=10&apikey=${FMP_API_KEY}`
      
      const searchResponse = await fetch(searchUrl)
      if (!searchResponse.ok) {
        throw new Error(`Search API failed with status: ${searchResponse.status}`)
      }
      
      const searchData = await searchResponse.json()
      console.log('Search results:', searchData)

      if (!Array.isArray(searchData) || searchData.length === 0) {
        return new Response(
          JSON.stringify([]),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get quotes for all found symbols
      const symbols = searchData.map((item: any) => item.symbol).join(',')
      const quoteUrl = `${FMP_BASE_URL}/quote/${symbols}?apikey=${FMP_API_KEY}`
      console.log('Fetching quotes for:', symbols)

      const quoteResponse = await fetch(quoteUrl)
      if (!quoteResponse.ok) {
        throw new Error(`Quote API failed with status: ${quoteResponse.status}`)
      }

      const quoteData = await quoteResponse.json()
      console.log('Quote data:', quoteData)

      // Ensure quoteData is always an array
      const quoteArray = Array.isArray(quoteData) ? quoteData : [quoteData]

      // Merge search and quote data
      const enrichedData = searchData.map((searchItem: any) => {
        const quoteItem = quoteArray.find((q: any) => q?.symbol === searchItem.symbol) || {}
        return {
          name: searchItem.name,
          symbol: searchItem.symbol,
          price: quoteItem.price || 0,
          change: quoteItem.change || 0,
          changesPercentage: quoteItem.changesPercentage || 0,
          marketCap: quoteItem.marketCap || 0,
        }
      })

      console.log('Enriched data:', enrichedData)
      return new Response(
        JSON.stringify(enrichedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    let url: string
    switch (endpoint) {
      case 'quote':
        url = `${FMP_BASE_URL}/quote/${symbol}?apikey=${FMP_API_KEY}`
        break
      case 'profile':
        url = `${FMP_BASE_URL}/profile/${symbol}?apikey=${FMP_API_KEY}`
        break
      case 'income-statement':
        url = `${FMP_BASE_URL}/income-statement/${symbol}?limit=120&apikey=${FMP_API_KEY}`
        break
      case 'balance-sheet':
        url = `${FMP_BASE_URL}/balance-sheet-statement/${symbol}?limit=120&apikey=${FMP_API_KEY}`
        break
      case 'cash-flow':
        url = `${FMP_BASE_URL}/cash-flow-statement/${symbol}?limit=120&apikey=${FMP_API_KEY}`
        break
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid endpoint' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }

    console.log(`Fetching data from ${url}`)
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`)
    }
    
    const data = await response.json()
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in fetch-financial-data function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})