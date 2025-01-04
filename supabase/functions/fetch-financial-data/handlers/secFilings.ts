import { corsHeaders } from '../utils/cors.ts';

export async function handleSecFilings(apiKey: string, symbol: string, type?: string, page: number = 0) {
  console.log('Handling SEC filings request:', { symbol, type, page });
  
  const typeParam = type ? `&type=${type}` : '';
  const url = `https://financialmodelingprep.com/api/v3/sec_filings/${symbol}?page=${page}${typeParam}&apikey=${apiKey}`;
  
  console.log('Fetching SEC filings from URL:', url);
  const response = await fetch(url);
  const data = await response.json();
  console.log('Raw SEC filings API response:', data);
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}