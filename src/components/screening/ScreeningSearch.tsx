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
  availableMetrics?: ScreeningMetric[];
}

interface SearchItem {
  name: string;
  description?: string;  // Made optional with '?'
  category?: string;
  id?: string;
  fullName?: string;
}

export const ScreeningSearch = ({
  type,
  selected = [],
  onSelect,
  onMetricSelect,
  availableMetrics = []
}: ScreeningSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (type === 'metrics' && availableMetrics.length > 0) {
          setItems(availableMetrics);
          setLoading(false);
          return;
        }

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
  }, [type, availableMetrics]);

  const filteredItems = items.filter(item => {
    if (!item) return false;
    
    const searchTerm = searchQuery.toLowerCase();
    const itemName = (item.name || '').toLowerCase();
    const itemDescription = (item.description || '').toLowerCase();
    const itemCategory = (item.category || '').toLowerCase();
    const itemFullName = (item.fullName || '').toLowerCase();

    return itemName.includes(searchTerm) ||
           itemDescription.includes(searchTerm) ||
           itemCategory.includes(searchTerm) ||
           itemFullName?.includes(searchTerm);
  });

  const handleSelect = (item: SearchItem) => {
    if (!item?.name) return;

    if (type === "metrics" && onMetricSelect) {
      onMetricSelect({
        id: item.id || '',
        name: item.name,
        category: item.category || '',
        description: item.description,
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

  const getPlaceholderText = () => {
    if (loading) return "Loading...";
    switch (type) {
      case "countries":
        return "Search countries...";
      case "industries":
        return "Search industries...";
      case "exchanges":
        return "Search exchanges...";
      case "metrics":
        return "Search metrics...";
      default:
        return "Search...";
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
        <span>{getPlaceholderText()}</span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder={getPlaceholderText()}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {filteredItems.length > 0 && (
              <CommandGroup>
                {filteredItems.map((item, index) => (
                  <CommandItem
                    key={type === "metrics" ? item.id : `${item.name}-${index}`}
                    onSelect={() => handleSelect(item)}
                    className="flex flex-col items-start px-4 py-2 hover:bg-accent cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.category && (
                        <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-full">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
};