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
    const { symbol, timeframe } = await req.json()
    
    if (!symbol) {
      throw new Error('Symbol is required')
    }

    const apiKey = Deno.env.get('FMP_API_KEY')
    if (!apiKey) {
      throw new Error('API key is not configured')
    }

    // Map timeframe to FMP API parameters
    const getTimeframeParams = (tf: string) => {
      const today = new Date()
      switch (tf) {
        case '5D': return { from: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
        case '1M': return { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
        case '3M': return { from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
        case '6M': return { from: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
        case '1Y': return { from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
        case '3Y': return { from: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
        case '5Y': return { from: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
        case 'MAX': {
          // For MAX, we'll go back 30 years or to company inception, whichever is more recent
          const thirtyYearsAgo = new Date()
          thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30)
          return { from: thirtyYearsAgo.toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
        }
        default: return { from: today.toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
      }
    }

    const { from, to } = getTimeframeParams(timeframe)
    
    const endpoint = timeframe === '1D' 
      ? `https://financialmodelingprep.com/api/v3/historical-chart/5min/${symbol}?apikey=${apiKey}`
      : `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${from}&to=${to}&apikey=${apiKey}`;

    console.log(`Fetching data from: ${endpoint} for timeframe: ${timeframe}`)
    
    const response = await fetch(endpoint)
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    if (!data) {
      throw new Error('No data received from API')
    }

    let chartData = []

    // Handle intraday data (5min intervals)
    if (timeframe === '1D') {
      if (!Array.isArray(data)) {
        console.error('Unexpected data format for intraday data:', data)
        throw new Error('Invalid data format for intraday data')
      }

      chartData = data
        .filter(item => item && item.date && !isNaN(parseFloat(item.close)))
        .map((item: any) => ({
          time: item.date,
          price: parseFloat(item.close)
        }))
    } 
    // Handle historical daily data
    else {
      let historicalData
      
      // Check if data is in the expected format
      if (data.historical && Array.isArray(data.historical)) {
        historicalData = data.historical
      } else if (Array.isArray(data)) {
        historicalData = data
      } else {
        console.error('Unexpected data format:', data)
        throw new Error('Historical data is not in the expected format')
      }

      chartData = historicalData
        .filter(item => item && item.date && !isNaN(parseFloat(item.close)))
        .map((item: any) => ({
          time: item.date,
          price: parseFloat(item.close)
        }))
    }

    // Validate transformed data
    if (!chartData.length) {
      throw new Error('No valid data points after transformation')
    }

    // Sort data chronologically (ascending) - earliest date first
    chartData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

    console.log(`Successfully processed ${chartData.length} data points`)
    console.log('First data point:', chartData[0])
    console.log('Last data point:', chartData[chartData.length - 1])

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
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
})