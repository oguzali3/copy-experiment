import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { handleQuote, handleProfile, handleIncomeStatement, handleBalanceSheet, handleCashFlow } from "./handlers/financialData.ts";
import { handleInsiderRoster, handleInsiderTrades, handleInstitutionalHolders } from "./handlers/ownershipData.ts";
import { handleCompanyNews } from "./handlers/companyNews.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { endpoint, symbol, from, to } = await req.json();
    const apiKey = Deno.env.get('FMP_API_KEY');

    if (!apiKey) {
      throw new Error('API key not found');
    }

    let data;
    console.log('Processing request for endpoint:', endpoint); // Debug log

    switch (endpoint) {
      case 'quote':
        data = await handleQuote(symbol, apiKey);
        break;

      case 'profile':
        data = await handleProfile(symbol, apiKey);
        break;

      case 'income-statement':
        data = await handleIncomeStatement(symbol, apiKey);
        break;

      case 'balance-sheet':
        data = await handleBalanceSheet(symbol, apiKey);
        break;

      case 'cash-flow-statement':
        data = await handleCashFlow(symbol, apiKey);
        break;
      
      case 'insider-roster':
        data = await handleInsiderRoster(symbol, apiKey);
        break;
      
      case 'insider-trades':
        data = await handleInsiderTrades(symbol, apiKey);
        break;
      
      case 'institutional-holders':
        data = await handleInstitutionalHolders(symbol, apiKey);
        break;

      case 'company-news':
        data = await handleCompanyNews(symbol, from, to, apiKey);
        break;

      default:
        throw new Error(`Unsupported endpoint: ${endpoint}`);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Error processing request:', error); // Debug log
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});