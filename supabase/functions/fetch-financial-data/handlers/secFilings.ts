import { corsHeaders } from '../utils/cors.ts';

export async function handleSecFilings(apiKey: string, symbol: string, type?: string, page: number = 0, year?: string) {
  console.log('Handling SEC filings request:', { symbol, type, page, year });
  
  // Construct base URL with required parameters
  let url = `https://financialmodelingprep.com/api/v3/sec_filings/${symbol}?page=${page}&apikey=${apiKey}`;
  
  // Add type filter if specified
  if (type) {
    url += `&type=${type}`;
  }

  // Add year filter if specified
  if (year) {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    url += `&from=${startDate}&to=${endDate}`;
  }
  
  console.log('Fetching SEC filings from URL:', url);
  const response = await fetch(url);
  const data = await response.json();
  
  console.log(`Retrieved ${data.length} SEC filings for year ${year || 'all'}`);
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}