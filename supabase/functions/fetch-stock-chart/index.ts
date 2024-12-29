import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, timeframe } = await req.json();
    console.log('Request received:', { symbol, timeframe });
    
    if (!symbol) {
      throw new Error('Symbol is required');
    }

    const apiKey = Deno.env.get('FMP_API_KEY');
    if (!apiKey) {
      throw new Error('API key is not configured');
    }

    if (timeframe === '1D') {
      // For 1D, use 5-minute interval intraday data
      const intradayEndpoint = `https://financialmodelingprep.com/api/v3/historical-chart/5min/${symbol}?apikey=${apiKey}`;
      console.log('Fetching intraday data from endpoint:', intradayEndpoint);
      
      const response = await fetch(intradayEndpoint);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw intraday data received, count:', data.length);

      if (!Array.isArray(data)) {
        throw new Error('Invalid intraday data format');
      }

      // Get the most recent trading day's data
      const mostRecentDate = data.length > 0 ? new Date(data[0].date).toISOString().split('T')[0] : null;
      console.log('Most recent trading date:', mostRecentDate);

      // Filter and format intraday data for the most recent trading day
      const chartData = data
        .filter(item => {
          const itemDate = new Date(item.date);
          return itemDate.toISOString().split('T')[0] === mostRecentDate;
        })
        .map(item => ({
          time: item.date,
          price: parseFloat(item.close)
        }))
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

      console.log(`Processed ${chartData.length} intraday data points`);
      
      if (chartData.length === 0) {
        console.log('No intraday data points available, fetching latest quote');
        const quoteEndpoint = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`;
        const quoteResponse = await fetch(quoteEndpoint);
        const quoteData = await quoteResponse.json();
        
        if (Array.isArray(quoteData) && quoteData.length > 0) {
          return new Response(
            JSON.stringify([{
              time: new Date().toISOString(),
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
    } else if (timeframe === '5D') {
      // For 5D, use daily data
      const today = new Date();
      const fiveDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // Get 7 days to ensure we have 5 trading days
      
      const endpoint = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${fiveDaysAgo.toISOString().split('T')[0]}&to=${today.toISOString().split('T')[0]}&apikey=${apiKey}`;
      console.log('Fetching 5D daily data from endpoint:', endpoint);
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Historical data received:', data.historical?.length, 'data points');
      
      if (!data.historical || !Array.isArray(data.historical)) {
        throw new Error('Historical data is not in the expected format');
      }

      // Take only the last 5 trading days
      const chartData = data.historical
        .slice(0, 5)
        .map((item: any) => ({
          time: item.date,
          price: parseFloat(item.close)
        }))
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

      return new Response(
        JSON.stringify(chartData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // For other timeframes, use historical daily data
      const { from, to } = getTimeframeParams(timeframe);
      const endpoint = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${from}&to=${to}&apikey=${apiKey}`;
      console.log('Fetching historical data from endpoint:', endpoint);
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Historical data received:', data.historical?.length, 'data points');
      
      if (!data.historical || !Array.isArray(data.historical)) {
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

// Helper function to get timeframe parameters
const getTimeframeParams = (tf: string) => {
  const today = new Date();
  switch (tf) {
    case '1M':
      return { 
        from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        to: today.toISOString().split('T')[0] 
      };
    case '3M':
      return { 
        from: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        to: today.toISOString().split('T')[0] 
      };
    case '6M':
      return { 
        from: new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        to: today.toISOString().split('T')[0] 
      };
    case 'YTD':
      return { 
        from: new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0], 
        to: today.toISOString().split('T')[0] 
      };
    case '1Y':
      return { 
        from: new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        to: today.toISOString().split('T')[0] 
      };
    case '3Y':
      return { 
        from: new Date(today.getTime() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        to: today.toISOString().split('T')[0] 
      };
    case '5Y':
      return { 
        from: new Date(today.getTime() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        to: today.toISOString().split('T')[0] 
      };
    case 'MAX': {
      const thirtyYearsAgo = new Date(today);
      thirtyYearsAgo.setFullYear(today.getFullYear() - 30);
      return { 
        from: thirtyYearsAgo.toISOString().split('T')[0], 
        to: today.toISOString().split('T')[0] 
      };
    }
    default:
      return { 
        from: today.toISOString().split('T')[0], 
        to: today.toISOString().split('T')[0] 
      };
  }
};