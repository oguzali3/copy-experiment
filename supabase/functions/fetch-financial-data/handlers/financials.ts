import { corsHeaders } from '../utils';

export async function handleFinancials(endpoint: string, apiKey: string, symbol: string) {
  let url;
  switch (endpoint) {
    case "profile":
      url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`;
      break;
    case "quote":
      url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`;
      break;
    default:
      throw new Error(`Unsupported financial endpoint: ${endpoint}`);
  }
  
  const response = await fetch(url);
  return await response.json();
}