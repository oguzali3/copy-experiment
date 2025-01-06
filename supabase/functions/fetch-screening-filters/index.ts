import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mapping of country codes to names
const countryNames: { [key: string]: string } = {
  US: "United States", UK: "United Kingdom", JP: "Japan", CN: "China", DE: "Germany",
  FR: "France", CA: "Canada", AU: "Australia", BR: "Brazil", IN: "India",
  RU: "Russia", KR: "South Korea", ES: "Spain", IT: "Italy", NL: "Netherlands",
  CH: "Switzerland", SE: "Sweden", MX: "Mexico", SG: "Singapore", HK: "Hong Kong",
  // Add more as needed
};

// Mapping of exchange codes to full names
const exchangeNames: { [key: string]: string } = {
  NYSE: "New York Stock Exchange",
  NASDAQ: "NASDAQ Stock Market",
  AMEX: "American Stock Exchange",
  LSE: "London Stock Exchange",
  TSX: "Toronto Stock Exchange",
  HKSE: "Hong Kong Stock Exchange",
  SSE: "Shanghai Stock Exchange",
  JPX: "Japan Exchange Group",
  EURONEXT: "Euronext",
  ASX: "Australian Securities Exchange",
  // Add more as needed
};

async function fetchAllStocks(apiKey: string) {
  let allStocks = [];
  let page = 0;
  const limit = 1000;
  
  while (true) {
    console.log(`Fetching stocks page ${page + 1}`);
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/stock-screener?apikey=${apiKey}&limit=${limit}&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stocks page ${page + 1}`);
    }
    
    const stocks = await response.json();
    if (!stocks || stocks.length === 0) {
      break;
    }
    
    allStocks = allStocks.concat(stocks);
    page++;
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`Total stocks fetched: ${allStocks.length}`);
  return allStocks;
}

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

    // Fetch all data in parallel
    const [countriesResponse, sectorsResponse, exchangesResponse, industriesResponse] = await Promise.all([
      fetch(`https://financialmodelingprep.com/api/v3/get-all-countries?apikey=${apiKey}`),
      fetch(`https://financialmodelingprep.com/api/v3/sectors-list?apikey=${apiKey}`),
      fetch(`https://financialmodelingprep.com/api/v3/exchanges-list?apikey=${apiKey}`),
      fetch(`https://financialmodelingprep.com/api/v3/industries-list?apikey=${apiKey}`)
    ]);

    const [countriesData, sectorsData, exchangesData, industriesData] = await Promise.all([
      countriesResponse.json(),
      sectorsResponse.json(),
      exchangesResponse.json(),
      industriesResponse.json()
    ]);

    console.log('Data fetched successfully');

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

    const formattedResponse = {
      metrics: metrics.flatMap(category => 
        category.metrics.map(metric => ({
          ...metric,
          category: category.category
        }))
      ),
      countries: Array.isArray(countriesData) ? countriesData.map((code: string) => ({
        name: code,
        description: `Companies based in ${countryNames[code] || code}`,
        fullName: countryNames[code] || code
      })) : [],
      industries: Array.isArray(industriesData) ? industriesData.map((industry: string) => ({
        name: industry,
        description: `Companies in the ${industry} industry`
      })) : [],
      exchanges: Array.isArray(exchangesData) ? exchangesData.map((exchange: string) => ({
        name: exchange,
        description: `Stocks listed on ${exchangeNames[exchange] || exchange}`,
        fullName: exchangeNames[exchange] || exchange
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