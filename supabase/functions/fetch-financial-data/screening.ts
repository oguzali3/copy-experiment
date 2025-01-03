import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

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

  try {
    console.log('Building query with criteria:', criteria);
    let query = supabase
      .from('stocks')
      .select('*');

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
    if (criteria.countries && criteria.countries.length > 0) {
      const countryFilters = criteria.countries.map(country => `country.ilike.%${country}%`);
      query = query.or(countryFilters.join(','));
    }

    // Apply industry filters
    if (criteria.industries && criteria.industries.length > 0) {
      const industryFilters = criteria.industries.map(industry => `industry.ilike.%${industry}%`);
      query = query.or(industryFilters.join(','));
    }

    // Apply exchange filters
    if (criteria.exchanges && criteria.exchanges.length > 0) {
      const exchangeFilters = criteria.exchanges.map(exchange => `exchange.ilike.%${exchange}%`);
      query = query.or(exchangeFilters.join(','));
    }

    // Add pagination
    query = query
      .order('market_cap', { ascending: false })
      .range(start, end);

    console.log('Executing query...');
    const { data: results, error, count } = await query;

    if (error) {
      console.error('Screening error:', error);
      throw error;
    }

    console.log(`Found ${count} results, returning page ${criteria.page}`);
    console.log('Sample results:', results?.slice(0, 2));

    return {
      data: results || [],
      page: criteria.page,
      hasMore: (count || 0) > end + 1
    };
  } catch (error) {
    console.error('Error in handleScreening:', error);
    throw error;
  }
}