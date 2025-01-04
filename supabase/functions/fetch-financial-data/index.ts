import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, createResponse } from './utils.ts';
import { handleRSSFeed } from './handlers/rss.ts';
import { handleTranscript, handleTranscriptDates } from './handlers/transcripts.ts';
import { handleFinancials } from './handlers/financials.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { endpoint, symbol, year, quarter, from, to } = await req.json();
    const apiKey = Deno.env.get("FMP_API_KEY");

    if (!apiKey) {
      throw new Error("FMP_API_KEY is not set");
    }

    console.log('Received request with params:', { endpoint, symbol, from, to, year, quarter });

    let data;
    switch (endpoint) {
      case "rss-feed":
        data = await handleRSSFeed(apiKey, symbol, from, to);
        break;
      case "transcript-dates":
        data = await handleTranscriptDates(apiKey, symbol);
        break;
      case "transcript":
        data = await handleTranscript(apiKey, symbol, year, quarter);
        break;
      case "profile":
      case "quote":
        data = await handleFinancials(endpoint, apiKey, symbol);
        break;
      default:
        throw new Error(`Unsupported endpoint: ${endpoint}`);
    }

    return createResponse(data);
  } catch (error) {
    console.error('Error:', error.message);
    return createResponse({ error: error.message }, 500);
  }
})