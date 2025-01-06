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
import { SearchItem } from "./types";
import { SearchResult } from "./SearchResult";
import { filterSearchItems, getPlaceholderText } from "./searchUtils";

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
          throw error;
        }
        
        if (!data) {
          console.error('No data received from API');
          setItems([]);
          return;
        }

        console.log('Received data:', data);
        
        switch (type) {
          case "countries":
            setItems(data.countries || []);
            break;
          case "industries":
            setItems(data.industries || []);
            break;
          case "exchanges":
            setItems(data.exchanges || []);
            break;
          case "metrics":
            setItems(data.metrics || []);
            break;
          default:
            setItems([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  const filteredItems = filterSearchItems(items, searchQuery, type);

  const handleSelect = (item: SearchItem) => {
    if (!item?.name) return;

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
              {filteredItems.map((item, index) => (
                <SearchResult
                  key={`${item.name}-${index}`}
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