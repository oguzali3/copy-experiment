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
  return (
    <div className="relative w-full">
      <Command className="rounded-lg border shadow-md">
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 shrink-0 opacity-50" />
          <CommandInput placeholder="Search companies..." className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50" />
        </div>
        <CommandList>
          <CommandEmpty>No companies found.</CommandEmpty>
          <CommandGroup heading="Available Companies">
            {additionalCompanies.map((company) => (
              <CommandItem
                key={company.ticker}
                onSelect={() => onCompanySelect(company)}
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
    </div>
  );
};