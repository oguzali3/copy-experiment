import { corsHeaders } from '../utils/cors.ts';

export async function handleSearch(apiKey: string, query: string) {
  try {
    console.log('Handling search request for query:', query);
    
    const searchUrl = `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(query)}&limit=10&apikey=${apiKey}`;
    console.log('Fetching from URL:', searchUrl);
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Received search results:', data);
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in handleSearch:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        context: 'Search handler failed'
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}