import { corsHeaders } from '../utils/cors.ts';

export async function syncCompanyProfiles(apiKey: string, supabase: any) {
  console.log('Fetching company profiles...');
  const profilesUrl = `https://financialmodelingprep.com/api/v4/company-profile/bulk?apikey=${apiKey}`;
  const profilesResponse = await fetch(profilesUrl);
  const profilesData = await profilesResponse.json();
  
  if (Array.isArray(profilesData)) {
    const { error: profilesError } = await supabase
      .from('company_profiles')
      .upsert(profilesData.map(profile => ({
        symbol: profile.symbol,
        name: profile.companyName,
        exchange: profile.exchangeShortName,
        currency: profile.currency,
        country: profile.country,
        sector: profile.sector,
        industry: profile.industry,
        fulltimeemployees: profile.fullTimeEmployees,
        description: profile.description,
        ceo: profile.ceo,
        website: profile.website,
        image: profile.image,
        ipodate: profile.ipoDate
      })));

    if (profilesError) throw profilesError;
    return profilesData.length;
  }
  return 0;
}