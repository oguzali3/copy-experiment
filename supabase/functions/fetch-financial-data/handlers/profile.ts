import { corsHeaders } from '../utils/cors.ts';

export async function handleProfile(apiKey: string, symbol: string) {
  console.log('Handling profile request for:', symbol);
  
  try {
    const url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`;
    console.log('Fetching profile from URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Error fetching profile:', response.status, response.statusText);
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Profile data received:', data);
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in handleProfile:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}