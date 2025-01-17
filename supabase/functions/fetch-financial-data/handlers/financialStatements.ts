import { corsHeaders } from '../utils/cors.ts';

export async function handleFinancialStatements(apiKey: string, symbol: string, endpoint: string, period: string = 'annual') {
  try {
    console.log(`Fetching ${endpoint} for ${symbol} with period ${period}`);
    const url = `https://financialmodelingprep.com/api/v3/${endpoint}/${symbol}?period=${period}&apikey=${apiKey}`;
    console.log('Requesting URL:', url);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    // For quarterly data, limit to last 20 quarters
    const limitedData = period === 'quarter' 
      ? data.slice(0, 20)  // Take only the last 20 quarters
      : data;

    console.log(`Received ${endpoint} data:`, limitedData);
    return new Response(JSON.stringify(limitedData), {
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