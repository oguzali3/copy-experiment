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

    // Fetch countries
    const countriesResponse = await fetch(
      `https://financialmodelingprep.com/api/v3/get-all-countries?apikey=${apiKey}`
    );
    const countriesData = await countriesResponse.json();
    console.log('Fetched countries:', countriesData?.length);

    // Fetch industries
    const industriesResponse = await fetch(
      `https://financialmodelingprep.com/api/v3/industries-list?apikey=${apiKey}`
    );
    const industriesData = await industriesResponse.json();
    console.log('Fetched industries:', industriesData?.length);

    // Fetch exchanges
    const exchangesResponse = await fetch(
      `https://financialmodelingprep.com/api/v3/exchanges-list?apikey=${apiKey}`
    );
    const exchangesData = await exchangesResponse.json();
    console.log('Fetched exchanges:', exchangesData?.length);
    
    const formattedResponse = {
      metrics: metrics.flatMap(category => 
        category.metrics.map(metric => ({
          ...metric,
          category: category.category
        }))
      ),
      countries: Array.isArray(countriesData) ? countriesData.map((country: any) => ({
        name: country.name || country.code,
        code: country.code,
        description: `Companies based in ${country.name || country.code}`
      })) : [],
      industries: Array.isArray(industriesData) ? industriesData.map((industry: string) => ({
        name: industry,
        description: `Companies in the ${industry} industry`
      })) : [],
      exchanges: Array.isArray(exchangesData) ? exchangesData.map((exchange: any) => ({
        name: exchange.exchange || '',
        description: `Stocks listed on ${exchange.exchange || 'this exchange'}`
      })) : []
    };

    console.log('Sending formatted response:', {
      metricsCount: formattedResponse.metrics.length,
      countriesCount: formattedResponse.countries.length,
      industriesCount: formattedResponse.industries.length,
      exchangesCount: formattedResponse.exchanges.length
    });

    return new Response(
      JSON.stringify(formattedResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in fetch-screening-filters:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        metrics: [],
        countries: [],
        industries: [],
        exchanges: []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})