import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('FMP_API_KEY')
    if (!apiKey) {
      throw new Error('FMP_API_KEY is required')
    }

    console.log('Starting bulk population of company profiles...')

    // Fetch company profiles in bulk
    const response = await fetch(`https://financialmodelingprep.com/api/v4/profile-bulk?apikey=${apiKey}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const profiles = await response.json()
    console.log(`Fetched ${profiles.length} company profiles`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are required')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // First, clear existing data
    const { error: deleteError } = await supabase
      .from('company_profiles')
      .delete()
      .neq('symbol', '') // Delete all records
    
    if (deleteError) {
      throw deleteError
    }
    
    console.log('Cleared existing company profiles')

    // Transform and insert profiles in batches
    const batchSize = 100
    const transformedProfiles = profiles.map((profile: any) => ({
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
    }))

    let successCount = 0
    for (let i = 0; i < transformedProfiles.length; i += batchSize) {
      const batch = transformedProfiles.slice(i, i + batchSize)
      const { error: insertError } = await supabase
        .from('company_profiles')
        .insert(batch)
      
      if (insertError) {
        console.error('Error inserting batch:', insertError)
        throw insertError
      }
      
      successCount += batch.length
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(transformedProfiles.length/batchSize)}`)
    }

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
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})