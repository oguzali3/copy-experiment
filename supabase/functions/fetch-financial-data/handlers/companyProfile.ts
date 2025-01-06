import { createClient } from "npm:@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function handleCompanyProfile(apiKey: string, symbol: string) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch data from FMP API
    const url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`;
    console.log(`Fetching company profile from: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from FMP API');
    }

    // Transform and store data
    const profiles = data.map(profile => ({
      symbol: profile.symbol,
      name: profile.companyName,
      exchange: profile.exchange,
      currency: profile.currency,
      country: profile.country,
      sector: profile.sector,
      industry: profile.industry,
      fulltimeemployees: profile.fullTimeEmployees,
      description: profile.description,
      ceo: profile.ceo,
      website: profile.website,
      image: profile.image,
      ipodate: profile.ipoDate,
    }));

    // Store in database
    if (profiles.length > 0) {
      const { error: insertError } = await supabase
        .from('company_profiles')
        .upsert(profiles, {
          onConflict: 'symbol'
        });

      if (insertError) {
        console.error('Error storing company profile:', insertError);
        throw insertError;
      }

      console.log(`Successfully stored company profile for ${symbol}`);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error in handleCompanyProfile for ${symbol}:`, error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}