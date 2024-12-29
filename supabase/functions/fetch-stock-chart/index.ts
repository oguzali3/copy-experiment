import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { symbol, timeframe = '1D' } = await req.json()
    
    if (!symbol) {
      throw new Error('Symbol is required')
    }

    const apiKey = Deno.env.get('FMP_API_KEY')
    if (!apiKey) {
      throw new Error('FMP_API_KEY is not set')
    }

    // Map timeframe to FMP API parameters
    const getTimeframeParams = (tf: string) => {
      switch (tf) {
        case '5D': return { from: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] }
        case '1M': return { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] }
        case '3M': return { from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] }
        case '6M': return { from: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] }
        case '1Y': return { from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] }
        case '3Y': return { from: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] }
        case '5Y': return { from: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] }
        default: return { from: new Date().toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] }
      }
    }

    const { from, to } = getTimeframeParams(timeframe)
    
    let endpoint = timeframe === '1D' 
      ? `https://financialmodelingprep.com/api/v3/historical-chart/5min/${symbol}?apikey=${apiKey}`
      : `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${from}&to=${to}&apikey=${apiKey}`;

    console.log(`Fetching data from: ${endpoint}`)
    
    const response = await fetch(endpoint)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    // Transform the data based on the response format
    const chartData = timeframe === '1D' 
      ? data.map((item: any) => ({
          time: item.date.split(' ')[1],
          price: item.close
        }))
      : data.historical.map((item: any) => ({
          time: item.date,
          price: item.close
        }));

    return new Response(
      JSON.stringify(chartData),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    )
  }
})