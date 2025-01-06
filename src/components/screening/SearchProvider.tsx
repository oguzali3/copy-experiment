import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SearchItem, SearchItemSchema } from "./types";
import { toast } from "sonner";
import { filterSearchItems } from "./searchUtils";

interface SearchContextType {
  items: SearchItem[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredItems: SearchItem[];
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};

interface SearchProviderProps {
  children: React.ReactNode;
  type: "countries" | "industries" | "exchanges" | "metrics";
}

export const SearchProvider = ({ children, type }: SearchProviderProps) => {
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data for type:', type);
        const { data, error } = await supabase.functions.invoke('fetch-screening-filters');
        
        if (error) {
          console.error('Error fetching data:', error);
          toast.error(`Failed to fetch ${type}: ${error.message}`);
          setItems([]);
          return;
        }
        
        if (!data) {
          console.error('No data received from API');
          toast.error(`No ${type} data available`);
          setItems([]);
          return;
        }

        console.log('Received data:', data);
        
        let filteredItems: SearchItem[] = [];
        switch (type) {
          case "countries":
            filteredItems = data.countries || [];
            break;
          case "industries":
            filteredItems = data.industries || [];
            break;
          case "exchanges":
            filteredItems = data.exchanges || [];
            break;
          case "metrics":
            filteredItems = data.metrics || [];
            break;
          default:
            filteredItems = [];
        }

        // Validate items
        const validatedItems = filteredItems.filter(item => {
          try {
            SearchItemSchema.parse(item);
            return true;
          } catch (error) {
            console.error('Invalid item:', item, error);
            return false;
          }
        });

        setItems(validatedItems);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(`Failed to load ${type}`);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  const filteredItems = filterSearchItems(items, searchQuery, type);

  return (
    <SearchContext.Provider value={{ 
      items, 
      loading, 
      searchQuery, 
      setSearchQuery,
      filteredItems 
    }}>
      {children}
    </SearchContext.Provider>
  );
};