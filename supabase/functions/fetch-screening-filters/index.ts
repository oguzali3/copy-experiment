import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { SCREENING_CONSTANTS } from "../../../src/utils/screeningConstants.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScreeningCriteria {
  countries?: string[];
  industries?: string[];
  exchanges?: string[];
  metrics?: {
    id: string;
    min?: number;
    max?: number;
  }[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse the request body for filtering criteria
    const criteria: ScreeningCriteria = await req.json().catch(() => ({}));
    console.log('Received screening criteria:', criteria);

    // Filter stocks based on criteria
    let query = supabaseClient
      .from('stocks')
      .select('*');

    if (criteria.countries?.length) {
      const countryNames = SCREENING_CONSTANTS.COUNTRIES
        .filter(c => criteria.countries?.includes(c.code))
        .map(c => c.name);
      query = query.in('country', countryNames);
    }

    if (criteria.industries?.length) {
      const industryNames = SCREENING_CONSTANTS.INDUSTRIES
        .filter(i => criteria.industries?.includes(i.id))
        .map(i => i.name);
      query = query.in('industry', industryNames);
    }

    if (criteria.exchanges?.length) {
      const exchangeCodes = SCREENING_CONSTANTS.EXCHANGES
        .filter(e => criteria.exchanges?.includes(e.code))
        .map(e => e.code);
      query = query.in('exchange', exchangeCodes);
    }

    // Apply metric filters
    if (criteria.metrics?.length) {
      criteria.metrics.forEach(metric => {
        if (metric.min !== undefined) {
          query = query.gte(metric.id, metric.min);
        }
        if (metric.max !== undefined) {
          query = query.lte(metric.id, metric.max);
        }
      });
    }

    const { data: stocksData, error: stocksError } = await query;

    if (stocksError) {
      console.error('Error fetching stocks data:', stocksError);
      throw new Error('Failed to fetch stocks data');
    }

    // Return the filtered data along with the constants
    const response = {
      stocks: stocksData,
      constants: {
        countries: SCREENING_CONSTANTS.COUNTRIES,
        industries: SCREENING_CONSTANTS.INDUSTRIES,
        exchanges: SCREENING_CONSTANTS.EXCHANGES
      }
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in fetch-screening-filters:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch filter data',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});