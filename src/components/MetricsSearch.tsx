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
    name: "Valuation Metrics",
    metrics: [
      { id: "market_cap", name: "Market Cap", description: "Total market value of company" },
      { id: "pe_ratio", name: "P/E Ratio", description: "Price to earnings ratio" },
      { id: "price_to_book", name: "P/B Ratio", description: "Price to book ratio" },
      { id: "ev_to_ebitda", name: "EV/EBITDA", description: "Enterprise value to EBITDA" }
    ]
  },
  {
    name: "Growth Metrics",
    metrics: [
      { id: "revenue_growth_ttm", name: "Revenue Growth (TTM)", description: "Trailing twelve months revenue growth" },
      { id: "revenue_growth_3y", name: "Revenue Growth (3Y)", description: "3-year revenue growth rate" },
      { id: "eps_growth_ttm", name: "EPS Growth (TTM)", description: "Trailing twelve months EPS growth" },
      { id: "eps_growth_3y", name: "EPS Growth (3Y)", description: "3-year EPS growth rate" }
    ]
  },
  {
    name: "Profitability",
    metrics: [
      { id: "gross_margin", name: "Gross Margin", description: "Gross profit margin" },
      { id: "operating_margin", name: "Operating Margin", description: "Operating profit margin" },
      { id: "net_margin", name: "Net Margin", description: "Net profit margin" },
      { id: "roe", name: "ROE", description: "Return on equity" },
      { id: "roa", name: "ROA", description: "Return on assets" }
    ]
  },
  {
    name: "Financial Health",
    metrics: [
      { id: "current_ratio", name: "Current Ratio", description: "Current assets / Current liabilities" },
      { id: "debt_to_equity", name: "Debt to Equity", description: "Total debt / Total equity" },
      { id: "interest_coverage", name: "Interest Coverage", description: "EBIT / Interest expenses" }
    ]
  },
  {
    name: "Dividend Metrics",
    metrics: [
      { id: "dividend_yield", name: "Dividend Yield", description: "Annual dividend yield" },
      { id: "payout_ratio", name: "Payout Ratio", description: "Dividend payout ratio" }
    ]
  }
];

interface MetricsSearchProps {
  onMetricSelect: (metricId: string) => void;
}

export const MetricsSearch = ({ onMetricSelect }: MetricsSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.map(category => ({
    ...category,
    metrics: category.metrics.filter(metric =>
      metric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metric.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.metrics.length > 0);

  const handleMetricSelect = (metricId: string) => {
    onMetricSelect(metricId);
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
                    key={metric.id}
                    className="flex items-center px-4 py-2 hover:bg-accent cursor-pointer"
                    onSelect={() => handleMetricSelect(metric.id)}
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