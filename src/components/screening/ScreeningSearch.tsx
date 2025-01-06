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

interface SearchItem {
  name: string;
  description: string;
  category?: string;
  id?: string;
  fullName?: string;
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

  const filteredItems = items.filter(item => {
    if (!item) return false;
    
    const searchTerm = searchQuery.toLowerCase();
    const itemName = (item.name || '').toLowerCase();
    const itemDescription = (item.description || '').toLowerCase();
    const itemCategory = (item.category || '').toLowerCase();
    const itemFullName = (item.fullName || '').toLowerCase();

    // Enhanced search matching logic for both codes and full names
    const matchCode = itemName.includes(searchTerm);
    const matchFullName = itemFullName.includes(searchTerm);
    const matchDescription = itemDescription.includes(searchTerm);
    const matchCategory = type === "metrics" && itemCategory.includes(searchTerm);

    // For countries and exchanges, also search in the full name
    if (type === "countries" || type === "exchanges") {
      // Check if searching by country/exchange code
      const isExactCodeMatch = itemName.toLowerCase() === searchTerm;
      // Check if searching by full name
      const isFullNameMatch = itemFullName.toLowerCase().includes(searchTerm);
      // Check if searching by partial code
      const isPartialCodeMatch = itemName.toLowerCase().includes(searchTerm);
      
      return isExactCodeMatch || isFullNameMatch || isPartialCodeMatch || matchDescription;
    }

    return matchCode || matchFullName || matchDescription || matchCategory;
  });

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

  const getDisplayName = (item: SearchItem) => {
    if (type === "countries" || type === "exchanges") {
      return `${item.name} - ${item.fullName || item.name}`;
    }
    return item.name;
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
            <CommandGroup>
              {filteredItems.map((item, index) => (
                <CommandItem
                  key={type === "metrics" ? item.id : `${item.name}-${index}`}
                  onSelect={() => handleSelect(item)}
                  className="flex flex-col items-start px-4 py-2 hover:bg-accent cursor-pointer"
                >
                  <p className="text-sm font-medium">{getDisplayName(item)}</p>
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