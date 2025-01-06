import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Fetching screening filters...');

    // Fetch country data from REST Countries API
    const restCountriesResponse = await fetch('https://restcountries.com/v3.1/all?fields=cca2,name,flag');
    const restCountriesData = await restCountriesResponse.json();

    // Format countries data
    const countries = restCountriesData.map((country: any) => ({
      name: country.cca2,
      description: `${country.name.common} ${country.flag}`,
      fullName: country.name.common
    }));

    // Common exchange mappings
    const exchanges = [
      { name: 'NYSE', description: 'New York Stock Exchange', fullName: 'New York Stock Exchange' },
      { name: 'NASDAQ', description: 'NASDAQ Stock Market', fullName: 'NASDAQ Stock Market' },
      { name: 'AMEX', description: 'American Stock Exchange', fullName: 'NYSE American' },
      { name: 'TSX', description: 'Toronto Stock Exchange', fullName: 'Toronto Stock Exchange' },
      { name: 'LSE', description: 'London Stock Exchange', fullName: 'London Stock Exchange' }
    ];

    // Industry list
    const industries = [
      { name: 'Software', description: 'Software development and services' },
      { name: 'Banks', description: 'Banking and financial institutions' },
      { name: 'Healthcare', description: 'Healthcare services and products' },
      { name: 'Retail', description: 'Retail and consumer goods' },
      { name: 'Energy', description: 'Energy production and services' }
    ];

    // Financial metrics
    const metrics = [
      {
        category: "Valuation",
        metrics: [
          { id: "marketCap", name: "Market Cap", description: "Total market value of company's shares" },
          { id: "price", name: "Stock Price", description: "Current stock price" },
          { id: "beta", name: "Beta", description: "Stock's volatility compared to the market" }
        ]
      },
      {
        category: "Trading",
        metrics: [
          { id: "volume", name: "Volume", description: "Trading volume" },
          { id: "dividend", name: "Dividend Yield", description: "Annual dividend yield percentage" }
        ]
      },
      {
        category: "Type",
        metrics: [
          { id: "isEtf", name: "Is ETF", description: "Exchange Traded Fund" },
          { id: "isFund", name: "Is Fund", description: "Mutual Fund" },
          { id: "isActivelyTrading", name: "Actively Trading", description: "Currently active in trading" }
        ]
      }
    ];

    const formattedResponse = {
      countries,
      exchanges,
      industries,
      metrics: metrics.flatMap(category => 
        category.metrics.map(metric => ({
          ...metric,
          category: category.category
        }))
      )
    };

    console.log('Sending formatted response with counts:', {
      countriesCount: countries.length,
      exchangesCount: exchanges.length,
      industriesCount: industries.length,
      metricsCount: formattedResponse.metrics.length
    });

    return new Response(
      JSON.stringify(formattedResponse),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
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