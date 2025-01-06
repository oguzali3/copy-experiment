import { supabase } from "@/integrations/supabase/client";

interface CachedScreeningData {
  countries: string[];
  industries: string[];
  exchanges: string[];
  timestamp: number;
}

let cachedData: CachedScreeningData | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const getScreeningData = async () => {
  // Return cached data if it exists and is not expired
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData;
  }

  try {
    const { data, error } = await supabase.functions.invoke('fetch-screening-filters');
    
    if (error) throw error;
    
    if (data) {
      cachedData = {
        countries: data.countries,
        industries: data.industries,
        exchanges: data.exchanges,
        timestamp: Date.now()
      };
      return cachedData;
    }
  } catch (error) {
    console.error('Error fetching screening data:', error);
    throw error;
  }
};