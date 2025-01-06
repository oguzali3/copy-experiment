import React, { useState, useEffect } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ScreeningMetric } from "@/types/screening";
import { SearchItem, SearchItemSchema } from "./types";
import { SearchResult } from "./SearchResult";
import { filterSearchItems, getPlaceholderText } from "./searchUtils";
import { toast } from "sonner";

interface ScreeningSearchProps {
  type: "countries" | "industries" | "exchanges" | "metrics";
  selected?: string[];
  onSelect?: (selected: string[]) => void;
  onMetricSelect?: (metric: ScreeningMetric) => void;
}

export const ScreeningSearch = ({
  type,
  selected = [],
  onSelect,
  onMetricSelect
}: ScreeningSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleSelect = (item: SearchItem) => {
    try {
      if (!item?.name) {
        console.error('Invalid item selected:', item);
        return;
      }

      if (type === "metrics" && onMetricSelect) {
        onMetricSelect({
          id: item.id || '',
          name: item.name,
          category: item.category || '',
          min: "",
          max: ""
        });
      } else if (onSelect) {
        const value = item.name;
        if (selected.includes(value)) {
          onSelect(selected.filter(i => i !== value));
        } else {
          onSelect([...selected, value]);
        }
      }
      setOpen(false);
    } catch (error) {
      console.error('Error handling selection:', error);
      toast.error('Failed to select item');
    }
  };

  return (
    <div className="relative w-full">
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span>{getPlaceholderText(type, loading)}</span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder={getPlaceholderText(type, loading)}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {filteredItems.map((item) => (
                <SearchResult
                  key={`${item.name}-${item.id || ''}`}
                  item={item}
                  type={type}
                  onSelect={handleSelect}
                />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
};