import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
}

// In-memory cache with expiration
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { endpoint, symbol, query } = await req.json()
    const FMP_API_KEY = Deno.env.get('FMP_API_KEY')
    
    if (!FMP_API_KEY) {
      throw new Error('FMP_API_KEY is not configured')
    }

    if (endpoint === 'search' && query) {
      // Generate cache key
      const cacheKey = `search-${query.toLowerCase()}`
      
      // Check cache
      const cachedResult = cache.get(cacheKey)
      if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_DURATION) {
        console.log('Returning cached data for:', query)
        return new Response(
          JSON.stringify(cachedResult.data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Fetching new data for:', query)
      const searchUrl = `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(query)}&limit=10&apikey=${FMP_API_KEY}`
      const searchResponse = await fetch(searchUrl)
      
      if (!searchResponse.ok) {
        throw new Error(`Search API failed with status: ${searchResponse.status}`)
      }
      
      let searchData = await searchResponse.json()
      
      // Filter for only NASDAQ and NYSE stocks
      searchData = searchData.filter((item: any) => 
        item.exchangeShortName === 'NASDAQ' || 
        item.exchangeShortName === 'NYSE'
      )

      if (!Array.isArray(searchData)) {
        return new Response(
          JSON.stringify([]),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get quotes for all found symbols
      const symbols = searchData.map((item: any) => item.symbol).join(',')
      const quoteUrl = `https://financialmodelingprep.com/api/v3/quote/${symbols}?apikey=${FMP_API_KEY}`
      
      const quoteResponse = await fetch(quoteUrl)
      if (!quoteResponse.ok) {
        throw new Error(`Quote API failed with status: ${quoteResponse.status}`)
      }

      const quoteData = await quoteResponse.json()
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
          description: searchItem.description || `${searchItem.name} is a publicly traded company.`,
        }
      })

      // Store in cache
      cache.set(cacheKey, { data: enrichedData, timestamp: Date.now() })

      return new Response(
        JSON.stringify(enrichedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle other endpoints...
    if (!symbol) {
      throw new Error('Symbol is required')
    }

    let url: string
    switch (endpoint) {
      case 'quote':
        url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${FMP_API_KEY}`
        break
      case 'profile':
        url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`
        break
      case 'income-statement':
        url = `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?limit=120&apikey=${FMP_API_KEY}`
        break
      case 'balance-sheet':
        url = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?limit=120&apikey=${FMP_API_KEY}`
        break
      case 'cash-flow':
        url = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?limit=120&apikey=${FMP_API_KEY}`
        break
      default:
        throw new Error('Invalid endpoint')
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`)
    }

    const data = await response.json()
    
    // Store in cache
    cache.set(cacheKey, { data, timestamp: Date.now() })

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
