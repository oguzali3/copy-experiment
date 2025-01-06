import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from './utils/cors.ts';
import { handleSecFilings } from './handlers/secFilings.ts';
import { handleCompanyNews } from './handlers/companyNews.ts';
import { handleFinancialStatements } from './handlers/financialStatements.ts';
import { handleInsiderTrades } from './handlers/insiderTrades.ts';
import { handleInstitutionalHolders } from './handlers/institutionalHolders.ts';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { endpoint, symbol, type, from, to, query, year, quarter } = await req.json();
    const apiKey = Deno.env.get("FMP_API_KEY");
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!apiKey || !supabaseUrl || !supabaseKey) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Received request with params:', { endpoint, symbol, type, from, to, query });

    switch (endpoint) {
      case "income-statement":
      case "balance-sheet":
      case "cash-flow-statement":
        return await handleFinancialStatements(apiKey, symbol, endpoint);

      case "key-metrics-ttm":
      case "key-metrics-historical":
        const metricsUrl = `https://financialmodelingprep.com/api/v3/${endpoint}/${symbol}?apikey=${apiKey}`;
        const metricsResponse = await fetch(metricsUrl);
        const metricsData = await metricsResponse.json();

        // Store metrics data
        if (Array.isArray(metricsData)) {
          const { error: metricsError } = await supabase
            .from('financial_metrics')
            .upsert(
              metricsData.map(metric => ({
                symbol,
                period: endpoint.includes('ttm') ? 'ttm' : 'annual',
                date: metric.date,
                calendar_year: new Date(metric.date).getFullYear(),
                ...metric
              })),
              { onConflict: 'symbol,period,date' }
            );

          if (metricsError) {
            console.error('Error storing metrics:', metricsError);
          }
        }

        return new Response(JSON.stringify(metricsData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      // Handle other endpoints with direct API calls
      case "search":
        const searchUrl = `https://financialmodelingprep.com/api/v3/search?query=${query}&limit=10&apikey=${apiKey}`;
        console.log('Fetching search results from:', searchUrl);
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        console.log('Search results:', searchData);
        return new Response(JSON.stringify(searchData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case "insider-trades":
        return await handleInsiderTrades(apiKey, symbol);
        
      case "sec-filings":
        return await handleSecFilings(apiKey, symbol, type);
      
      case "company-news":
        return await handleCompanyNews(apiKey, symbol, from, to);
        
      case "institutional-holders":
        return await handleInstitutionalHolders(apiKey, symbol);

      default:
        throw new Error(`Unsupported endpoint: ${endpoint}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
