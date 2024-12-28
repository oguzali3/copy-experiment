import { fetchWithRetry } from './http.ts';

export async function searchStocks(query: string, apiKey: string, baseUrl: string) {
  const searchUrl = `${baseUrl}/search?query=${encodeURIComponent(query)}&limit=10&apikey=${apiKey}`;
  console.log('Search URL:', searchUrl);
  
  const searchResponse = await fetchWithRetry(searchUrl, 5, 2000); // Increased retries and initial delay
  const searchText = await searchResponse.text();
  
  try {
    const searchData = JSON.parse(searchText);
    if (!Array.isArray(searchData)) {
      throw new Error('Expected array response from search API');
    }
    
    // Filter for only NASDAQ and NYSE stocks
    return searchData.filter((item: any) => 
      item.exchangeShortName === 'NASDAQ' || 
      item.exchangeShortName === 'NYSE'
    );
  } catch (e) {
    console.error('Failed to parse search response:', e);
    throw new Error('Invalid search response format');
  }
}

export async function getQuotes(symbols: string[], apiKey: string, baseUrl: string) {
  if (symbols.length === 0) return [];
  
  const symbolsStr = symbols.join(',');
  const quoteUrl = `${baseUrl}/quote/${symbolsStr}?apikey=${apiKey}`;
  
  const quoteResponse = await fetchWithRetry(quoteUrl, 5, 2000); // Increased retries and initial delay
  const quoteText = await quoteResponse.text();
  
  try {
    const quoteData = JSON.parse(quoteText);
    return Array.isArray(quoteData) ? quoteData : [quoteData];
  } catch (e) {
    console.error('Failed to parse quote response:', e);
    throw new Error('Invalid quote response format');
  }
}