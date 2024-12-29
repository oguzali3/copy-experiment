import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

const app = new Application();

app.post("/", async (req) => {
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
    }

    if (!url) {
      return new Response(JSON.stringify({ error: "Invalid endpoint" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const response = await fetch(url);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

serve(app.fetch);