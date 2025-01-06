import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../fetch-financial-data/utils/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch distinct values from the stocks table
    const { data: countries, error: countriesError } = await supabaseClient
      .from('stocks')
      .select('country')
      .not('country', 'is', null)
      .distinct();

    const { data: industries, error: industriesError } = await supabaseClient
      .from('stocks')
      .select('industry')
      .not('industry', 'is', null)
      .distinct();

    const { data: exchanges, error: exchangesError } = await supabaseClient
      .from('stocks')
      .select('exchange')
      .not('exchange', 'is', null)
      .distinct();

    if (countriesError || industriesError || exchangesError) {
      throw new Error('Error fetching filter data');
    }

    const filterData = {
      countries: countries?.map(item => item.country).filter(Boolean).sort() || [],
      industries: industries?.map(item => item.industry).filter(Boolean).sort() || [],
      exchanges: exchanges?.map(item => item.exchange).filter(Boolean).sort() || [],
      metrics: [
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
      ]
    };

    return new Response(
      JSON.stringify(filterData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error.message);
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