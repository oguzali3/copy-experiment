import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { endpoint, symbol, from, to, page, query } = await req.json();
    const apiKey = Deno.env.get("FMP_API_KEY");

    if (!apiKey) {
      throw new Error("FMP_API_KEY is not set");
    }

    console.log('Received request with params:', { endpoint, symbol, from, to, page, query });

    let url;
    switch (endpoint) {
      case "dcf":
        url = `https://financialmodelingprep.com/api/v3/discounted-cash-flow/${symbol}?apikey=${apiKey}`;
        console.log('Fetching DCF from URL:', url);
        const dcfResponse = await fetch(url);
        const dcfData = await dcfResponse.json();
        console.log('Raw DCF API response:', dcfData);
        return new Response(JSON.stringify(dcfData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case "search":
        url = `https://financialmodelingprep.com/api/v3/search?query=${query}&limit=10&apikey=${apiKey}`;
        const searchResponse = await fetch(url);
        const searchResults = await searchResponse.json();
        
        if (searchResults && searchResults.length > 0) {
          const symbols = searchResults.map((result: any) => result.symbol).join(',');
          const quotesUrl = `https://financialmodelingprep.com/api/v3/quote/${symbols}?apikey=${apiKey}`;
          const quotesResponse = await fetch(quotesUrl);
          const quotesData = await quotesResponse.json();

          const enrichedResults = searchResults.map((result: any) => {
            const quote = quotesData.find((q: any) => q.symbol === result.symbol);
            return {
              ...result,
              price: quote?.price,
              change: quote?.change,
              changesPercentage: quote?.changesPercentage,
            };
          });

          return new Response(JSON.stringify(enrichedResults), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        return new Response(JSON.stringify(searchResults), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
        break;
      
      case "estimates":
        url = `https://financialmodelingprep.com/api/v3/analyst-estimates/${symbol}?apikey=${apiKey}`;
        console.log('Fetching estimates from URL:', url);
        const estimatesResponse = await fetch(url);
        const estimatesData = await estimatesResponse.json();
        console.log('Raw API response:', estimatesData);
        return new Response(JSON.stringify(estimatesData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case "profile":
        url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`;
        break;
      case "quote":
        url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`;
        break;
      case "income-statement":
      case "balance-sheet":
      case "cash-flow-statement":
        const ttmUrl = endpoint === 'income-statement' 
          ? `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?period=quarter&limit=4&apikey=${apiKey}`
          : `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?period=quarter&limit=4&apikey=${apiKey}`;
        
        const ttmResponse = await fetch(ttmUrl);
        const ttmData = await ttmResponse.json();
        
        const ttm = endpoint === 'income-statement'
          ? ttmData.reduce((acc: any, quarter: any) => {
              Object.keys(quarter).forEach(key => {
                if (typeof quarter[key] === 'number') {
                  acc[key] = (acc[key] || 0) + quarter[key];
                }
              });
              return acc;
            }, { period: 'TTM', symbol, date: new Date().toISOString() })
          : { ...ttmData[0], period: 'TTM' };

        url = endpoint === 'income-statement'
          ? `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?limit=10&apikey=${apiKey}`
          : `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?limit=10&apikey=${apiKey}`;
        
        const annualResponse = await fetch(url);
        const annualData = await annualResponse.json();

        const combinedData = [ttm, ...annualData];
        
        return new Response(JSON.stringify(combinedData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case "cash-flow-statement":
        const cashFlowTtmUrl = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?period=quarter&limit=4&apikey=${apiKey}`;
        const cashFlowTtmResponse = await fetch(cashFlowTtmUrl);
        const cashFlowTtmData = await cashFlowTtmResponse.json();
        
        console.log('TTM Cash Flow Data:', cashFlowTtmData);

        const cashFlowTtm = cashFlowTtmData.reduce((acc: any, quarter: any) => {
          Object.keys(quarter).forEach(key => {
            if (typeof quarter[key] === 'number') {
              acc[key] = (acc[key] || 0) + quarter[key];
            }
          });
          return acc;
        }, { period: 'TTM', symbol, date: new Date().toISOString() });

        const cashFlowUrl = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?limit=10&apikey=${apiKey}`;
        const cashFlowAnnualResponse = await fetch(cashFlowUrl);
        const cashFlowAnnualData = await cashFlowAnnualResponse.json();

        console.log('Annual Cash Flow Data:', cashFlowAnnualData);

        const combinedCashFlowData = [cashFlowTtm, ...cashFlowAnnualData];
        
        return new Response(JSON.stringify(combinedCashFlowData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
        break;
      
      case "company-news":
        if (!from || !to) {
          throw new Error("From and to dates are required for company news");
        }
        url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&page=${page || 1}&from=${from}&to=${to}&apikey=${apiKey}`;
        break;

      case "key-metrics-ttm":
        url = `https://financialmodelingprep.com/api/v3/key-metrics-ttm/${symbol}?apikey=${apiKey}`;
        console.log('Fetching TTM key metrics from URL:', url);
        const ttmMetricsResponse = await fetch(url);
        const ttmMetricsData = await ttmMetricsResponse.json();
        console.log('Raw TTM API response:', ttmMetricsData);
        return new Response(JSON.stringify(ttmMetricsData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case "key-metrics-historical":
        url = `https://financialmodelingprep.com/api/v3/key-metrics/${symbol}?period=annual&apikey=${apiKey}`;
        console.log('Fetching historical key metrics from URL:', url);
        const historicalMetricsResponse = await fetch(url);
        const historicalMetricsData = await historicalMetricsResponse.json();
        console.log('Raw historical API response:', historicalMetricsData);
        return new Response(JSON.stringify(historicalMetricsData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error(`Invalid endpoint: ${endpoint}`);
    }

    if (endpoint !== "search" && endpoint !== "income-statement" && 
        endpoint !== "balance-sheet" && endpoint !== "cash-flow-statement" && 
        endpoint !== "estimates" && endpoint !== "key-metrics-ttm" && 
        endpoint !== "key-metrics-historical") {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
