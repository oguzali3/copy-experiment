import { corsHeaders } from '../utils/cors.ts';

export async function syncCompanyProfiles(apiKey: string, supabase: any) {
  console.log('Starting bulk fetch of company profiles...');
  
  try {
    // Fetch bulk company profiles
    const profilesUrl = `https://financialmodelingprep.com/api/v4/profile-bulk?apikey=${apiKey}`;
    const profilesResponse = await fetch(profilesUrl);
    
    if (!profilesResponse.ok) {
      throw new Error(`HTTP error! status: ${profilesResponse.status}`);
    }
    
    const profilesData = await profilesResponse.json();
    console.log(`Fetched ${profilesData.length} company profiles`);
    
    if (Array.isArray(profilesData) && profilesData.length > 0) {
      // Transform the data to match our schema
      const transformedProfiles = profilesData.map(profile => ({
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

      // Batch insert/update profiles
      const batchSize = 100;
      for (let i = 0; i < transformedProfiles.length; i += batchSize) {
        const batch = transformedProfiles.slice(i, i + batchSize);
        const { error } = await supabase
          .from('company_profiles')
          .upsert(batch, { 
            onConflict: 'symbol',
            ignoreDuplicates: false 
          });

        if (error) {
          console.error('Error inserting batch:', error);
          throw error;
        }
        console.log(`Inserted/updated batch ${i/batchSize + 1} of ${Math.ceil(transformedProfiles.length/batchSize)}`);
      }

      return {
        success: true,
        count: profilesData.length,
        message: `Successfully synced ${profilesData.length} company profiles`
      };
    }
    
    return {
      success: false,
      count: 0,
      message: 'No company profiles found in the response'
    };

  } catch (error) {
    console.error('Error in syncCompanyProfiles:', error);
    throw error;
  }
}