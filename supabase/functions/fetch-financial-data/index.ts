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
    // Validate API key
    if (!FMP_API_KEY) {
      console.error('FMP_API_KEY is not configured')
      throw new Error('FMP_API_KEY is not configured')
    }

    const { endpoint, symbol, query } = await req.json()
    console.log('Request received:', { endpoint, symbol, query })

    if (endpoint === 'search' && query) {
      console.log('Searching for:', query)
      // Use search endpoint which returns more comprehensive results
      const searchUrl = `${FMP_BASE_URL}/search?query=${encodeURIComponent(query)}&limit=10&apikey=${FMP_API_KEY}`
      console.log('Search URL:', searchUrl)
      
      const searchResponse = await fetch(searchUrl)
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
      
      console.log('Search results:', searchData)

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
      console.log('Quote URL:', quoteUrl)

      const quoteResponse = await fetch(quoteUrl)
      const quoteText = await quoteResponse.text()
      console.log('Quote API response:', quoteText)
      
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
      console.log('Quote data (as array):', quoteArray)

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

      console.log('Enriched data:', enrichedData)
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
    const response = await fetch(url)
    const responseText = await response.text()
    console.log('API response text:', responseText)
    
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
    
    console.log('API response data:', data)
    
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