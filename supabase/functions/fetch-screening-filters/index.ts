import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching data from stocks table...');

    // Fetch all rows but only select the columns we need
    const { data: stocksData, error: stocksError } = await supabaseClient
      .from('stocks')
      .select('country, industry, exchange');

    if (stocksError) {
      console.error('Error fetching stocks data:', stocksError);
      throw new Error('Failed to fetch stocks data');
    }

    if (!stocksData) {
      console.error('No data returned from stocks query');
      throw new Error('No data available');
    }

    // Use Sets to ensure uniqueness and then convert back to sorted arrays
    const countries = [...new Set(stocksData.map(row => row.country))]
      .filter(Boolean)
      .sort();

    const industries = [...new Set(stocksData.map(row => row.industry))]
      .filter(Boolean)
      .sort();

    const exchanges = [...new Set(stocksData.map(row => row.exchange))]
      .filter(Boolean)
      .sort();

    console.log(`Found ${countries.length} countries, ${industries.length} industries, ${exchanges.length} exchanges`);

    const metrics = [
      { id: "revenue", name: "Revenue", category: "Income Statement" },
      { id: "revenueGrowth", name: "Revenue Growth", category: "Growth" },
      { id: "grossProfit", name: "Gross Profit", category: "Income Statement" },
      { id: "operatingIncome", name: "Operating Income", category: "Income Statement" },
      { id: "netIncome", name: "Net Income", category: "Income Statement" },
      { id: "ebitda", name: "EBITDA", category: "Income Statement" },
      { id: "totalAssets", name: "Total Assets", category: "Balance Sheet" },
      { id: "totalLiabilities", name: "Total Liabilities", category: "Balance Sheet" },
      { id: "totalEquity", name: "Total Equity", category: "Balance Sheet" },
      { id: "operatingCashFlow", name: "Operating Cash Flow", category: "Cash Flow" },
      { id: "freeCashFlow", name: "Free Cash Flow", category: "Cash Flow" }
    ];

    const filterData = {
      countries,
      industries,
      exchanges,
      metrics
    };

    return new Response(
      JSON.stringify(filterData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in fetch-screening-filters:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch filter data',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});