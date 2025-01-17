import { corsHeaders } from '../utils/cors.ts';

export async function handleFinancialStatements(apiKey: string, symbol: string, endpoint: string) {
  try {
    const period = 'annual';
    console.log(`Fetching ${endpoint} for ${symbol}`);
    const url = `https://financialmodelingprep.com/api/v3/${endpoint}/${symbol}?period=${period}&apikey=${apiKey}`;
    console.log('Requesting URL:', url);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    console.log(`Received ${endpoint} data:`, data);
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in handleFinancialStatements:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}