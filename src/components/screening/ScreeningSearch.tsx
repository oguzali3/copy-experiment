import React, { useState, useEffect } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ScreeningMetric } from "@/types/screening";

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
  const [items, setItems] = useState<any[]>([]);
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
            setItems(Array.isArray(data.countries) ? data.countries : []);
            break;
          case "industries":
            setItems(Array.isArray(data.industries) ? data.industries : []);
            break;
          case "exchanges":
            setItems(Array.isArray(data.exchanges) ? data.exchanges : []);
            break;
          case "metrics":
            setItems(Array.isArray(data.metrics) ? data.metrics : []);
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

  const filteredItems = items.filter(item => {
    if (!item || typeof item !== 'object') {
      console.log('Invalid item:', item);
      return false;
    }
    
    const searchTerm = searchQuery.toLowerCase();
    if (type === "metrics") {
      return (
        (item.name?.toLowerCase() || '').includes(searchTerm) ||
        (item.category?.toLowerCase() || '').includes(searchTerm) ||
        (item.description?.toLowerCase() || '').includes(searchTerm)
      );
    } else {
      return (
        (item.name?.toLowerCase() || '').includes(searchTerm) ||
        (item.description?.toLowerCase() || '').includes(searchTerm)
      );
    }
  });

  const handleSelect = (item: any) => {
    if (!item || !item.name) return;

    if (type === "metrics" && onMetricSelect) {
      onMetricSelect({
        id: item.id,
        name: item.name,
        category: item.category,
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
        <span>
          {loading ? "Loading..." : type === "metrics"
            ? "Search metrics..."
            : `Search ${type}...`}
        </span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder={`Search ${type}...`}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {filteredItems.map((item) => (
                <CommandItem
                  key={type === "metrics" ? item.id : item.name}
                  onSelect={() => handleSelect(item)}
                  className="flex flex-col items-start px-4 py-2 hover:bg-accent cursor-pointer"
                >
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {type === "metrics" ? item.category : item.description}
                  </p>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
};