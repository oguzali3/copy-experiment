import { corsHeaders } from '../utils';

export async function handleTranscriptDates(apiKey: string, symbol: string) {
  const url = `https://financialmodelingprep.com/api/v4/earning_call_transcript?symbol=${symbol}&apikey=${apiKey}`;
  console.log('Fetching transcript dates from URL:', url);
  const response = await fetch(url);
  return await response.json();
}

export async function handleTranscript(apiKey: string, symbol: string, year: string, quarter: string) {
  if (!year || !quarter) {
    throw new Error("Year and quarter are required for transcript endpoint");
  }
  const url = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${symbol}?year=${year}&quarter=${quarter}&apikey=${apiKey}`;
  console.log('Fetching transcript from URL:', url);
  const response = await fetch(url);
  return await response.json();
}