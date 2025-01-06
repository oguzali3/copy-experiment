import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAJOR_COMPANIES = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 
  'META', 'TSLA', 'BRK.A', 'LLY', 'JPM',
  'V', 'UNH', 'XOM', 'WMT', 'JNJ',
  'MA', 'PG', 'HD', 'AVGO', 'CVX'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("FMP_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!apiKey || !supabaseUrl || !supabaseKey) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const results: Record<string, any> = {
      profiles: [],
      financials: [],
      errors: []
    };

    // Fetch and store company profiles
    for (const symbol of MAJOR_COMPANIES) {
      try {
        console.log(`Fetching profile for ${symbol}`);
        const profileUrl = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`;
        const profileResponse = await fetch(profileUrl);
        const profileData = await profileResponse.json();

        if (profileData && Array.isArray(profileData) && profileData.length > 0) {
          const { error } = await supabase
            .from('company_profiles')
            .upsert([{
              symbol,
              name: profileData[0].companyName,
              exchange: profileData[0].exchangeShortName,
              currency: profileData[0].currency,
              country: profileData[0].country,
              sector: profileData[0].sector,
              industry: profileData[0].industry,
              fulltimeemployees: profileData[0].fullTimeEmployees,
              description: profileData[0].description,
              ceo: profileData[0].ceo,
              website: profileData[0].website,
              image: profileData[0].image,
              ipodate: profileData[0].ipoDate
            }]);

          if (error) {
            console.error(`Error storing profile for ${symbol}:`, error);
            results.errors.push({ symbol, type: 'profile', error: error.message });
          } else {
            results.profiles.push(symbol);
          }
        }

        // Fetch and store financial statements
        console.log(`Fetching financials for ${symbol}`);
        const statementsUrl = `https://financialmodelingprep.com/api/v3/financial-statements/${symbol}?apikey=${apiKey}`;
        const statementsResponse = await fetch(statementsUrl);
        const statementsData = await statementsResponse.json();

        if (statementsData && Array.isArray(statementsData)) {
          const transformedData = statementsData.map((statement: any) => ({
            symbol,
            period: statement.period || 'annual',
            date: statement.date,
            calendar_year: new Date(statement.date).getFullYear(),
            revenue: statement.revenue,
            cost_of_revenue: statement.costOfRevenue,
            gross_profit: statement.grossProfit,
            operating_expenses: statement.operatingExpenses,
            operating_income: statement.operatingIncome,
            net_income: statement.netIncome,
            total_assets: statement.totalAssets,
            total_liabilities: statement.totalLiabilities,
            total_equity: statement.totalEquity,
            cash_and_equivalents: statement.cashAndEquivalents,
            short_term_investments: statement.shortTermInvestments,
            net_receivables: statement.netReceivables,
            inventory: statement.inventory,
            operating_cash_flow: statement.operatingCashFlow,
            capital_expenditure: statement.capitalExpenditure,
            free_cash_flow: statement.freeCashFlow,
            dividend_payments: statement.dividendsPaid,
            stock_repurchase: statement.stockRepurchase
          }));

          const { error } = await supabase
            .from('financial_statements')
            .upsert(transformedData);

          if (error) {
            console.error(`Error storing financials for ${symbol}:`, error);
            results.errors.push({ symbol, type: 'financials', error: error.message });
          } else {
            results.financials.push(symbol);
          }
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing ${symbol}:`, error);
        results.errors.push({ symbol, type: 'general', error: error.message });
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});