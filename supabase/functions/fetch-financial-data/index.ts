import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { handleFinancialStatements } from './handlers/financialStatements.ts'
import { handlePortfolioOperations } from './handlers/portfolioOperations.ts'
import { handleSearch } from './handlers/search.ts'
import { corsHeaders } from './utils/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('FMP_API_KEY')
    if (!apiKey) {
      throw new Error('API key not found')
    }

    const { endpoint, symbol, tickers, query } = await req.json()

    console.log('Request received for endpoint:', endpoint)
    console.log('Symbol:', symbol)
    console.log('Tickers:', tickers)
    console.log('Query:', query)

    switch (endpoint) {
      case 'portfolio-operations':
        return await handlePortfolioOperations(apiKey, tickers)
      case 'income-statement':
      case 'balance-sheet':
      case 'cash-flow-statement':
        return await handleFinancialStatements(apiKey, endpoint, symbol)
      case 'search':
        return await handleSearch(apiKey, query)
      default:
        throw new Error(`Unsupported endpoint: ${endpoint}`)
    }
  } catch (error) {
    console.error('Error in edge function:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack,
        context: 'Edge function failed'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})