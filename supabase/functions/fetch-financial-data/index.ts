import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, handleError } from './utils.ts';
import { handleScreening } from './screening.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { endpoint, symbol, screeningCriteria } = await req.json();
    const apiKey = Deno.env.get("FMP_API_KEY");

    if (!apiKey) {
      throw new Error("FMP_API_KEY is not set");
    }

    console.log('Received request with params:', { endpoint, symbol, screeningCriteria });

    switch (endpoint) {
      case "screening":
        const screeningResult = await handleScreening(screeningCriteria);
        return new Response(JSON.stringify(screeningResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case "transcript-dates":
        const url = `https://financialmodelingprep.com/api/v4/earning_call_transcript?symbol=${symbol}&apikey=${apiKey}`;
        console.log('Fetching transcript dates from URL:', url);
        const datesResponse = await fetch(url);
        const datesData = await datesResponse.json();
        console.log('Raw transcript dates API response:', datesData);
        return new Response(JSON.stringify(datesData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case "transcript":
        const { year, quarter } = await req.json();
        if (!year || !quarter) {
          throw new Error("Year and quarter are required for transcript endpoint");
        }
        const transcriptUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${symbol}?year=${year}&quarter=${quarter}&apikey=${apiKey}`;
        console.log('Fetching transcript from URL:', transcriptUrl);
        const transcriptResponse = await fetch(transcriptUrl);
        const transcriptData = await transcriptResponse.json();
        console.log('Raw transcript API response:', transcriptData);
        return new Response(JSON.stringify(transcriptData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case "dcf":
        const dcfUrl = `https://financialmodelingprep.com/api/v3/discounted-cash-flow/${symbol}?apikey=${apiKey}`;
        console.log('Fetching DCF from URL:', dcfUrl);
        const dcfResponse = await fetch(dcfUrl);
        const dcfData = await dcfResponse.json();
        console.log('Raw DCF API response:', dcfData);
        return new Response(JSON.stringify(dcfData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case "search":
        const query = await req.json();
        const searchUrl = `https://financialmodelingprep.com/api/v3/search?query=${query}&limit=10&apikey=${apiKey}`;
        const searchResponse = await fetch(searchUrl);
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

      case "estimates":
        const estimatesUrl = `https://financialmodelingprep.com/api/v3/analyst-estimates/${symbol}?apikey=${apiKey}`;
        console.log('Fetching estimates from URL:', estimatesUrl);
        const estimatesResponse = await fetch(estimatesUrl);
        const estimatesData = await estimatesResponse.json();
        console.log('Raw API response:', estimatesData);
        return new Response(JSON.stringify(estimatesData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case "profile":
        const profileUrl = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`;
        const profileResponse = await fetch(profileUrl);
        const profileData = await profileResponse.json();
        return new Response(JSON.stringify(profileData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case "quote":
        const quoteUrl = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`;
        const quoteResponse = await fetch(quoteUrl);
        const quoteData = await quoteResponse.json();
        return new Response(JSON.stringify(quoteData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

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

        const annualUrl = endpoint === 'income-statement'
          ? `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?limit=10&apikey=${apiKey}`
          : `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?limit=10&apikey=${apiKey}`;
        
        const annualResponse = await fetch(annualUrl);
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

      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
