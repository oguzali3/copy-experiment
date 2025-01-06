import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
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
      console.log('Raw intraday data received, count:', data?.length);

      if (!Array.isArray(data)) {
        console.error('Invalid data format received:', typeof data);
        throw new Error('Invalid intraday data format received from API');
      }

      // Get the most recent trading day's data
      const mostRecentDate = data.length > 0 ? new Date(data[0].date).toISOString().split('T')[0] : null;
      console.log('Most recent trading date:', mostRecentDate);

      // Filter and format intraday data for the most recent trading day
      const chartData = data
        .filter(item => {
          if (!item?.date) return false;
          const itemDate = new Date(item.date);
          return itemDate.toISOString().split('T')[0] === mostRecentDate;
        })
        .map(item => ({
          time: item.date,
          price: parseFloat(item.close) || 0
        }))
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

      console.log(`Processed ${chartData.length} intraday data points`);
      
      if (chartData.length === 0) {
        console.log('No intraday data points available, fetching latest quote');
        const quoteEndpoint = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`;
        const quoteResponse = await fetch(quoteEndpoint);
        
        if (!quoteResponse.ok) {
          throw new Error(`Quote API request failed with status ${quoteResponse.status}`);
        }
        
        const quoteData = await quoteResponse.json();
        
        if (!Array.isArray(quoteData) || quoteData.length === 0) {
          throw new Error('Invalid quote data format received from API');
        }

        return new Response(
          JSON.stringify([{
            time: new Date().toISOString(),
            price: quoteData[0].price || 0
          }]),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

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
        throw new Error(`Historical API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Historical data received:', data?.historical?.length, 'data points');
      
      if (!data?.historical || !Array.isArray(data.historical)) {
        console.error('Invalid historical data format received:', data);
        throw new Error('Invalid historical data format received from API');
      }

      const chartData = data.historical
        .map((item: any) => {
          if (!item?.date || !item?.close) return null;
          return {
            time: item.date,
            price: parseFloat(item.close) || 0
          };
        })
        .filter(item => item !== null)
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

      if (chartData.length === 0) {
        throw new Error('No valid historical data points found');
      }

      return new Response(
        JSON.stringify(chartData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in fetch-stock-chart:', error.message);
    
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