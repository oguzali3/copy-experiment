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

    // Check if market is open (US Eastern Time)
    const isMarketOpen = () => {
      const now = new Date();
      const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const hours = et.getHours();
      const minutes = et.getMinutes();
      const day = et.getDay();
      
      // Market is closed on weekends
      if (day === 0 || day === 6) return false;
      
      // Market is open 9:30 AM - 4:00 PM ET
      const marketTime = hours * 60 + minutes;
      return marketTime >= 9 * 60 + 30 && marketTime < 16 * 60;
    }

    let endpoint;
    if (timeframe === '1D') {
      // For 1D, if market is closed, get the last trading day's data
      if (!isMarketOpen()) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        endpoint = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${yesterdayStr}&to=${yesterdayStr}&apikey=${apiKey}`;
      } else {
        endpoint = `https://financialmodelingprep.com/api/v3/historical-chart/5min/${symbol}?apikey=${apiKey}`;
      }
    } else {
      const { from, to } = getTimeframeParams(timeframe);
      endpoint = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${from}&to=${to}&apikey=${apiKey}`;
    }

    console.log(`Fetching data from endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint)
    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json()
    console.log('Raw API response:', JSON.stringify(data).slice(0, 200) + '...');

    if (!data) {
      console.error('No data received from API');
      throw new Error('No data received from API');
    }

    let chartData = [];

    // Handle intraday data (5min intervals)
    if (timeframe === '1D' && isMarketOpen()) {
      if (!Array.isArray(data)) {
        console.error('Unexpected data format for intraday data:', data);
        throw new Error('Invalid data format for intraday data');
      }

      const today = new Date().toISOString().split('T')[0];
      
      chartData = data
        .filter(item => {
          if (!item || !item.date || isNaN(parseFloat(item.close))) {
            console.log('Filtering out invalid intraday data point:', item);
            return false;
          }
          return item.date.startsWith(today);
        })
        .map((item: any) => ({
          time: item.date,
          price: parseFloat(item.close)
        }));
    } 
    // Handle historical daily data
    else {
      let historicalData;
      
      if (data.historical && Array.isArray(data.historical)) {
        historicalData = data.historical;
      } else if (Array.isArray(data)) {
        historicalData = data;
      } else {
        console.error('Unexpected historical data format:', data);
        throw new Error('Historical data is not in the expected format');
      }

      if (!historicalData || historicalData.length === 0) {
        console.error('No historical data available');
        throw new Error('No historical data available for the selected timeframe');
      }

      chartData = historicalData
        .filter(item => {
          if (!item || !item.date || isNaN(parseFloat(item.close))) {
            console.log('Filtering out invalid historical data point:', item);
            return false;
          }
          return true;
        })
        .map((item: any) => ({
          time: item.date,
          price: parseFloat(item.close)
        }));
    }

    if (!chartData || chartData.length === 0) {
      console.error('No valid data points after transformation');
      throw new Error('No data available for the selected timeframe');
    }

    // Sort data chronologically (ascending) - earliest date first
    chartData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    console.log(`Successfully processed ${chartData.length} data points`);
    console.log('First data point:', chartData[0]);
    console.log('Last data point:', chartData[chartData.length - 1]);

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