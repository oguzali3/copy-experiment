import { corsHeaders } from '../utils/cors.ts';

export async function handlePortfolioOperations(apiKey: string, tickers: string[]) {
  try {
    if (!Array.isArray(tickers) || tickers.length === 0) {
      throw new Error('No tickers provided');
    }

    // Join tickers with commas for the API request
    const tickersString = tickers.join(',');
    
    // Fetch real-time quote data for all tickers
    const quoteUrl = `https://financialmodelingprep.com/api/v3/quote/${tickersString}?apikey=${apiKey}`;
    console.log('Fetching quotes from URL:', quoteUrl);
    
    const response = await fetch(quoteUrl);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Received quote data:', data);
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response from FMP API');
    }
    
    // Transform the data into the format we need
    const stockData = data.map((quote: any) => ({
      ticker: quote.symbol,
      currentPrice: quote.price,
      change: quote.change,
      changePercent: quote.changesPercentage,
      dayHigh: quote.dayHigh,
      dayLow: quote.dayLow,
      marketCap: quote.marketCap,
      volume: quote.volume,
      timestamp: new Date().toISOString()
    }));

    return new Response(JSON.stringify(stockData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in handlePortfolioOperations:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}