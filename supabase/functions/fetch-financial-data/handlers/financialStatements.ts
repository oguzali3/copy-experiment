import { corsHeaders } from '../utils/cors.ts';

export async function handleFinancialStatements(apiKey: string, symbol: string, endpoint: string) {
  console.log('Handling financial statements request:', { symbol, endpoint });
  
  const ttmUrl = endpoint === 'income-statement' 
    ? `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?period=quarter&limit=4&apikey=${apiKey}`
    : `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?period=quarter&limit=4&apikey=${apiKey}`;
  
  const ttmResponse = await fetch(ttmUrl);
  const ttmData = await ttmResponse.json();
  
  const ttm = endpoint === 'income-statement'
    ? ttmData.reduce((acc: any, quarter: any) => {
        Object.keys(quarter).forEach(key => {
          if (typeof quarter[key] === 'number') {
            acc[key] = (acc[key] || 0) + quarter[key];
          }
        });
        return acc;
      }, { period: 'TTM', symbol, date: new Date().toISOString() })
    : { ...ttmData[0], period: 'TTM' };

  const annualUrl = endpoint === 'income-statement'
    ? `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?limit=10&apikey=${apiKey}`
    : `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?limit=10&apikey=${apiKey}`;
  
  const annualResponse = await fetch(annualUrl);
  const annualData = await annualResponse.json();

  const combinedData = [ttm, ...annualData];
  
  return new Response(JSON.stringify(combinedData), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}