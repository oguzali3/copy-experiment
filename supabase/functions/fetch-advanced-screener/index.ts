import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../fetch-financial-data/utils/cors.ts';

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: any;
  timestamp: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filters } = await req.json();
    const apiKey = Deno.env.get("FMP_API_KEY");

    if (!apiKey) {
      throw new Error("FMP_API_KEY is not set");
    }

    // Stage 1: Basic Screening
    const basicScreenerUrl = constructBasicScreenerUrl(filters.basicFilters, apiKey);
    console.log('Basic screener URL:', basicScreenerUrl);
    
    const basicResults = await fetchWithCache(basicScreenerUrl);
    if (!basicResults || !Array.isArray(basicResults)) {
      throw new Error("Invalid response from basic screener");
    }

    // Stage 2: Advanced Screening
    const symbols = basicResults.map(stock => stock.symbol).slice(0, 20); // Limit to 20 stocks for performance
    const detailedMetrics = await fetchDetailedMetrics(symbols, apiKey);
    
    // Apply advanced filters
    const finalResults = basicResults.filter(stock => {
      const metrics = detailedMetrics[stock.symbol];
      if (!metrics) return false;
      
      return filters.advancedFilters.every(filter => 
        evaluateAdvancedFilter(metrics, filter)
      );
    });

    return new Response(JSON.stringify(finalResults), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in advanced screener:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function constructBasicScreenerUrl(basicFilters: any[], apiKey: string): string {
  const params = new URLSearchParams();
  basicFilters.forEach(filter => {
    const value = typeof filter.value === 'number' ? filter.value : filter.min;
    params.append(filter.id, value.toString());
  });
  params.append('apikey', apiKey);
  return `https://financialmodelingprep.com/api/v3/stock-screener?${params}`;
}

async function fetchWithCache(url: string): Promise<any> {
  const cacheEntry = cache.get(url) as CacheEntry;
  const now = Date.now();

  if (cacheEntry && (now - cacheEntry.timestamp) < CACHE_TTL) {
    console.log('Cache hit for URL:', url);
    return cacheEntry.data;
  }

  console.log('Cache miss for URL:', url);
  const response = await fetch(url);
  const data = await response.json();
  
  cache.set(url, { data, timestamp: now });
  return data;
}

async function fetchDetailedMetrics(symbols: string[], apiKey: string): Promise<Record<string, any>> {
  const endpoints = [
    'income-statement',
    'balance-sheet-statement',
    'cash-flow-statement',
    'key-metrics'
  ];

  const promises = symbols.map(async (symbol) => {
    const metrics: Record<string, any> = { symbol };
    
    await Promise.all(endpoints.map(async (endpoint) => {
      const url = `https://financialmodelingprep.com/api/v3/${endpoint}/${symbol}?limit=1&apikey=${apiKey}`;
      const data = await fetchWithCache(url);
      if (Array.isArray(data) && data.length > 0) {
        Object.assign(metrics, data[0]);
      }
    }));

    return metrics;
  });

  const results = await Promise.all(promises);
  return results.reduce((acc, metrics) => {
    acc[metrics.symbol] = metrics;
    return acc;
  }, {});
}

function evaluateAdvancedFilter(metrics: any, filter: any): boolean {
  const value = metrics[filter.id];
  if (value === undefined) return false;

  if (filter.min !== undefined && filter.max !== undefined) {
    return value >= filter.min && value <= filter.max;
  } else if (filter.min !== undefined) {
    return value >= filter.min;
  } else if (filter.max !== undefined) {
    return value <= filter.max;
  }

  return true;
}