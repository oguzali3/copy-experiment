
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
    name: "Income Statement",
    metrics: [
      { id: "revenue", name: "Revenue", description: "Company's total revenue" },
      { id: "revenueGrowth", name: "Revenue Growth", description: "Year-over-year revenue growth (%)" },
      { id: "grossProfit", name: "Gross Profit", description: "Revenue minus cost of goods sold" },
      { id: "operatingIncome", name: "Operating Income", description: "Profit from operations" },
      { id: "netIncome", name: "Net Income", description: "Total earnings or profit" },
      { id: "ebitda", name: "EBITDA", description: "Earnings before interest, taxes, depreciation, and amortization" }
    ]
  },
  {
    name: "Balance Sheet",
    metrics: [
      { id: "totalAssets", name: "Total Assets", description: "Sum of all assets" },
      { id: "totalLiabilities", name: "Total Liabilities", description: "Sum of all liabilities" },
      { id: "totalEquity", name: "Total Equity", description: "Net worth of the company" }
    ]
  },
  {
    name: "Cash Flow",
    metrics: [
      { id: "operatingCashFlow", name: "Operating Cash Flow", description: "Cash from operating activities" },
      { id: "investingCashFlow", name: "Investing Cash Flow", description: "Cash used in investing activities" },
      { id: "financingCashFlow", name: "Financing Cash Flow", description: "Cash from financing activities" },
      { id: "freeCashFlow", name: "Free Cash Flow", description: "Operating cash flow minus capital expenditures" }
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
        className="w-full justify-start text-left font-normal dark:bg-[#2b2b35] dark:border-gray-700 dark:text-gray-200"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span>Search metrics...</span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-md dark:bg-[#2b2b35] dark:border-gray-700">
          <CommandInput 
            placeholder="Search metrics..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="dark:bg-[#2b2b35] dark:text-gray-200"
          />
          <CommandList className="dark:bg-[#2b2b35]">
            <CommandEmpty className="dark:text-gray-400">No metrics found.</CommandEmpty>
            {filteredCategories.map((category) => (
              <CommandGroup key={category.name} heading={category.name} className="dark:text-gray-300">
                {category.metrics.map((metric) => (
                  <CommandItem
                    key={metric.id}
                    className="flex items-center px-4 py-2 hover:bg-accent cursor-pointer dark:hover:bg-gray-800"
                    onSelect={() => handleMetricSelect(metric.id)}
                  >
                    <div>
                      <p className="text-sm font-medium dark:text-gray-200">{metric.name}</p>
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
