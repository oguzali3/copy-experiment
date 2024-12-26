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

const additionalCompanies = [
  { name: "UnitedHealth", ticker: "UNH", marketCap: "445B", price: "521.63", change: "+0.75%", isPositive: true },
  { name: "Johnson & Johnson", ticker: "JNJ", marketCap: "421B", price: "156.74", change: "-0.32%", isPositive: false },
  { name: "Walmart", ticker: "WMT", marketCap: "418B", price: "157.96", change: "+1.15%", isPositive: true },
  { name: "Mastercard", ticker: "MA", marketCap: "412B", price: "425.82", change: "+0.91%", isPositive: true },
  { name: "Procter & Gamble", ticker: "PG", marketCap: "387B", price: "145.28", change: "-0.45%", isPositive: false },
];

interface CompanySearchProps {
  onCompanySelect: (company: any) => void;
}

export const CompanySearch = ({ onCompanySelect }: CompanySearchProps) => {
  const [open, setOpen] = useState(false);

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
          <CommandInput placeholder="Search companies..." />
          <CommandList>
            <CommandEmpty>No companies found.</CommandEmpty>
            <CommandGroup heading="Available Companies">
              {additionalCompanies.map((company) => (
                <CommandItem
                  key={company.ticker}
                  onSelect={() => {
                    onCompanySelect(company);
                    setOpen(false);
                  }}
                  className="flex items-center px-4 py-2 hover:bg-accent cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium">{company.name}</p>
                    <p className="text-xs text-muted-foreground">{company.ticker}</p>
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