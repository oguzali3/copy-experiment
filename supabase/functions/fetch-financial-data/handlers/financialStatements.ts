import { createClient } from "npm:@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function handleFinancialStatements(apiKey: string, symbol: string, endpoint: string) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch data from FMP API
    const url = `https://financialmodelingprep.com/api/v3/${endpoint}/${symbol}?apikey=${apiKey}`;
    console.log(`Fetching data from: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from FMP API');
    }

    // Transform and store data
    const transformedData = data.map(item => ({
      symbol,
      period: item.period === 'FY' ? 'annual' : item.period,
      date: item.date,
      calendar_year: new Date(item.date).getFullYear(),
      revenue: item.revenue,
      cost_of_revenue: item.costOfRevenue,
      gross_profit: item.grossProfit,
      operating_expenses: item.operatingExpenses,
      operating_income: item.operatingIncome,
      net_income: item.netIncome,
      total_assets: item.totalAssets,
      total_liabilities: item.totalLiabilities,
      total_equity: item.totalEquity,
      operating_cash_flow: item.operatingCashFlow,
      capital_expenditure: item.capitalExpenditure,
      free_cash_flow: item.freeCashFlow
    }));

    // Store in database
    const { error: insertError } = await supabase
      .from('financial_statements')
      .upsert(transformedData, {
        onConflict: 'symbol,period,date'
      });

    if (insertError) {
      console.error('Error storing data:', insertError);
      throw insertError;
    }

    console.log(`Successfully stored ${transformedData.length} records for ${symbol}`);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error in handleFinancialStatements for ${symbol}:`, error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}