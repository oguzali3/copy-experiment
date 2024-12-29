import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, symbol, from, to, page } = await req.json();
    const apiKey = Deno.env.get("FMP_API_KEY");

    let url;
    switch (endpoint) {
      case "profile":
        url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`;
        break;
      case "quote":
        url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`;
        break;
      case "income-statement":
        url = `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?period=quarter&limit=12&apikey=${apiKey}`;
        break;
      case "balance-sheet":
        url = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?period=quarter&limit=12&apikey=${apiKey}`;
        break;
      case "cash-flow":
        url = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?period=quarter&limit=12&apikey=${apiKey}`;
        break;
      case "company-news":
        url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&page=${page || 1}&from=${from}&to=${to}&apikey=${apiKey}`;
        break;
      default:
        throw new Error("Invalid endpoint");
    }

    console.log(`Fetching data from: ${url}`);
    const response = await fetch(url);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
    });
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});