import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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
  return (
    <div className="relative w-full">
      <Command className="rounded-lg border shadow-md">
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 shrink-0 opacity-50" />
          <CommandInput placeholder="Search metrics..." className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50" />
        </div>
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
    </div>
  );
};