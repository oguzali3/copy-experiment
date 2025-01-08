import { corsHeaders } from '../utils/cors.ts';

export async function handleQuote(apiKey: string, symbol: string) {
  console.log('Handling quote request for:', symbol);
  
  try {
    const url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`;
    console.log('Fetching quote from URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Error fetching quote:', response.status, response.statusText);
      throw new Error(`Failed to fetch quote: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Quote data received:', data);
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in handleQuote:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}