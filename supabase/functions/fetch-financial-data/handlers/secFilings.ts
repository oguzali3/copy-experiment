import { corsHeaders } from '../utils/cors.ts';

export async function handleSecFilings(apiKey: string, symbol: string, type?: string, page: number = 0, year?: string) {
  console.log('Handling SEC filings request:', { symbol, type, page, year });
  
  const typeParam = type ? `&type=${type}` : '';
  const url = `https://financialmodelingprep.com/api/v3/sec_filings/${symbol}?page=${page}${typeParam}&apikey=${apiKey}`;
  
  console.log('Fetching SEC filings from URL:', url);
  const response = await fetch(url);
  const data = await response.json();
  
  // Filter filings by year if specified
  const filteredData = year 
    ? data.filter((filing: any) => new Date(filing.fillingDate).getFullYear().toString() === year)
    : data;
  
  console.log('Filtered SEC filings:', filteredData);
  
  return new Response(JSON.stringify(filteredData), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}