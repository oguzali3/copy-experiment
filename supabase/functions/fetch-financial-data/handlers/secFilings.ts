import { corsHeaders } from '../utils/cors.ts';

export async function handleSecFilings(apiKey: string, symbol: string, type?: string) {
  console.log('Handling SEC filings request:', { symbol, type });
  
  // Construct URL with limit=0 to get all filings
  let url = `https://financialmodelingprep.com/api/v3/sec_filings/${symbol}?apikey=${apiKey}&limit=0`;
  
  // Add type filter if specified
  if (type) {
    url += `&type=${type}`;
  }
  
  console.log('Fetching SEC filings from URL:', url);
  const response = await fetch(url);
  const data = await response.json();
  
  console.log(`Retrieved ${data.length} SEC filings`);
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}