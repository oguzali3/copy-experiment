import { SCREENING_CONSTANTS } from './screeningConstants';

interface CachedScreeningData {
  countries: typeof SCREENING_CONSTANTS.COUNTRIES;
  industries: typeof SCREENING_CONSTANTS.INDUSTRIES;
  exchanges: typeof SCREENING_CONSTANTS.EXCHANGES;
  timestamp: number;
}

let cachedData: CachedScreeningData | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const getScreeningData = async () => {
  // Return cached data if it exists and is not expired
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData;
  }

  // Use constant data instead of fetching from API
  cachedData = {
    countries: SCREENING_CONSTANTS.COUNTRIES,
    industries: SCREENING_CONSTANTS.INDUSTRIES,
    exchanges: SCREENING_CONSTANTS.EXCHANGES,
    timestamp: Date.now()
  };

  return cachedData;
};