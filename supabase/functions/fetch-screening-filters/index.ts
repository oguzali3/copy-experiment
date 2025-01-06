import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const metrics = [
  {
    category: "Valuation",
    metrics: [
      { id: "marketCap", name: "Market Cap", description: "Total market value of company's shares" },
      { id: "peRatio", name: "P/E Ratio", description: "Price to earnings ratio" },
      { id: "priceToBook", name: "Price to Book", description: "Market price to book value ratio" },
      { id: "evToEbitda", name: "EV/EBITDA", description: "Enterprise value to EBITDA ratio" },
      { id: "priceToSales", name: "P/S Ratio", description: "Price to sales ratio" },
      { id: "evToSales", name: "EV/Sales", description: "Enterprise value to sales ratio" }
    ]
  },
  {
    category: "Growth",
    metrics: [
      { id: "revenueGrowth", name: "Revenue Growth", description: "Year-over-year revenue growth" },
      { id: "epsGrowth", name: "EPS Growth", description: "Year-over-year EPS growth" },
      { id: "profitGrowth", name: "Profit Growth", description: "Year-over-year profit growth" },
      { id: "revenueGrowthTTM", name: "Revenue Growth TTM", description: "Trailing twelve months revenue growth" },
      { id: "epsGrowthTTM", name: "EPS Growth TTM", description: "Trailing twelve months EPS growth" }
    ]
  },
  {
    category: "Profitability",
    metrics: [
      { id: "grossMargin", name: "Gross Margin", description: "Gross profit as percentage of revenue" },
      { id: "operatingMargin", name: "Operating Margin", description: "Operating income as percentage of revenue" },
      { id: "netMargin", name: "Net Margin", description: "Net income as percentage of revenue" },
      { id: "roe", name: "ROE", description: "Return on equity" },
      { id: "roa", name: "ROA", description: "Return on assets" }
    ]
  },
  {
    category: "Financial Health",
    metrics: [
      { id: "currentRatio", name: "Current Ratio", description: "Current assets to current liabilities" },
      { id: "debtToEquity", name: "Debt to Equity", description: "Total debt to shareholders equity" },
      { id: "interestCoverage", name: "Interest Coverage", description: "Operating income to interest expenses" },
      { id: "quickRatio", name: "Quick Ratio", description: "Liquid assets to current liabilities" }
    ]
  },
  {
    category: "Dividend",
    metrics: [
      { id: "dividendYield", name: "Dividend Yield", description: "Annual dividend yield percentage" },
      { id: "payoutRatio", name: "Payout Ratio", description: "Percentage of earnings paid as dividends" },
      { id: "dividendGrowth", name: "Dividend Growth", description: "Year-over-year dividend growth" }
    ]
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Fetching screening filters...');
    const apiKey = Deno.env.get('FMP_API_KEY');
    if (!apiKey) {
      throw new Error('FMP API key not configured');
    }

    // Fetch sectors
    const sectorsResponse = await fetch(
      `https://financialmodelingprep.com/api/v3/sectors-list?apikey=${apiKey}`
    );
    const sectors = await sectorsResponse.json();
    console.log('Fetched sectors:', sectors.length);

    // Fetch industries
    const industriesResponse = await fetch(
      `https://financialmodelingprep.com/api/v3/industries-list?apikey=${apiKey}`
    );
    const industries = await industriesResponse.json();
    console.log('Fetched industries:', industries.length);

    // Fetch exchanges
    const exchangesResponse = await fetch(
      `https://financialmodelingprep.com/api/v3/exchanges-list?apikey=${apiKey}`
    );
    const exchanges = await exchangesResponse.json();
    console.log('Fetched exchanges:', exchanges.length);
    
    return new Response(
      JSON.stringify({
        metrics: metrics.flatMap(category => 
          category.metrics.map(metric => ({
            ...metric,
            category: category.category
          }))
        ),
        sectors: sectors.map((sector: string) => ({
          name: sector,
          description: `Companies in the ${sector} sector`
        })),
        industries: industries.map((industry: string) => ({
          name: industry,
          description: `Companies in the ${industry} industry`
        })),
        exchanges: exchanges.map((exchange: any) => ({
          name: exchange.exchange,
          description: `Stocks listed on ${exchange.exchange}`
        }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in fetch-screening-filters:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})