import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../fetch-financial-data/utils/cors.ts";
import { handlePortfolioOperations } from "../fetch-financial-data/handlers/portfolioOperations.ts";

console.log("Portfolio operations function started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tickers } = await req.json();
    
    if (!Array.isArray(tickers)) {
      throw new Error('Tickers must be an array');
    }

    // Get the API key from environment variable
    const apiKey = Deno.env.get('FMP_API_KEY');
    if (!apiKey) {
      throw new Error('FMP_API_KEY is not set');
    }

    return await handlePortfolioOperations(apiKey, tickers);
  } catch (error) {
    console.error('Error in portfolio-operations function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});