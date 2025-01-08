import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleSecFilings } from './handlers/secFilings.ts';
import { handleQuote } from './handlers/quote.ts';
import { handleProfile } from './handlers/profile.ts';
import { handleFinancialStatements } from './handlers/financialStatements.ts';
import { corsHeaders } from './utils/cors.ts';

const FMP_API_KEY = Deno.env.get('FMP_API_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!FMP_API_KEY) {
      throw new Error('FMP_API_KEY is not set');
    }

    const { endpoint, symbol, type } = await req.json();
    console.log('Received request:', { endpoint, symbol, type });

    switch (endpoint) {
      case 'sec-filings':
        return await handleSecFilings(FMP_API_KEY, symbol, type);
      case 'quote':
        return await handleQuote(FMP_API_KEY, symbol);
      case 'profile':
        return await handleProfile(FMP_API_KEY, symbol);
      case 'income-statement':
      case 'balance-sheet-statement':
      case 'cash-flow-statement':
        return await handleFinancialStatements(FMP_API_KEY, symbol, endpoint);
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