import { corsHeaders } from '../utils/cors.ts';

export async function handleFinancialStatements(apiKey: string, symbol: string, endpoint: string) {
  console.log('Handling financial statements request:', { symbol, endpoint });
  
  try {
    // Fetch TTM data (last 4 quarters)
    const ttmUrl = `https://financialmodelingprep.com/api/v3/${endpoint}/${symbol}?period=quarter&limit=4&apikey=${apiKey}`;
    console.log('Fetching TTM data from URL:', ttmUrl);
    
    const ttmResponse = await fetch(ttmUrl);
    if (!ttmResponse.ok) {
      throw new Error(`Failed to fetch TTM data: ${ttmResponse.statusText}`);
    }
    
    const ttmData = await ttmResponse.json();
    console.log('TTM data received:', ttmData);

    // Calculate TTM by summing last 4 quarters
    const ttm = ttmData.reduce((acc: any, quarter: any) => {
      Object.keys(quarter).forEach(key => {
        if (typeof quarter[key] === 'number') {
          acc[key] = (acc[key] || 0) + quarter[key];
        }
      });
      return acc;
    }, { period: 'TTM', symbol, date: new Date().toISOString() });

    // Fetch annual data
    const annualUrl = `https://financialmodelingprep.com/api/v3/${endpoint}/${symbol}?limit=10&apikey=${apiKey}`;
    console.log('Fetching annual data from URL:', annualUrl);
    
    const annualResponse = await fetch(annualUrl);
    if (!annualResponse.ok) {
      throw new Error(`Failed to fetch annual data: ${annualResponse.statusText}`);
    }
    
    const annualData = await annualResponse.json();
    console.log('Annual data received:', annualData);

    // Combine TTM with annual data
    const combinedData = [ttm, ...annualData];
    
    return new Response(JSON.stringify(combinedData), {
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