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
    ? data.filter((filing: any) => {
        const filingYear = new Date(filing.fillingDate).getFullYear().toString();
        console.log(`Filing year: ${filingYear}, Selected year: ${year}, Match: ${filingYear === year}`);
        return filingYear === year;
      })
    : data;
  
  console.log(`Filtered SEC filings: Found ${filteredData.length} filings for year ${year}`);
  
  return new Response(JSON.stringify(filteredData), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}