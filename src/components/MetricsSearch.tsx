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
      { id: "revenue", name: "Revenue", description: "Total revenue" },
      { id: "grossProfit", name: "Gross Profit", description: "Revenue minus cost of goods sold" },
      { id: "operatingIncome", name: "Operating Income", description: "Profit from operations" },
      { id: "netIncome", name: "Net Income", description: "Total earnings" },
      { id: "eps", name: "EPS", description: "Earnings per share" },
      { id: "ebitda", name: "EBITDA", description: "Earnings before interest, taxes, depreciation, and amortization" }
    ]
  },
  {
    name: "Balance Sheet",
    metrics: [
      { id: "totalAssets", name: "Total Assets", description: "Sum of all assets" },
      { id: "totalLiabilities", name: "Total Liabilities", description: "Sum of all liabilities" },
      { id: "totalEquity", name: "Total Equity", description: "Net worth" },
      { id: "cashAndEquivalents", name: "Cash & Equivalents", description: "Liquid assets" },
      { id: "totalDebt", name: "Total Debt", description: "Sum of all debt" }
    ]
  },
  {
    name: "Cash Flow",
    metrics: [
      { id: "operatingCashFlow", name: "Operating Cash Flow", description: "Cash from operations" },
      { id: "investingCashFlow", name: "Investing Cash Flow", description: "Cash from investments" },
      { id: "financingCashFlow", name: "Financing Cash Flow", description: "Cash from financing" },
      { id: "freeCashFlow", name: "Free Cash Flow", description: "Operating cash flow minus capital expenditures" }
    ]
  },
  {
    name: "Key Ratios",
    metrics: [
      { id: "peRatio", name: "P/E Ratio", description: "Price to earnings ratio" },
      { id: "pbRatio", name: "P/B Ratio", description: "Price to book ratio" },
      { id: "debtToEquity", name: "Debt to Equity", description: "Total debt divided by equity" },
      { id: "currentRatio", name: "Current Ratio", description: "Current assets divided by current liabilities" },
      { id: "quickRatio", name: "Quick Ratio", description: "Liquid assets divided by current liabilities" }
    ]
  },
  {
    name: "Growth Metrics",
    metrics: [
      { id: "revenueGrowth", name: "Revenue Growth", description: "Year-over-year revenue growth" },
      { id: "netIncomeGrowth", name: "Net Income Growth", description: "Year-over-year net income growth" },
      { id: "epsgrowth", name: "EPS Growth", description: "Year-over-year EPS growth" },
      { id: "fcfGrowth", name: "FCF Growth", description: "Year-over-year free cash flow growth" }
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
                    onSelect={() => {
                      onMetricSelect(metric.id);
                      setOpen(false);
                    }}
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