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

    // Mock data for other filters
    const countries = [
      { name: "US", fullName: "United States" },
      { name: "CA", fullName: "Canada" },
    ];

    const industries = [
      { name: "Technology" },
      { name: "Healthcare" },
    ];

    const exchanges = [
      { name: "NYSE", fullName: "New York Stock Exchange" },
      { name: "NASDAQ", fullName: "NASDAQ Stock Market" },
    ];

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
