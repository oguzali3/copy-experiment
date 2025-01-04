import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  action: 'getPortfolio' | 'createPortfolio' | 'updatePortfolio' | 'deletePortfolio' | 'searchStocks';
  portfolioData?: any;
  portfolioId?: string;
  query?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the request body
    const requestData: RequestBody = await req.json()
    console.log('Received request with data:', requestData)

    switch (requestData.action) {
      case 'searchStocks':
        if (!requestData.query) {
          return new Response(
            JSON.stringify({ error: 'Query parameter is required' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        try {
          const { data: stocks, error } = await supabaseClient
            .from('stocks')
            .select('symbol, name, market_cap, sector, industry')
            .ilike('symbol', `${requestData.query}%`)
            .or(`name.ilike.%${requestData.query}%`)
            .order('market_cap', { ascending: false })
            .limit(10)

          if (error) throw error

          return new Response(
            JSON.stringify({ 
              results: stocks.map(stock => ({
                symbol: stock.symbol,
                name: stock.name,
                sector: stock.sector,
                industry: stock.industry,
                marketCap: stock.market_cap
              }))
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          console.error('Error searching stocks:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to search stocks' }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

      case 'getPortfolio':
        // TODO: Implement get portfolio logic
        return new Response(
          JSON.stringify({ message: 'Get portfolio endpoint ready' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'createPortfolio':
        // TODO: Implement create portfolio logic
        return new Response(
          JSON.stringify({ message: 'Create portfolio endpoint ready' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'updatePortfolio':
        // TODO: Implement update portfolio logic
        return new Response(
          JSON.stringify({ message: 'Update portfolio endpoint ready' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'deletePortfolio':
        // TODO: Implement delete portfolio logic
        return new Response(
          JSON.stringify({ message: 'Delete portfolio endpoint ready' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action specified' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})