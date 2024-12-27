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
import { useState } from "react";
import { Button } from "./ui/button";

const companies = [
  { name: "Apple Inc.", ticker: "AAPL", logo: "🍎" },
  { name: "Microsoft Corporation", ticker: "MSFT", logo: "🪟" },
  { name: "NVIDIA Corporation", ticker: "NVDA", logo: "🎮" },
  { name: "Alphabet Inc.", ticker: "GOOGL", logo: "🔍" },
  { name: "Amazon.com, Inc.", ticker: "AMZN", logo: "📦" },
  { name: "Meta Platforms, Inc.", ticker: "META", logo: "👥" },
  { name: "Tesla, Inc.", ticker: "TSLA", logo: "🚗" },
  { name: "Berkshire Hathaway Inc.", ticker: "BRK.A", logo: "💰" },
  { name: "JPMorgan Chase & Co.", ticker: "JPM", logo: "🏦" },
  { name: "Johnson & Johnson", ticker: "JNJ", logo: "💊" },
];

interface CompanySearchProps {
  onCompanySelect: (company: any) => void;
}

export const CompanySearch = ({ onCompanySelect }: CompanySearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <Button 
        variant="outline" 
        className="w-full justify-start text-left font-normal"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span>Search companies...</span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput 
            placeholder="Search companies..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No companies found.</CommandEmpty>
            <CommandGroup heading="Companies">
              {filteredCompanies.map((company) => (
                <CommandItem
                  key={company.ticker}
                  onSelect={() => {
                    onCompanySelect(company);
                    setSearchQuery("");
                    setOpen(false);
                  }}
                  className="flex items-center px-4 py-2 hover:bg-accent cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{company.logo}</span>
                    <div>
                      <p className="text-sm font-medium">{company.name}</p>
                      <p className="text-xs text-muted-foreground">{company.ticker}</p>
                    </div>
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
