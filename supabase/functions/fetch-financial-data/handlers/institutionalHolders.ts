import { corsHeaders } from '../utils/cors.ts';

export async function handleInstitutionalHolders(apiKey: string, symbol: string) {
  console.log('Fetching institutional holders for:', symbol);
  
  // Get current date in YYYY-MM-DD format
  const today = new Date();
  const date = today.toISOString().split('T')[0];
  
  const url = `https://financialmodelingprep.com/api/v4/institutional-ownership/institutional-holders/symbol-ownership-percent?symbol=${symbol}&date=${date}&apikey=${apiKey}`;
  
  try {
    console.log('Making request to FMP API...');
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`FMP API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`FMP API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched institutional holders data');
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching institutional holders:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to fetch institutional holders data. Please check API key and try again.',
      url: url.replace(apiKey, 'HIDDEN') // Log URL without exposing API key
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}