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

const categories = [
  {
    name: "Popular Selections",
    metrics: [
      { name: "EPS Diluted", description: "Earnings per share on a diluted basis" },
      { name: "Total Revenues", description: "Total company revenue" },
      { name: "Diluted EPS 10Y CAGR", description: "10-year compound annual growth rate of diluted EPS" },
      { name: "Diluted EPS 5Y CAGR", description: "5-year compound annual growth rate of diluted EPS" },
      { name: "Diluted EPS 3Y CAGR", description: "3-year compound annual growth rate of diluted EPS" },
    ]
  },
  {
    name: "Income Statement",
    metrics: [
      { name: "Revenue", description: "Company's total revenue" },
      { name: "Gross Profit", description: "Revenue minus cost of goods sold" },
      { name: "Operating Income", description: "Profit from operations" },
      { name: "Net Income", description: "Total earnings or profit" },
    ]
  },
  {
    name: "Balance Sheet",
    metrics: [
      { name: "Total Assets", description: "Sum of all assets" },
      { name: "Total Liabilities", description: "Sum of all liabilities" },
      { name: "Shareholders Equity", description: "Net worth of the company" },
    ]
  },
  {
    name: "Cash Flow Statement",
    metrics: [
      { name: "Operating Cash Flow", description: "Cash from operating activities" },
      { name: "Free Cash Flow", description: "Operating cash flow minus capital expenditures" },
      { name: "Capital Expenditure", description: "Funds used to acquire or upgrade assets" },
    ]
  },
  {
    name: "Ratios",
    metrics: [
      { name: "Forward P/E", description: "Price to earnings ratio using forecasted earnings" },
      { name: "Forward EV/Sales", description: "Enterprise value to sales ratio using forecasted sales" },
      { name: "Forward EV/FCF", description: "Enterprise value to free cash flow using forecasts" },
    ]
  }
];

export const MetricsSearch = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.map(category => ({
    ...category,
    metrics: category.metrics.filter(metric =>
      metric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metric.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.metrics.length > 0);

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
          <CommandInput 
            placeholder="Search metrics..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No metrics found.</CommandEmpty>
            {filteredCategories.map((category) => (
              <CommandGroup key={category.name} heading={category.name}>
                {category.metrics.map((metric) => (
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
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
};