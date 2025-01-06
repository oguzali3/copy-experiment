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
        description: "Measure of stock volatility relative to market"
      },
      {
        id: "volume",
        name: "Trading Volume",
        category: "Trading",
        description: "Average daily trading volume"
      },
      {
        id: "dividendYield",
        name: "Dividend Yield",
        category: "Income",
        description: "Annual dividend yield percentage"
      }
    ];

    return new Response(
      JSON.stringify({ metrics }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      },
    )
  }
})