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
    
    let endpoint = timeframe === '1D' 
      ? `https://financialmodelingprep.com/api/v3/historical-chart/5min/${symbol}?apikey=${apiKey}`
      : `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${from}&to=${to}&apikey=${apiKey}`;

    console.log(`Fetching data from: ${endpoint} for timeframe: ${timeframe}`)
    
    const response = await fetch(endpoint)
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('API Response structure:', Object.keys(data))

    // Validate the response data
    if (!data) {
      console.error('No data received from API')
      throw new Error('No data received from API')
    }

    // Transform the data based on the response format
    let chartData
    if (timeframe === '1D') {
      if (!Array.isArray(data)) {
        console.error('Invalid 1D data format:', typeof data)
        throw new Error('Invalid data format for 1D timeframe')
      }
      chartData = data.map((item: any) => ({
        time: item.date.split(' ')[1],
        price: parseFloat(item.close)
      }))
    } else {
      // For historical data, we need to check the structure
      if (!data.historical && !Array.isArray(data)) {
        console.error('Invalid historical data format:', typeof data)
        throw new Error('Invalid data format for historical data')
      }
      
      const historicalData = data.historical || data
      if (!Array.isArray(historicalData)) {
        console.error('Historical data is not an array:', typeof historicalData)
        throw new Error('Historical data is not in the expected format')
      }

      chartData = historicalData
        .filter(item => item && item.date && !isNaN(parseFloat(item.close))) // Filter out invalid entries
        .map((item: any) => ({
          time: item.date,
          price: parseFloat(item.close)
        }))
    }

    // Validate transformed data
    if (!Array.isArray(chartData) || chartData.length === 0) {
      console.error('No valid data points available')
      throw new Error('No data points available for the specified timeframe')
    }

    // Sort data chronologically
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
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    )
  }
})