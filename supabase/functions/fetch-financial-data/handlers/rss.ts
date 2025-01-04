import { corsHeaders } from '../utils';

export async function handleRSSFeed(apiKey: string, symbol?: string, from?: string, to?: string) {
  if (!from || !to) {
    throw new Error("From and to dates are required for RSS feed");
  }

  const url = `https://financialmodelingprep.com/api/v3/rss_feed?page=0&apikey=${apiKey}${symbol ? `&ticker=${symbol}` : ''}`;
  console.log('Fetching RSS feed from URL:', url);
  
  const response = await fetch(url);
  const data = await response.json();
  
  // Filter by date range
  const filteredData = data.filter((filing: any) => {
    const filingDate = new Date(filing.date);
    return filingDate >= new Date(from) && filingDate <= new Date(to);
  });
  
  console.log('Filtered RSS feed response:', filteredData);
  return filteredData;
}