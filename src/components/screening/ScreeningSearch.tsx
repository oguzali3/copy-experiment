import React, { useState } from "react";
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
import { ScreeningMetric } from "@/types/screening";
import { SearchItem } from "./types";
import { SearchResult } from "./SearchResult";
import { filterSearchItems, getPlaceholderText } from "./searchUtils";
import { METRICS_CONFIG } from "@/constants/metrics";
import { COUNTRIES, EXCHANGES } from "@/constants/marketFilters";

interface ScreeningSearchProps {
  type: "countries" | "exchanges" | "metrics";
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

  // Get the appropriate items based on type
  const getItems = () => {
    switch (type) {
      case "countries":
        return COUNTRIES.map(country => ({
          name: country.code,
          fullName: country.name,
          description: country.region,
          category: country.region
        }));
      case "exchanges":
        return EXCHANGES.map(exchange => ({
          name: exchange.code,
          fullName: exchange.name,
          description: exchange.region,
          category: exchange.region
        }));
      case "metrics":
        return METRICS_CONFIG.flatMap(category => 
          category.metrics.map(metric => ({
            ...metric,
            category: category.category
          }))
        );
      default:
        return [];
    }
  };

  const items = getItems();
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
          field: item.field || item.id || '',
          table: item.table,
          min: "",
          max: ""
        });
      } else if (onSelect) {
        const value = item.name; // Use code for countries/exchanges
        if (selected.includes(value)) {
          onSelect(selected.filter(i => i !== value));
        } else {
          onSelect([...selected, value]);
        }
      }
      setOpen(false);
    } catch (error) {
      console.error('Error handling selection:', error);
    }
  };

  // Get placeholder text based on type
  const placeholder = type === "countries" 
    ? "Search by country name or code..." 
    : type === "exchanges"
    ? "Search by exchange name or code..."
    : "Search metrics...";

  // Group items by region for countries and exchanges
  const groupedItems = React.useMemo(() => {
    if (type === "metrics") {
      return METRICS_CONFIG;
    }

    const groups = filteredItems.reduce((acc, item) => {
      const region = item.category || 'Other';
      if (!acc[region]) acc[region] = [];
      acc[region].push(item);
      return acc;
    }, {} as Record<string, SearchItem[]>);

    return Object.entries(groups).map(([category, items]) => ({
      category,
      items
    }));
  }, [filteredItems, type]);

  return (
    <div className="relative w-full">
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span>{placeholder}</span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder={placeholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {groupedItems.map((group) => (
              <CommandGroup key={group.category} heading={group.category}>
                {(type === "metrics" ? group.metrics : group.items).map((item) => (
                  <SearchResult
                    key={item.id || item.name}
                    item={item}
                    type={type}
                    onSelect={handleSelect}
                  />
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
};