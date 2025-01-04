export async function handleCompanyNews(symbol: string, from: string, to: string, apiKey: string): Promise<any[]> {
  console.log(`Fetching company news for ${symbol} from ${from} to ${to}`);
  
  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&from=${from}&to=${to}&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      console.error(`Error fetching company news: ${response.statusText}`);
      throw new Error(`Failed to fetch company news: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched company news for ${symbol}`);
    return data;
  } catch (error) {
    console.error(`Error in handleCompanyNews: ${error.message}`);
    throw error;
  }
}