import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleSecFilings } from './handlers/secFilings.ts';
import { handleQuote } from './handlers/quote.ts';
import { handleProfile } from './handlers/profile.ts';
import { handleIncomeStatement } from './handlers/incomeStatement.ts';
import { handleBalanceSheet } from './handlers/balanceSheet.ts';
import { handleCashFlow } from './handlers/cashFlow.ts';
import { handleActives } from './handlers/actives.ts';
import { handleInsiderTrades } from './handlers/insiderTrades.ts';
import { handleInstitutionalHolders } from './handlers/institutionalHolders.ts';
import { corsHeaders } from './utils/cors.ts';

const FMP_API_KEY = Deno.env.get('FMP_API_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, symbol, type } = await req.json();
    console.log('Received request:', { endpoint, symbol, type });

    if (!FMP_API_KEY) {
      throw new Error('FMP_API_KEY is not set');
    }

    switch (endpoint) {
      case 'sec-filings':
        return await handleSecFilings(FMP_API_KEY, symbol, type);
      case 'quote':
        return await handleQuote(FMP_API_KEY, symbol);
      case 'profile':
        return await handleProfile(FMP_API_KEY, symbol);
      case 'income-statement':
        return await handleIncomeStatement(FMP_API_KEY, symbol);
      case 'balance-sheet':
        return await handleBalanceSheet(FMP_API_KEY, symbol);
      case 'cash-flow-statement':
        return await handleCashFlow(FMP_API_KEY, symbol);
      case 'actives':
        return await handleActives(FMP_API_KEY);
      case 'insider-trades':
        return await handleInsiderTrades(FMP_API_KEY, symbol);
      case 'institutional-holders':
        return await handleInstitutionalHolders(FMP_API_KEY, symbol);
      default:
        throw new Error(`Unsupported endpoint: ${endpoint}`);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});