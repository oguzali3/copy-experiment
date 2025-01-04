import { corsHeaders } from '../utils/cors.ts';

export async function handleInsiderRoster(apiKey: string, symbol: string) {
  try {
    console.log('Fetching insider roster for:', symbol);
    const response = await fetch(
      `https://financialmodelingprep.com/api/v4/insider-roaster?symbol=${symbol}&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch insider roster: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Insider roster data received:', data);
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching insider roster:', error);
    return new Response(
      JSON.stringify({ error: `Failed to fetch insider roster: ${error.message}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}