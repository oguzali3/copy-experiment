export async function handleInsiderRoster(symbol: string, apiKey: string): Promise<any[]> {
  const response = await fetch(
    `https://financialmodelingprep.com/api/v4/insider-roaster?symbol=${symbol}&apikey=${apiKey}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch insider roster: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function handleInsiderTrades(symbol: string, apiKey: string): Promise<any[]> {
  const response = await fetch(
    `https://financialmodelingprep.com/api/v4/insider-trading?symbol=${symbol}&page=0&apikey=${apiKey}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch insider trades: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function handleInstitutionalHolders(symbol: string, apiKey: string): Promise<any[]> {
  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  
  const response = await fetch(
    `https://financialmodelingprep.com/api/v4/institutional-ownership/institutional-holders/symbol-ownership-percent?symbol=${symbol}&date=${formattedDate}&apikey=${apiKey}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch institutional holders: ${response.statusText}`);
  }
  
  return await response.json();
}