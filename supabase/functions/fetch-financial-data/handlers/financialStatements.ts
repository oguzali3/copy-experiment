// handlers/financialStatements.ts
import { corsHeaders } from '../utils/cors.ts';

export async function handleFinancialStatements(apiKey: string, symbol: string, endpoint: string, period: string = 'annual') {
  try {
    console.log(`Fetching ${endpoint} for ${symbol} with period deneme ${period}`);
    
    // Map FMP endpoints to your local API endpoints
    const endpointMap = {
      'income-statement': 'income-statement',
      'balance-sheet-statement': 'balance-sheet',
      'cash-flow-statement': 'cash-flow'
    };

    const mappedEndpoint = endpointMap[endpoint];
    
    // Use your local NestJS API for financial statements
    const url = `http://localhost:4000/api/analysis/${mappedEndpoint}/${symbol}?period=${period}`;
    console.log('Requesting URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      // If local API fails, fallback to FMP
      console.log('Local API failed, falling back to FMP');
      const fmpUrl = `https://financialmodelingprep.com/api/v3/${endpoint}/${symbol}?period=${period}&apikey=${apiKey}`;
      const fmpResponse = await fetch(fmpUrl);
      const fmpData = await fmpResponse.json();
      
      // For quarterly data, limit to last 20 quarters
      const limitedData = period === 'quarter'
        ? fmpData.slice(0, 20)
        : fmpData;

      return new Response(JSON.stringify(limitedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log(`Received ${endpoint} data:`, data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in handleFinancialStatements:', error);
    
    // If local API fails completely, fallback to FMP
    try {
      console.log('Error with local API, falling back to FMP');
      const fmpUrl = `https://financialmodelingprep.com/api/v3/${endpoint}/${symbol}?period=${period}&apikey=${apiKey}`;
      const fmpResponse = await fetch(fmpUrl);
      const fmpData = await fmpResponse.json();
      
      const limitedData = period === 'quarter'
        ? fmpData.slice(0, 20)
        : fmpData;

      return new Response(JSON.stringify(limitedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (fmpError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
}