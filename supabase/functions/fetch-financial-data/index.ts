import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from './http.ts';
import { getCachedData, setCachedData } from './cache.ts';
import { searchStocks, getQuotes } from './search.ts';
import { fetchWithRetry } from './http.ts';

const FMP_API_KEY = Deno.env.get('FMP_API_KEY')
const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!FMP_API_KEY) {
      throw new Error('FMP_API_KEY is not configured');
    }

    const { endpoint, symbol, query } = await req.json();
    console.log('Request received:', { endpoint, symbol, query });

    // Check cache first
    const cacheKey = JSON.stringify({ endpoint, symbol, query });
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return new Response(
        JSON.stringify(cachedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let responseData;

    if (endpoint === 'search' && query) {
      const searchResults = await searchStocks(query, FMP_API_KEY, FMP_BASE_URL);
      
      if (searchResults.length === 0) {
        return new Response(
          JSON.stringify([]),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const symbols = searchResults.map((item: any) => item.symbol);
      const quotes = await getQuotes(symbols, FMP_API_KEY, FMP_BASE_URL);

      responseData = searchResults.map((searchItem: any) => {
        const quoteItem = quotes.find((q: any) => q?.symbol === searchItem.symbol) || {};
        return {
          name: searchItem.name,
          symbol: searchItem.symbol,
          price: quoteItem.price || 0,
          change: quoteItem.change || 0,
          changesPercentage: quoteItem.changesPercentage || 0,
          marketCap: quoteItem.marketCap || 0,
          description: searchItem.description || `${searchItem.name} is a publicly traded company.`,
        };
      });
    } else if (symbol) {
      let url: string;
      switch (endpoint) {
        case 'quote':
          url = `${FMP_BASE_URL}/quote/${symbol}?apikey=${FMP_API_KEY}`;
          break;
        case 'profile':
          url = `${FMP_BASE_URL}/profile/${symbol}?apikey=${FMP_API_KEY}`;
          break;
        case 'income-statement':
          url = `${FMP_BASE_URL}/income-statement/${symbol}?limit=120&apikey=${FMP_API_KEY}`;
          break;
        case 'balance-sheet':
          url = `${FMP_BASE_URL}/balance-sheet-statement/${symbol}?limit=120&apikey=${FMP_API_KEY}`;
          break;
        case 'cash-flow':
          url = `${FMP_BASE_URL}/cash-flow-statement/${symbol}?limit=120&apikey=${FMP_API_KEY}`;
          break;
        default:
          throw new Error('Invalid endpoint');
      }

      const response = await fetchWithRetry(url, 5, 2000); // Increased retries and initial delay
      const responseText = await response.text();
      responseData = JSON.parse(responseText);
    } else {
      throw new Error('Invalid request parameters');
    }

    // Cache the successful response
    setCachedData(cacheKey, responseData);

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-financial-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});