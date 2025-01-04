import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useInsiderRoster(ticker: string) {
  return useQuery({
    queryKey: ['insider-roster', ticker],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'insider-roster', symbol: ticker }
      });
      if (error) throw error;
      return data;
    },
    enabled: !!ticker
  });
}

export function useInsiderTrades(ticker: string) {
  return useQuery({
    queryKey: ['insider-trades', ticker],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'insider-trades', symbol: ticker }
      });
      if (error) throw error;
      return data;
    },
    enabled: !!ticker
  });
}

export function useInstitutionalHolders(ticker: string) {
  return useQuery({
    queryKey: ['institutional-holders', ticker],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'institutional-holders', symbol: ticker }
      });
      if (error) throw error;
      return data;
    },
    enabled: !!ticker
  });
}