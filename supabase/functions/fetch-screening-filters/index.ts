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
      { id: "evToEbitda", name: "EV/EBITDA", description: "Enterprise value to EBITDA ratio" }
    ]
  },
  {
    category: "Growth",
    metrics: [
      { id: "revenueGrowth", name: "Revenue Growth", description: "Year-over-year revenue growth" },
      { id: "epsGrowth", name: "EPS Growth", description: "Year-over-year EPS growth" },
      { id: "profitGrowth", name: "Profit Growth", description: "Year-over-year profit growth" }
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
      { id: "interestCoverage", name: "Interest Coverage", description: "Operating income to interest expenses" }
    ]
  },
  {
    category: "Dividend",
    metrics: [
      { id: "dividendYield", name: "Dividend Yield", description: "Annual dividend yield percentage" },
      { id: "payoutRatio", name: "Payout Ratio", description: "Percentage of earnings paid as dividends" }
    ]
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Fetching screening filters...');
    
    return new Response(
      JSON.stringify({
        metrics: metrics.flatMap(category => 
          category.metrics.map(metric => ({
            ...metric,
            category: category.category
          }))
        )
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