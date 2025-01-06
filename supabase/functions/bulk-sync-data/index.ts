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
    const results: Record<string, any> = {};

    // Company Profiles
    console.log('Fetching company profiles...');
    const profilesUrl = `https://financialmodelingprep.com/api/v4/company-profile/bulk?apikey=${apiKey}`;
    const profilesResponse = await fetch(profilesUrl);
    const profilesData = await profilesResponse.json();
    
    if (Array.isArray(profilesData)) {
      const { error: profilesError } = await supabase
        .from('company_profiles')
        .upsert(profilesData.map(profile => ({
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
        })));

      if (profilesError) throw profilesError;
      results.profiles = profilesData.length;
    }

    // Financial Statements - Annual
    console.log('Fetching annual financial statements...');
    const periods = ['annual', 'quarter'];
    
    for (const period of periods) {
      // Income Statements
      const incomeUrl = `https://financialmodelingprep.com/api/v4/income-statement-bulk?period=${period}&apikey=${apiKey}`;
      const balanceSheetUrl = `https://financialmodelingprep.com/api/v4/balance-sheet-statement-bulk?period=${period}&apikey=${apiKey}`;
      const cashFlowUrl = `https://financialmodelingprep.com/api/v4/cash-flow-statement-bulk?period=${period}&apikey=${apiKey}`;

      const [incomeResponse, balanceSheetResponse, cashFlowResponse] = await Promise.all([
        fetch(incomeUrl),
        fetch(balanceSheetUrl),
        fetch(cashFlowUrl)
      ]);

      const [incomeData, balanceSheetData, cashFlowData] = await Promise.all([
        incomeResponse.json(),
        balanceSheetResponse.json(),
        cashFlowResponse.json()
      ]);

      // Create maps for quick lookups
      const balanceSheetsMap = new Map(
        balanceSheetData.map((bs: any) => [`${bs.symbol}-${bs.date}`, bs])
      );
      const cashFlowsMap = new Map(
        cashFlowData.map((cf: any) => [`${cf.symbol}-${cf.date}`, cf])
      );

      const financialStatements = incomeData.map((income: any) => {
        const key = `${income.symbol}-${income.date}`;
        const balanceSheet = balanceSheetsMap.get(key);
        const cashFlow = cashFlowsMap.get(key);

        return {
          symbol: income.symbol,
          period,
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

      const { error: statementsError } = await supabase
        .from('financial_statements')
        .upsert(financialStatements);

      if (statementsError) throw statementsError;
      results[`${period}_statements`] = financialStatements.length;
    }

    // Metrics & Ratios
    console.log('Fetching metrics and ratios...');
    for (const period of periods) {
      const metricsUrl = `https://financialmodelingprep.com/api/v4/key-metrics-bulk?period=${period}&apikey=${apiKey}`;
      const ratiosUrl = `https://financialmodelingprep.com/api/v4/ratios-bulk?period=${period}&apikey=${apiKey}`;

      const [metricsResponse, ratiosResponse] = await Promise.all([
        fetch(metricsUrl),
        fetch(ratiosUrl)
      ]);

      const [metricsData, ratiosData] = await Promise.all([
        metricsResponse.json(),
        ratiosResponse.json()
      ]);

      if (Array.isArray(metricsData)) {
        const { error: metricsError } = await supabase
          .from('financial_metrics')
          .upsert(metricsData.map(metric => ({
            symbol: metric.symbol,
            period,
            date: metric.date,
            calendar_year: new Date(metric.date).getFullYear(),
            pe_ratio: metric.peRatio,
            price_to_book: metric.priceToBookRatio,
            debt_to_equity: metric.debtToEquity,
            free_cash_flow_yield: metric.freeCashFlowYield,
            dividend_yield: metric.dividendYield,
            operating_margin: metric.operatingProfitMargin,
            net_margin: metric.netProfitMargin,
            roa: metric.returnOnAssets,
            roe: metric.returnOnEquity
          })));

        if (metricsError) throw metricsError;
        results[`${period}_metrics`] = metricsData.length;
      }

      if (Array.isArray(ratiosData)) {
        const { error: ratiosError } = await supabase
          .from('financial_ratios')
          .upsert(ratiosData.map(ratio => ({
            symbol: ratio.symbol,
            period,
            date: ratio.date,
            calendar_year: new Date(ratio.date).getFullYear(),
            gross_margin_ratio: ratio.grossProfitMargin,
            operating_margin_ratio: ratio.operatingProfitMargin,
            net_profit_margin: ratio.netProfitMargin,
            return_on_equity: ratio.returnOnEquity,
            return_on_assets: ratio.returnOnAssets,
            current_ratio: ratio.currentRatio,
            quick_ratio: ratio.quickRatio,
            debt_ratio: ratio.debtRatio,
            debt_equity_ratio: ratio.debtToEquity,
            interest_coverage: ratio.interestCoverage
          })));

        if (ratiosError) throw ratiosError;
        results[`${period}_ratios`] = ratiosData.length;
      }
    }

    // TTM Data
    console.log('Fetching TTM data...');
    const ttmMetricsUrl = `https://financialmodelingprep.com/api/v4/key-metrics-ttm-bulk?apikey=${apiKey}`;
    const ttmRatiosUrl = `https://financialmodelingprep.com/api/v4/ratios-ttm-bulk?apikey=${apiKey}`;

    const [ttmMetricsResponse, ttmRatiosResponse] = await Promise.all([
      fetch(ttmMetricsUrl),
      fetch(ttmRatiosUrl)
    ]);

    const [ttmMetricsData, ttmRatiosData] = await Promise.all([
      ttmMetricsResponse.json(),
      ttmRatiosResponse.json()
    ]);

    if (Array.isArray(ttmRatiosData)) {
      const { error: ttmRatiosError } = await supabase
        .from('ttm_ratios')
        .upsert(ttmRatiosData.map(ratio => ({
          symbol: ratio.symbol,
          gross_margin_ttm: ratio.grossProfitMarginTTM,
          operating_margin_ttm: ratio.operatingProfitMarginTTM,
          net_profit_margin_ttm: ratio.netProfitMarginTTM,
          return_on_equity_ttm: ratio.returnOnEquityTTM,
          return_on_assets_ttm: ratio.returnOnAssetsTTM,
          pe_ratio_ttm: ratio.priceEarningsRatioTTM,
          price_to_book_ttm: ratio.priceToBookRatioTTM,
          dividend_yield_ttm: ratio.dividendYieldTTM
        })));

      if (ttmRatiosError) throw ttmRatiosError;
      results.ttm_ratios = ttmRatiosData.length;
    }

    // Growth Metrics
    console.log('Fetching growth metrics...');
    const growthUrls = [
      `https://financialmodelingprep.com/api/v4/income-statement-growth-bulk?apikey=${apiKey}`,
      `https://financialmodelingprep.com/api/v4/balance-sheet-growth-bulk?apikey=${apiKey}`,
      `https://financialmodelingprep.com/api/v4/cash-flow-statement-growth-bulk?apikey=${apiKey}`
    ];

    const growthResponses = await Promise.all(growthUrls.map(url => fetch(url)));
    const [incomeGrowth, balanceGrowth, cashFlowGrowth] = await Promise.all(
      growthResponses.map(response => response.json())
    );

    if (Array.isArray(incomeGrowth)) {
      const { error: growthError } = await supabase
        .from('growth_metrics')
        .upsert(incomeGrowth.map(growth => ({
          symbol: growth.symbol,
          period: 'annual',
          date: growth.date,
          calendar_year: new Date(growth.date).getFullYear(),
          revenue_growth: growth.revenueGrowth,
          gross_profit_growth: growth.grossProfitGrowth,
          operating_income_growth: growth.operatingIncomeGrowth,
          net_income_growth: growth.netIncomeGrowth,
          eps_growth: growth.epsgrowth
        })));

      if (growthError) throw growthError;
      results.growth_metrics = incomeGrowth.length;
    }

    // Stock Peers
    console.log('Fetching stock peers...');
    const peersUrl = `https://financialmodelingprep.com/api/v4/stock-peers-bulk?apikey=${apiKey}`;
    const peersResponse = await fetch(peersUrl);
    const peersData = await peersResponse.json();

    if (Array.isArray(peersData)) {
      const peerRecords = peersData.flatMap(item => 
        item.peersList.map((peer: string) => ({
          symbol: item.symbol,
          peer_symbol: peer
        }))
      );

      const { error: peersError } = await supabase
        .from('stock_peers')
        .upsert(peerRecords);

      if (peersError) throw peersError;
      results.peers = peerRecords.length;
    }

    // Price Targets
    console.log('Fetching price targets...');
    const targetsUrl = `https://financialmodelingprep.com/api/v4/price-target-summary-bulk?apikey=${apiKey}`;
    const targetsResponse = await fetch(targetsUrl);
    const targetsData = await targetsResponse.json();

    if (Array.isArray(targetsData)) {
      const { error: targetsError } = await supabase
        .from('price_targets')
        .upsert(targetsData.map(target => ({
          symbol: target.symbol,
          target_low: target.targetLow,
          target_mean: target.targetMean,
          target_high: target.targetHigh,
          target_consensus: target.targetConsensus,
          number_of_analysts: target.numberOfAnalysts
        })));

      if (targetsError) throw targetsError;
      results.price_targets = targetsData.length;
    }

    // Analyst Recommendations
    console.log('Fetching analyst recommendations...');
    const recommendationsUrl = `https://financialmodelingprep.com/api/v4/upgrades-downgrades-consensus-bulk?apikey=${apiKey}`;
    const recommendationsResponse = await fetch(recommendationsUrl);
    const recommendationsData = await recommendationsResponse.json();

    if (Array.isArray(recommendationsData)) {
      const { error: recommendationsError } = await supabase
        .from('analyst_recommendations')
        .upsert(recommendationsData.map(rec => ({
          symbol: rec.symbol,
          date: rec.date,
          analyst_company: rec.analystCompany,
          analyst_name: rec.analystName,
          recommendation: rec.recommendation,
          previous_recommendation: rec.previousRecommendation,
          action: rec.action,
          target_price: rec.targetPrice,
          previous_target_price: rec.previousTargetPrice
        })));

      if (recommendationsError) throw recommendationsError;
      results.analyst_recommendations = recommendationsData.length;
    }

    console.log('Bulk sync completed successfully:', results);
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in bulk sync:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});