import { corsHeaders } from '../utils/cors.ts';

export async function handleCompanyNews(apiKey: string, symbol: string, from: string, to: string, page: number = 1) {
  if (!from || !to) {
    throw new Error("From and to dates are required for company news");
  }
  
  const url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&page=${page}&from=${from}&to=${to}&apikey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}