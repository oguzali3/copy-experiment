import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('Starting bulk data sync...');

    // Fetch all company profiles in bulk
    console.log('Fetching all company profiles...');
    const profilesUrl = `https://financialmodelingprep.com/api/v4/company-profile/bulk?apikey=${apiKey}`;
    const profilesResponse = await fetch(profilesUrl);
    const profilesData = await profilesResponse.json();

    if (Array.isArray(profilesData)) {
      console.log(`Found ${profilesData.length} company profiles`);
      
      const profilesToUpsert = profilesData.map(profile => ({
        symbol: profile.symbol,
        name: profile.companyName,
        exchange: profile.exchangeShortName,
        currency: profile.currency,
        country: profile.country,
        sector: profile.sector,
        industry: profile.industry,
        fulltimeemployees: profile.fullTimeEmployees,
        description: profile.description,
        ceo: profile.ceo,
        website: profile.website,
        image: profile.image,
        ipodate: profile.ipoDate
      }));

      const { error: profilesError } = await supabase
        .from('company_profiles')
        .upsert(profilesToUpsert);

      if (profilesError) {
        console.error('Error storing company profiles:', profilesError);
        results.errors.push({ type: 'profiles', error: profilesError.message });
      } else {
        results.profiles = profilesToUpsert.map(p => p.symbol);
      }
    }

    // Fetch all income statements in bulk
    console.log('Fetching all income statements...');
    const incomeStatementsUrl = `https://financialmodelingprep.com/api/v4/income-statement-bulk?period=annual&apikey=${apiKey}`;
    const incomeStatementsResponse = await fetch(incomeStatementsUrl);
    const incomeStatementsData = await incomeStatementsResponse.json();

    // Fetch all balance sheets in bulk
    console.log('Fetching all balance sheets...');
    const balanceSheetsUrl = `https://financialmodelingprep.com/api/v4/balance-sheet-statement-bulk?period=annual&apikey=${apiKey}`;
    const balanceSheetsResponse = await fetch(balanceSheetsUrl);
    const balanceSheetsData = await balanceSheetsResponse.json();

    // Fetch all cash flow statements in bulk
    console.log('Fetching all cash flow statements...');
    const cashFlowsUrl = `https://financialmodelingprep.com/api/v4/cash-flow-statement-bulk?period=annual&apikey=${apiKey}`;
    const cashFlowsResponse = await fetch(cashFlowsUrl);
    const cashFlowsData = await cashFlowsResponse.json();

    if (Array.isArray(incomeStatementsData) && Array.isArray(balanceSheetsData) && Array.isArray(cashFlowsData)) {
      console.log(`Processing financial statements...`);
      
      // Create a map for quick lookups
      const balanceSheetsMap = new Map(
        balanceSheetsData.map(bs => [`${bs.symbol}-${bs.date}`, bs])
      );
      const cashFlowsMap = new Map(
        cashFlowsData.map(cf => [`${cf.symbol}-${cf.date}`, cf])
      );

      const financialsToUpsert = incomeStatementsData.map(income => {
        const key = `${income.symbol}-${income.date}`;
        const balanceSheet = balanceSheetsMap.get(key);
        const cashFlow = cashFlowsMap.get(key);

        return {
          symbol: income.symbol,
          period: 'annual',
          date: income.date,
          calendar_year: new Date(income.date).getFullYear(),
          revenue: income.revenue,
          cost_of_revenue: income.costOfRevenue,
          gross_profit: income.grossProfit,
          operating_expenses: income.operatingExpenses,
          operating_income: income.operatingIncome,
          net_income: income.netIncome,
          total_assets: balanceSheet?.totalAssets,
          total_liabilities: balanceSheet?.totalLiabilities,
          total_equity: balanceSheet?.totalStockholdersEquity,
          cash_and_equivalents: balanceSheet?.cashAndCashEquivalents,
          short_term_investments: balanceSheet?.shortTermInvestments,
          net_receivables: balanceSheet?.netReceivables,
          inventory: balanceSheet?.inventory,
          operating_cash_flow: cashFlow?.operatingCashFlow,
          capital_expenditure: cashFlow?.capitalExpenditure,
          free_cash_flow: cashFlow?.freeCashFlow,
          dividend_payments: cashFlow?.dividendsPaid,
          stock_repurchase: cashFlow?.commonStockRepurchased
        };
      });

      const { error: financialsError } = await supabase
        .from('financial_statements')
        .upsert(financialsToUpsert);

      if (financialsError) {
        console.error('Error storing financial statements:', financialsError);
        results.errors.push({ type: 'financials', error: financialsError.message });
      } else {
        results.financials = [...new Set(financialsToUpsert.map(f => f.symbol))];
      }
    }

    console.log('Bulk sync completed');
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