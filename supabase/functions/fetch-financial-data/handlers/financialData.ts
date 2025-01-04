export async function handleQuote(symbol: string, apiKey: string): Promise<any[]> {
  const response = await fetch(
    `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch quote: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function handleProfile(symbol: string, apiKey: string): Promise<any[]> {
  const response = await fetch(
    `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function handleIncomeStatement(symbol: string, apiKey: string): Promise<any[]> {
  const response = await fetch(
    `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?limit=4&apikey=${apiKey}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch income statement: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function handleBalanceSheet(symbol: string, apiKey: string): Promise<any[]> {
  const response = await fetch(
    `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?limit=4&apikey=${apiKey}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch balance sheet: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function handleCashFlow(symbol: string, apiKey: string): Promise<any[]> {
  const response = await fetch(
    `https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?limit=4&apikey=${apiKey}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch cash flow: ${response.statusText}`);
  }
  
  return await response.json();
}