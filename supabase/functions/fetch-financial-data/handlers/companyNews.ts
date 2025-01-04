import { corsHeaders } from '../utils/cors.ts';

export async function handleCompanyNews(apiKey: string, symbol: string, from?: string, to?: string) {
  console.log('Handling company news request:', { symbol, from, to });
  
  let url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&apikey=${apiKey}`;
  if (from && to) {
    url += `&from=${from}&to=${to}`;
  }
  
  console.log('Fetching company news from URL:', url);
  const response = await fetch(url);
  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}