import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FMP_API_KEY = Deno.env.get('FMP_API_KEY')
const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3'

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function fetchWithRetry(url: string, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url)
      
      // If we hit rate limit, wait and retry
      if (response.status === 429) {
        console.log(`Rate limited, attempt ${i + 1} of ${retries}. Waiting ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        // Exponential backoff
        delay *= 2
        continue
      }
      
      return response
    } catch (error) {
      if (i === retries - 1) throw error
      console.error(`Fetch attempt ${i + 1} failed:`, error)
      await new Promise(resolve => setTimeout(resolve, delay))
      delay *= 2
    }
  }
  throw new Error(`Failed after ${retries} retries`)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!FMP_API_KEY) {
      console.error('FMP_API_KEY is not configured')
      throw new Error('FMP_API_KEY is not configured')
    }

    const { endpoint, symbol, query } = await req.json()
    console.log('Request received:', { endpoint, symbol, query })

    // Generate cache key based on request parameters
    const cacheKey = JSON.stringify({ endpoint, symbol, query })
    const cached = cache.get(cacheKey)
    
    // Return cached data if it's still valid
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Returning cached data for:', cacheKey)
      return new Response(
        JSON.stringify(cached.data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (endpoint === 'search' && query) {
      console.log('Searching for:', query)
      const searchUrl = `${FMP_BASE_URL}/search?query=${encodeURIComponent(query)}&limit=10&apikey=${FMP_API_KEY}`
      console.log('Search URL:', searchUrl)
      
      const searchResponse = await fetchWithRetry(searchUrl)
      const searchText = await searchResponse.text()
      console.log('Search API response:', searchText)
      
      if (!searchResponse.ok) {
        console.error('Search API error:', searchText)
        throw new Error(`Search API failed with status: ${searchResponse.status}`)
      }
      
      let searchData
      try {
        searchData = JSON.parse(searchText)
      } catch (e) {
        console.error('Failed to parse search response:', e)
        throw new Error('Invalid search response format')
      }
      
      // Filter for only NASDAQ and NYSE stocks
      searchData = searchData.filter((item: any) => 
        item.exchangeShortName === 'NASDAQ' || 
        item.exchangeShortName === 'NYSE'
      )

      if (!Array.isArray(searchData) || searchData.length === 0) {
        return new Response(
          JSON.stringify([]),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get quotes for all found symbols
      const symbols = searchData.map((item: any) => item.symbol).join(',')
      const quoteUrl = `${FMP_BASE_URL}/quote/${symbols}?apikey=${FMP_API_KEY}`
      
      const quoteResponse = await fetchWithRetry(quoteUrl)
      const quoteText = await quoteResponse.text()
      
      if (!quoteResponse.ok) {
        console.error('Quote API error:', quoteText)
        throw new Error(`Quote API failed with status: ${quoteResponse.status}`)
      }

      let quoteData
      try {
        quoteData = JSON.parse(quoteText)
      } catch (e) {
        console.error('Failed to parse quote response:', e)
        throw new Error('Invalid quote response format')
      }

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
          description: searchItem.description || `${searchItem.name} is a publicly traded company.`,
        }
      })

      // Cache the results
      cache.set(cacheKey, { data: enrichedData, timestamp: Date.now() })

      return new Response(
        JSON.stringify(enrichedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!symbol) {
      throw new Error('Symbol is required')
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
        throw new Error('Invalid endpoint')
    }

    console.log(`Fetching data from ${url}`)
    const response = await fetchWithRetry(url)
    const responseText = await response.text()
    
    if (!response.ok) {
      console.error('API error:', responseText)
      throw new Error(`API request failed with status: ${response.status}`)
    }
    
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse API response:', e)
      throw new Error('Invalid API response format')
    }
    
    // Cache the results
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