export async function handleInstitutionalHolders(apiKey: string, symbol: string) {
  console.log('Fetching institutional holders for:', symbol);
  
  const url = `https://financialmodelingprep.com/api/v4/institutional-ownership/institutional-holders/symbol-ownership-percent?symbol=${symbol}&apikey=${apiKey}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Institutional holders data fetched successfully');
    return data;
  } catch (error) {
    console.error('Error fetching institutional holders:', error);
    throw error;
  }
}