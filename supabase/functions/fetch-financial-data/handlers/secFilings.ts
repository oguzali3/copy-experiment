import { corsHeaders } from '../utils/cors.ts';

export async function handleSecFilings(apiKey: string, symbol: string, type?: string) {
  console.log('Handling SEC filings request:', { symbol, type });
  
  let url = `https://financialmodelingprep.com/api/v3/sec_filings/${symbol}?apikey=${apiKey}&limit=100`;
  
  if (type) {
    url += `&type=${type}`;
  }
  
  try {
    console.log('Fetching SEC filings from URL:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Error fetching SEC filings:', response.status, response.statusText);
      throw new Error(`Failed to fetch SEC filings: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Retrieved ${data.length} SEC filings`);
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in handleSecFilings:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}