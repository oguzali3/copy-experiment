import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, symbol, from, to } = await req.json();
    const apiKey = Deno.env.get("FMP_API_KEY");

    if (!apiKey) {
      throw new Error("FMP_API_KEY is not set");
    }

    let url;
    switch (endpoint) {
      case "dcf":
        url = `https://financialmodelingprep.com/api/v3/discounted-cash-flow/${symbol}?apikey=${apiKey}`;
        console.log('Fetching DCF data from URL:', url);
        const response = await fetch(url);
        const data = await response.json();
        console.log('DCF API response:', data);

        // Return only the most recent data point
        const mostRecentData = Array.isArray(data) ? data[0] : data;
        return new Response(JSON.stringify([mostRecentData]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case "company-news":
        url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=50&apikey=${apiKey}`;
        if (from && to) {
          url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&from=${from}&to=${to}&apikey=${apiKey}`;
        }
        console.log('Fetching news from URL:', url);
        break;

      case "key-metrics-ttm":
        url = `https://financialmodelingprep.com/api/v3/key-metrics-ttm/${symbol}?apikey=${apiKey}`;
        break;
        
      case "key-metrics-historical":
        url = `https://financialmodelingprep.com/api/v3/key-metrics/${symbol}?apikey=${apiKey}`;
        break;

      case "search":
        url = `https://financialmodelingprep.com/api/v3/search?query=${symbol}&limit=10&apikey=${apiKey}`;
        break;

      case "profile":
        url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`;
        break;

      case "quote":
        url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`;
        break;

      case "income-statement":
        url = `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?period=annual&apikey=${apiKey}`;
        console.log('Fetching income statement from URL:', url);
        break;

      case "balance-sheet":
        url = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?period=annual&apikey=${apiKey}`;
        console.log('Fetching balance sheet from URL:', url);
        break;

      case "cash-flow-statement":
        url = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?period=annual&apikey=${apiKey}`;
        console.log('Fetching cash flow statement from URL:', url);
        break;

      default:
        throw new Error(`Invalid endpoint: ${endpoint}`);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})