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
    const { endpoint, symbol } = await req.json();
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

      case "search":
        const searchResponse = await fetch(`https://financialmodelingprep.com/api/v3/search?query=${symbol}&limit=10&apikey=${apiKey}`);
        const searchResults = await searchResponse.json();
        return new Response(JSON.stringify(searchResults), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case "profile":
        url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`;
        break;
      case "quote":
        url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`;
        break;
      case "income-statement":
      case "balance-sheet":
      case "cash-flow-statement":
        const ttmUrl = endpoint === 'income-statement' 
          ? `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?period=quarter&limit=4&apikey=${apiKey}`
          : `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?period=quarter&limit=4&apikey=${apiKey}`;
        
        const ttmResponse = await fetch(ttmUrl);
        const ttmData = await ttmResponse.json();
        
        const ttm = endpoint === 'income-statement'
          ? ttmData.reduce((acc: any, quarter: any) => {
              Object.keys(quarter).forEach(key => {
                if (typeof quarter[key] === 'number') {
                  acc[key] = (acc[key] || 0) + quarter[key];
                }
              });
              return acc;
            }, { period: 'TTM', symbol, date: new Date().toISOString() })
          : { ...ttmData[0], period: 'TTM' };

        const annualResponse = await fetch(`https://financialmodelingprep.com/api/v3/${endpoint}/${symbol}?limit=10&apikey=${apiKey}`);
        const annualData = await annualResponse.json();

        const combinedData = [ttm, ...annualData];
        
        return new Response(JSON.stringify(combinedData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

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
