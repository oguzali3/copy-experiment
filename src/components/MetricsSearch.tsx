import { Search } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState } from "react";
import { Button } from "./ui/button";

const metrics = [
  { name: "Market Cap", description: "Total value of all shares" },
  { name: "P/E Ratio", description: "Price to earnings ratio" },
  { name: "EPS", description: "Earnings per share" },
  { name: "Revenue", description: "Total revenue" },
  { name: "Net Income", description: "Total profit" },
  { name: "Debt/Equity", description: "Total debt relative to equity" },
  { name: "ROE", description: "Return on equity" },
  { name: "Dividend Yield", description: "Annual dividend per share" },
  { name: "Beta", description: "Stock volatility vs market" },
  { name: "52W High", description: "52-week high price" },
];

export const MetricsSearch = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full">
      <Button 
        variant="outline" 
        className="w-full justify-start text-left font-normal"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span>Search metrics...</span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Search metrics..." />
          <CommandList>
            <CommandEmpty>No metrics found.</CommandEmpty>
            <CommandGroup heading="Available Metrics">
              {metrics.map((metric) => (
                <CommandItem
                  key={metric.name}
                  className="flex items-center px-4 py-2 hover:bg-accent cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium">{metric.name}</p>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
};