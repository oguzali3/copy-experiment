import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from './utils.ts'
import { handleScreening } from './screening.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { endpoint, screeningCriteria } = await req.json();
    console.log('Received request with params:', { endpoint, screeningCriteria });

    switch (endpoint) {
      case "screening":
        const screeningResult = await handleScreening(screeningCriteria);
        return new Response(JSON.stringify(screeningResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})