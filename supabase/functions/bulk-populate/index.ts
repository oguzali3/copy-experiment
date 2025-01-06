import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('FMP_API_KEY')
    if (!apiKey) {
      throw new Error('FMP_API_KEY is required')
    }

    console.log('Starting bulk population of company profiles...')

    // Fetch company profiles in smaller chunks
    const exchanges = ['NASDAQ', 'NYSE'];
    let allProfiles = [];
    
    for (const exchange of exchanges) {
      console.log(`Fetching profiles for ${exchange}...`);
      const response = await fetch(
        `https://financialmodelingprep.com/api/v4/profile/all?exchange=${exchange}&apikey=${apiKey}`
      );
      
      if (!response.ok) {
        console.error(`Error fetching ${exchange} profiles:`, response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const profiles = await response.json();
      console.log(`Fetched ${profiles.length} profiles from ${exchange}`);
      allProfiles = [...allProfiles, ...profiles];
      
      // Add delay between API calls to avoid rate limiting
      await delay(1000);
    }

    console.log(`Total profiles fetched: ${allProfiles.length}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are required')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Clear existing data in smaller chunks
    console.log('Clearing existing company profiles...');
    const { error: deleteError } = await supabase
      .from('company_profiles')
      .delete()
      .neq('symbol', '');
    
    if (deleteError) {
      console.error('Error clearing existing data:', deleteError);
      throw deleteError;
    }
    
    console.log('Cleared existing company profiles');

    // Transform and insert profiles in smaller batches
    const batchSize = 50; // Reduced batch size
    const transformedProfiles = allProfiles.map((profile: any) => ({
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
      updated_at: new Date().toISOString()
    }));

    let successCount = 0;
    for (let i = 0; i < transformedProfiles.length; i += batchSize) {
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(transformedProfiles.length/batchSize)}`);
      
      const batch = transformedProfiles.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('company_profiles')
        .insert(batch);
      
      if (insertError) {
        console.error('Error inserting batch:', insertError);
        throw insertError;
      }
      
      successCount += batch.length;
      console.log(`Successfully inserted batch ${Math.floor(i/batchSize) + 1}`);
      
      // Add small delay between batches to prevent resource exhaustion
      await delay(500);
    }

    console.log(`Completed! Inserted ${successCount} company profiles`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully populated ${successCount} company profiles`,
        count: successCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})