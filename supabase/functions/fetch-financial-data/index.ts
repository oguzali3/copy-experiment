import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleSecFilings } from './handlers/secFilings.ts';
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