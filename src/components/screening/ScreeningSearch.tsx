import React from "react";
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
import { useState } from "react";
import { ScreeningMetric } from "@/types/screening";

const countries = [
  "United States", "China", "Japan", "Germany", "United Kingdom",
  "France", "India", "Italy", "Canada", "South Korea"
];

const industries = [
  "Technology", "Healthcare", "Financial Services", "Consumer Goods",
  "Energy", "Materials", "Industrials", "Utilities", "Real Estate",
  "Communication Services", "Chemicals"
];

const exchanges = [
  "NYSE", "NASDAQ", "LSE", "TSE", "SSE", "IBSE",
  "HKEX", "Euronext", "Deutsche Börse", "BSE", "NSE"
];

const metrics = [
  { id: "revenue", name: "Revenue", category: "Income Statement" },
  { id: "revenueGrowth", name: "Revenue Growth", category: "Growth" },
  { id: "grossProfit", name: "Gross Profit", category: "Income Statement" },
  { id: "operatingIncome", name: "Operating Income", category: "Income Statement" },
  { id: "netIncome", name: "Net Income", category: "Income Statement" },
  { id: "ebitda", name: "EBITDA", category: "Income Statement" },
  { id: "totalAssets", name: "Total Assets", category: "Balance Sheet" },
  { id: "totalLiabilities", name: "Total Liabilities", category: "Balance Sheet" },
  { id: "totalEquity", name: "Total Equity", category: "Balance Sheet" },
  { id: "operatingCashFlow", name: "Operating Cash Flow", category: "Cash Flow" },
  { id: "freeCashFlow", name: "Free Cash Flow", category: "Cash Flow" },
];

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

  const getItems = () => {
    switch (type) {
      case "countries":
        return countries;
      case "industries":
        return industries;
      case "exchanges":
        return exchanges;
      case "metrics":
        return metrics;
      default:
        return [];
    }
  };

  const items = getItems();
  const filteredItems = type === "metrics"
    ? (items as typeof metrics).filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : (items as string[]).filter(item =>
        item.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSelect = (item: string | typeof metrics[0]) => {
    if (type === "metrics" && onMetricSelect) {
      const metric = item as typeof metrics[0];
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
          {type === "metrics"
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
                          {(item as typeof metrics[0]).name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(item as typeof metrics[0]).category}
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