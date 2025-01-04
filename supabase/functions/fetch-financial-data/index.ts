import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from './utils/cors.ts';
import { handleSecFilings } from './handlers/secFilings.ts';
import { handleCompanyNews } from './handlers/companyNews.ts';
import { handleFinancialStatements } from './handlers/financialStatements.ts';
import { handleInsiderTrades } from './handlers/insiderTrades.ts';
import { handleInstitutionalHolders } from './handlers/institutionalHolders.ts';
import { handlePortfolioOperations } from './handlers/portfolioOperations.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { endpoint, symbol, type, from, to, query, year, quarter, tickers } = await req.json();
    const apiKey = Deno.env.get("FMP_API_KEY");

    if (!apiKey) {
      throw new Error("FMP_API_KEY is not set");
    }

    console.log('Received request with params:', { endpoint, symbol, type, from, to, query, tickers });

    switch (endpoint) {
      case "portfolio-operations":
        return await handlePortfolioOperations(apiKey, tickers);
        
      case "insider-trades":
        return await handleInsiderTrades(apiKey, symbol);
        
      case "sec-filings":
        return await handleSecFilings(apiKey, symbol, type);
      
      case "company-news":
        return await handleCompanyNews(apiKey, symbol, from, to);
        
      case "income-statement":
      case "balance-sheet":
      case "cash-flow-statement":
        return await handleFinancialStatements(apiKey, symbol, endpoint);

      case "institutional-holders":
        return await handleInstitutionalHolders(apiKey, symbol);

      case "transcript-dates":
      case "transcript":
      case "dcf":
      case "search":
      case "estimates":
      case "profile":
      case "quote":
      case "key-metrics-ttm":
      case "key-metrics-historical":
        // Handle other endpoints with direct API calls
        const url = getEndpointUrl(endpoint, { symbol, apiKey, year, quarter, query });
        console.log(`Fetching data from URL: ${url}`);
        const response = await fetch(url);
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error(`Unsupported endpoint: ${endpoint}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getEndpointUrl(endpoint: string, params: { symbol: string; apiKey: string; year?: string; quarter?: string; query?: string }) {
  const { symbol, apiKey, year, quarter, query } = params;
  
  switch (endpoint) {
    case "transcript-dates":
      return `https://financialmodelingprep.com/api/v4/earning_call_transcript?symbol=${symbol}&apikey=${apiKey}`;
    case "transcript":
      return `https://financialmodelingprep.com/api/v3/earning_call_transcript/${symbol}?year=${year}&quarter=${quarter}&apikey=${apiKey}`;
    case "dcf":
      return `https://financialmodelingprep.com/api/v3/discounted-cash-flow/${symbol}?apikey=${apiKey}`;
    case "search":
      return `https://financialmodelingprep.com/api/v3/search?query=${query}&limit=10&apikey=${apiKey}`;
    case "estimates":
      return `https://financialmodelingprep.com/api/v3/analyst-estimates/${symbol}?apikey=${apiKey}`;
    case "profile":
      return `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`;
    case "quote":
      return `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`;
    case "key-metrics-ttm":
      return `https://financialmodelingprep.com/api/v3/key-metrics-ttm/${symbol}?apikey=${apiKey}`;
    case "key-metrics-historical":
      return `https://financialmodelingprep.com/api/v3/key-metrics/${symbol}?period=annual&apikey=${apiKey}`;
    default:
      throw new Error(`No URL mapping for endpoint: ${endpoint}`);
  }
}
