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
    const apiKey = Deno.env.get('FMP_API_KEY');
    if (!apiKey) {
      throw new Error('FMP API key not configured');
    }

    // Fetch data in parallel
    const [countriesResponse, sectorsResponse, exchangesResponse, industriesResponse, restCountriesResponse] = await Promise.all([
      fetch(`https://financialmodelingprep.com/api/v3/get-all-countries?apikey=${apiKey}`),
      fetch(`https://financialmodelingprep.com/api/v3/sectors-list?apikey=${apiKey}`),
      fetch(`https://financialmodelingprep.com/api/v3/exchanges-list?apikey=${apiKey}`),
      fetch(`https://financialmodelingprep.com/api/v3/industries-list?apikey=${apiKey}`),
      fetch('https://restcountries.com/v3.1/all?fields=cca2,name,flag')
    ]);

    const [countriesData, sectorsData, exchangesData, industriesData, restCountriesData] = await Promise.all([
      countriesResponse.json(),
      sectorsResponse.json(),
      exchangesResponse.json(),
      industriesResponse.json(),
      restCountriesResponse.json()
    ]);

    console.log('Data fetched successfully');

    // Create country code to name mapping
    const countryMap = new Map(
      restCountriesData.map((country: any) => [
        country.cca2,
        {
          name: country.cca2,
          description: `${country.name.common} ${country.flag}`,
          fullName: country.name.common
        }
      ])
    );

    // Exchange mappings (commonly used exchanges)
    const exchangeMap = new Map([
      ['NYSE', { name: 'NYSE', description: 'New York Stock Exchange', fullName: 'New York Stock Exchange' }],
      ['NASDAQ', { name: 'NASDAQ', description: 'NASDAQ Stock Market', fullName: 'NASDAQ Stock Market' }],
      ['AMEX', { name: 'AMEX', description: 'American Stock Exchange', fullName: 'NYSE American' }],
      ['TSX', { name: 'TSX', description: 'Toronto Stock Exchange', fullName: 'Toronto Stock Exchange' }],
      ['LSE', { name: 'LSE', description: 'London Stock Exchange', fullName: 'London Stock Exchange' }],
      ['EURONEXT', { name: 'EURONEXT', description: 'Euronext', fullName: 'Euronext' }],
      ['HKSE', { name: 'HKSE', description: 'Hong Kong Stock Exchange', fullName: 'Hong Kong Stock Exchange' }],
      ['SSE', { name: 'SSE', description: 'Shanghai Stock Exchange', fullName: 'Shanghai Stock Exchange' }],
      ['SZSE', { name: 'SZSE', description: 'Shenzhen Stock Exchange', fullName: 'Shenzhen Stock Exchange' }],
      ['JPX', { name: 'JPX', description: 'Japan Exchange Group', fullName: 'Japan Exchange Group' }],
      ['ASX', { name: 'ASX', description: 'Australian Securities Exchange', fullName: 'Australian Securities Exchange' }],
      ['BSE', { name: 'BSE', description: 'Bombay Stock Exchange', fullName: 'Bombay Stock Exchange' }],
      ['NSE', { name: 'NSE', description: 'National Stock Exchange of India', fullName: 'National Stock Exchange of India' }],
      ['SIX', { name: 'SIX', description: 'Swiss Exchange', fullName: 'SIX Swiss Exchange' }],
      ['KRX', { name: 'KRX', description: 'Korea Exchange', fullName: 'Korea Exchange' }],
      ['SGX', { name: 'SGX', description: 'Singapore Exchange', fullName: 'Singapore Exchange' }],
      ['BVB', { name: 'BVB', description: 'Bucharest Stock Exchange', fullName: 'Bucharest Stock Exchange' }],
      ['BME', { name: 'BME', description: 'Bolsas y Mercados Españoles', fullName: 'Spanish Stock Exchange' }],
      ['FSX', { name: 'FSX', description: 'Frankfurt Stock Exchange', fullName: 'Frankfurt Stock Exchange' }],
      ['OSE', { name: 'OSE', description: 'Oslo Stock Exchange', fullName: 'Oslo Stock Exchange' }]
    ]);

    // Format the response data
    const formattedCountries = Array.from(countriesData).map((code: string) => {
      const countryInfo = countryMap.get(code) || {
        name: code,
        description: `Country code: ${code}`,
        fullName: code
      };
      return countryInfo;
    });

    const formattedExchanges = Array.from(exchangesData).map((code: string) => {
      const exchangeInfo = exchangeMap.get(code) || {
        name: code,
        description: `Exchange code: ${code}`,
        fullName: code
      };
      return exchangeInfo;
    });

    // Define available metrics for screening
    const metrics = [
      {
        category: "Market Data",
        metrics: [
          { id: "marketCap", name: "Market Cap", description: "Total market value of company's shares" },
          { id: "price", name: "Price", description: "Current stock price" },
          { id: "volume", name: "Volume", description: "Trading volume" },
          { id: "beta", name: "Beta", description: "Stock's volatility compared to the market" },
          { id: "dividendYield", name: "Dividend Yield", description: "Annual dividend yield percentage" }
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
      countries: formattedCountries,
      industries: Array.isArray(industriesData) ? industriesData.map((industry: string) => ({
        name: industry,
        description: `Companies in the ${industry} industry`
      })) : [],
      exchanges: formattedExchanges
    };

    console.log('Sending formatted response with counts:', {
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
