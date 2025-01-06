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
    
    // Using the correct bulk profile endpoint
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/stock/list?apikey=${apiKey}`
    );
    
    if (!response.ok) {
      console.error(`Error fetching profiles:`, response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const profiles = await response.json();
    console.log(`Fetched ${profiles.length} profiles`);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are required')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Clear only a limited set of existing records
    console.log('Clearing existing company profiles...');
    const { error: deleteError } = await supabase
      .from('company_profiles')
      .delete()
      .limit(100);
    
    if (deleteError) {
      console.error('Error clearing existing data:', deleteError);
      throw deleteError;
    }
    
    console.log('Cleared existing company profiles');
    await delay(2000); // Increased delay after delete operation

    // Transform and insert profiles in very small batches
    const batchSize = 10;
    const limitedProfiles = profiles.slice(0, 100); // Limit to first 100 records
    const transformedProfiles = limitedProfiles.map((profile: any) => ({
      symbol: profile.symbol,
      name: profile.name,
      exchange: profile.exchange,
      currency: 'USD', // Default since it's not in the basic endpoint
      country: 'US', // Default since it's not in the basic endpoint
      sector: null,
      industry: null,
      fulltimeemployees: null,
      description: null,
      ceo: null,
      website: null,
      image: null,
      ipodate: null,
      updated_at: new Date().toISOString()
    }));

    let successCount = 0;
    const totalBatches = Math.ceil(transformedProfiles.length/batchSize);
    
    for (let i = 0; i < transformedProfiles.length; i += batchSize) {
      const batchNumber = Math.floor(i/batchSize) + 1;
      console.log(`Processing batch ${batchNumber} of ${totalBatches}`);
      
      const batch = transformedProfiles.slice(i, i + batchSize);
      
      try {
        const { error: insertError } = await supabase
          .from('company_profiles')
          .insert(batch);
        
        if (insertError) {
          console.error(`Error inserting batch ${batchNumber}:`, insertError);
          throw insertError;
        }
        
        successCount += batch.length;
        console.log(`Successfully inserted batch ${batchNumber} (${successCount} total records)`);
        
        await delay(2000);
      } catch (error) {
        console.error(`Failed to process batch ${batchNumber}:`, error);
        await delay(3000);
        continue;
      }
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