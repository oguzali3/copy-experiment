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
import { getScreeningData } from "@/utils/screeningCache";

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
        if (type === "metrics") {
          const { data, error } = await supabase.functions.invoke('fetch-screening-filters');
          if (error) throw error;
          if (data?.metrics) {
            setItems(data.metrics);
          }
        } else {
          const cachedData = await getScreeningData();
          switch (type) {
            case "countries":
              setItems(cachedData.countries.map(country => country.name));
              break;
            case "industries":
              setItems(cachedData.industries.map(industry => industry.name));
              break;
            case "exchanges":
              setItems(cachedData.exchanges.map(exchange => exchange.name));
              break;
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  const filteredItems = type === "metrics"
    ? (items as ScreeningMetric[]).filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : (items as string[]).filter(item =>
        typeof item === 'string' && item.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSelect = (item: string | ScreeningMetric) => {
    if (type === "metrics" && onMetricSelect) {
      const metric = item as ScreeningMetric;
      onMetricSelect({
        id: metric.id,
        name: metric.name,
        category: metric.category,
        min: "",
        max: ""
      });
    } else if (onSelect) {
      const value = typeof item === "string" ? item : item.name;
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
            ? "Select & search metrics"
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
              {filteredItems.map((item) => {
                const itemValue = typeof item === "string" ? item : item.name;
                return (
                  <CommandItem
                    key={typeof item === "string" ? item : item.id}
                    onSelect={() => handleSelect(item)}
                    className="flex items-center px-4 py-2 hover:bg-accent cursor-pointer"
                  >
                    {type === "metrics" ? (
                      <div>
                        <p className="text-sm font-medium">
                          {(item as ScreeningMetric).name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(item as ScreeningMetric).category}
                        </p>
                      </div>
                    ) : (
                      <span>{itemValue}</span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
};