import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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
        case 'YTD': {
          const startOfYear = new Date(today.getFullYear(), 0, 1)
          return { from: startOfYear.toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
        }
        case '1Y': return { from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
        case '3Y': return { from: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
        case '5Y': return { from: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
        case 'MAX': {
          const thirtyYearsAgo = new Date()
          thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30)
          return { from: thirtyYearsAgo.toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
        }
        default: return { from: today.toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
      }
    }

    if (timeframe === '1D') {
      // For 1D, use 5-minute interval intraday data
      const intradayEndpoint = `https://financialmodelingprep.com/api/v3/historical-chart/5min/${symbol}?apikey=${apiKey}`;
      console.log('Fetching intraday data with 5-minute intervals');
      
      const response = await fetch(intradayEndpoint);
      if (!response.ok) {
        console.error(`API request failed with status ${response.status}`);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error('Unexpected intraday data format:', data);
        throw new Error('Invalid intraday data format');
      }

      // Get today's date in EST (market's timezone)
      const now = new Date();
      const marketOpen = new Date(now);
      marketOpen.setHours(9, 30, 0, 0);
      const marketClose = new Date(now);
      marketClose.setHours(16, 0, 0, 0);

      // Filter data for today's market hours and format it
      const chartData = data
        .filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= marketOpen && itemDate <= marketClose;
        })
        .map(item => ({
          time: item.date,
          price: parseFloat(item.close)
        }))
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

      console.log(`Processed ${chartData.length} intraday data points`);
      
      if (chartData.length === 0) {
        console.log('No intraday data points available, fetching latest quote');
        // If no intraday data, use current quote
        const quoteEndpoint = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`;
        const quoteResponse = await fetch(quoteEndpoint);
        const quoteData = await quoteResponse.json();
        
        if (Array.isArray(quoteData) && quoteData.length > 0) {
          return new Response(
            JSON.stringify([{
              time: now.toISOString(),
              price: quoteData[0].price
            }]),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify(chartData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // For other timeframes, use historical daily data
      const { from, to } = getTimeframeParams(timeframe);
      const endpoint = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${from}&to=${to}&apikey=${apiKey}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.historical || !Array.isArray(data.historical)) {
        console.error('Unexpected historical data format:', data);
        throw new Error('Historical data is not in the expected format');
      }

      const chartData = data.historical
        .map((item: any) => ({
          time: item.date,
          price: parseFloat(item.close)
        }))
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

      return new Response(
        JSON.stringify(chartData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error:', error.message);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Please try again later or contact support if the issue persists'
      }),
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