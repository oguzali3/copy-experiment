import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function handleRSSFeed(apiKey: string, symbol?: string, from?: string, to?: string) {
  if (!from || !to) {
    throw new Error("From and to dates are required for RSS feed");
  }

  const url = `https://financialmodelingprep.com/api/v3/rss_feed?page=0&apikey=${apiKey}${symbol ? `&ticker=${symbol}` : ''}`;
  console.log('Fetching RSS feed from URL:', url);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text(); // First get the response as text
    console.log('Raw response:', text.substring(0, 200)); // Log first 200 chars for debugging
    
    const data = JSON.parse(text); // Then parse it as JSON
    
    // Filter by date range
    const filteredData = data.filter((filing: any) => {
      const filingDate = new Date(filing.date);
      return filingDate >= new Date(from) && filingDate <= new Date(to);
    });
    
    console.log('Filtered RSS feed response:', filteredData);
    return filteredData;
  } catch (error) {
    console.error('Error in handleRSSFeed:', error);
    throw error;
  }
}

async function handleTranscriptDates(apiKey: string, symbol: string) {
  const url = `https://financialmodelingprep.com/api/v4/earning_call_transcript?symbol=${symbol}&apikey=${apiKey}`;
  console.log('Fetching transcript dates from URL:', url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

async function handleTranscript(apiKey: string, symbol: string, year: string, quarter: string) {
  if (!year || !quarter) {
    throw new Error("Year and quarter are required for transcript endpoint");
  }
  const url = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${symbol}?year=${year}&quarter=${quarter}&apikey=${apiKey}`;
  console.log('Fetching transcript from URL:', url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

async function handleFinancials(endpoint: string, apiKey: string, symbol: string) {
  let url;
  switch (endpoint) {
    case "profile":
      url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`;
      break;
    case "quote":
      url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`;
      break;
    default:
      throw new Error(`Unsupported financial endpoint: ${endpoint}`);
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
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

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack // Include stack trace for debugging
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})