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
    const apiKey = Deno.env.get('FMP_API_KEY')
    if (!apiKey) {
      throw new Error('FMP API key not configured')
    }

    // Fetch countries, industries, and exchanges from FMP API
    const [countriesRes, industriesRes, exchangesRes] = await Promise.all([
      fetch(`https://financialmodelingprep.com/api/v3/stock-screener?apikey=${apiKey}`),
      fetch(`https://financialmodelingprep.com/api/v3/stock-screener?apikey=${apiKey}`),
      fetch(`https://financialmodelingprep.com/api/v3/stock-screener?apikey=${apiKey}`)
    ]);

    const [countriesData, industriesData, exchangesData] = await Promise.all([
      countriesRes.json(),
      industriesRes.json(),
      exchangesRes.json()
    ]);

    // Extract unique values and format them
    const countries = [...new Set(countriesData.map((item: any) => item.country))]
      .filter(Boolean)
      .map(country => ({ name: country, fullName: country }));

    const industries = [...new Set(industriesData.map((item: any) => item.industry))]
      .filter(Boolean)
      .map(industry => ({ name: industry }));

    const exchanges = [...new Set(exchangesData.map((item: any) => item.exchange))]
      .filter(Boolean)
      .map(exchange => ({ name: exchange, fullName: exchange }));

    // Define available financial metrics
    const metrics = [
      {
        id: "marketCap",
        name: "Market Cap",
        category: "Valuation",
        description: "Total market value of a company's shares"
      },
      {
        id: "price",
        name: "Stock Price",
        category: "Trading",
        description: "Current stock price"
      },
      {
        id: "beta",
        name: "Beta",
        category: "Risk",
        description: "Measure of stock's volatility compared to the market"
      },
      {
        id: "volume",
        name: "Volume",
        category: "Trading",
        description: "Trading volume"
      },
      {
        id: "dividend",
        name: "Dividend Yield",
        category: "Income",
        description: "Annual dividend yield percentage"
      }
    ];

    console.log('Returning filters:', {
      countriesCount: countries.length,
      industriesCount: industries.length,
      exchangesCount: exchanges.length,
      metricsCount: metrics.length
    });

    return new Response(
      JSON.stringify({
        metrics,
        countries,
        industries,
        exchanges,
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