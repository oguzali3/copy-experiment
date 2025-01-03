import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from './utils.ts'

interface ScreeningCriteria {
  metrics: Array<{
    id: string;
    min?: string;
    max?: string;
  }>;
  countries: string[];
  industries: string[];
  exchanges: string[];
  page: number;
}

export async function handleScreening(criteria: ScreeningCriteria) {
  console.log('Screening criteria:', criteria);
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const ITEMS_PER_PAGE = 50;
  const start = criteria.page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('stocks')
    .select();

  // Apply metric filters
  criteria.metrics.forEach(metric => {
    if (metric.min) {
      query = query.gte(metric.id, parseFloat(metric.min));
    }
    if (metric.max) {
      query = query.lte(metric.id, parseFloat(metric.max));
    }
  });

  // Apply country filters
  if (criteria.countries.length > 0) {
    query = query.in('country', criteria.countries);
  }

  // Apply industry filters
  if (criteria.industries.length > 0) {
    query = query.in('industry', criteria.industries);
  }

  // Apply exchange filters
  if (criteria.exchanges.length > 0) {
    query = query.in('exchange', criteria.exchanges);
  }

  // Add pagination
  query = query
    .order('market_cap', { ascending: false })
    .range(start, end);

  const { data: results, error, count } = await query;

  if (error) {
    console.error('Screening error:', error);
    throw error;
  }

  console.log(`Found ${count} results, returning page ${criteria.page}`);

  return {
    data: results || [],
    page: criteria.page,
    hasMore: (count || 0) > end + 1
  };
}