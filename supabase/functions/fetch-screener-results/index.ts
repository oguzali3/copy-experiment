import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../fetch-financial-data/utils/cors.ts'

interface ScreenerParams {
  countries?: string[];
  industries?: string[];
  exchanges?: string[];
  metrics?: {
    id: string;
    min?: string;
    max?: string;
  }[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { countries, industries, exchanges, metrics } = await req.json() as ScreenerParams

    // Construct FMP API query parameters
    const queryParams = new URLSearchParams()
    queryParams.append('apikey', Deno.env.get('FMP_API_KEY') || '')

    // Add filters
    if (countries?.length) {
      queryParams.append('country', countries.join(','))
    }
    if (industries?.length) {
      queryParams.append('sector', industries.join(','))
    }
    if (exchanges?.length) {
      queryParams.append('exchange', exchanges.join(','))
    }

    // Add metric filters
    metrics?.forEach(metric => {
      if (metric.min) {
        queryParams.append(`${metric.id}MoreThan`, metric.min)
      }
      if (metric.max) {
        queryParams.append(`${metric.id}LowerThan`, metric.max)
      }
    })

    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/stock-screener?${queryParams.toString()}`
    )

    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    )
  }
})