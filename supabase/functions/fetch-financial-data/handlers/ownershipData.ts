export async function handleInstitutionalHolders(symbol: string, apiKey: string): Promise<any[]> {
  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  
  console.log(`Fetching institutional holders for ${symbol}`);
  
  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v4/institutional-ownership/institutional-holders/symbol-ownership?symbol=${symbol}&date=${formattedDate}&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      console.error(`Error fetching institutional holders: ${response.statusText}`);
      throw new Error(`Failed to fetch institutional holders: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched institutional holders for ${symbol}`);
    return data;
  } catch (error) {
    console.error(`Error in handleInstitutionalHolders: ${error.message}`);
    throw error;
  }
}

export async function handleInsiderRoster(symbol: string, apiKey: string): Promise<any[]> {
  console.log(`Fetching insider roster for ${symbol}`);
  
  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v4/insider-roaster?symbol=${symbol}&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      console.error(`Error fetching insider roster: ${response.statusText}`);
      throw new Error(`Failed to fetch insider roster: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched insider roster for ${symbol}`);
    return data;
  } catch (error) {
    console.error(`Error in handleInsiderRoster: ${error.message}`);
    throw error;
  }
}

export async function handleInsiderTrades(symbol: string, apiKey: string): Promise<any[]> {
  console.log(`Fetching insider trades for ${symbol}`);
  
  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v4/insider-trading?symbol=${symbol}&page=0&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      console.error(`Error fetching insider trades: ${response.statusText}`);
      throw new Error(`Failed to fetch insider trades: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched insider trades for ${symbol}`);
    return data;
  } catch (error) {
    console.error(`Error in handleInsiderTrades: ${error.message}`);
    throw error;
  }
}