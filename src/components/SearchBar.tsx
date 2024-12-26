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

const stocksData = [
  { name: "Apple Inc.", ticker: "AAPL", price: "182.52", change: "+1.25", changePercent: "+0.69", marketCap: "2.85T", summary: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide." },
  { name: "Microsoft", ticker: "MSFT", price: "420.45", change: "+2.80", changePercent: "+0.67", marketCap: "3.12T", summary: "Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide." },
  { name: "Amazon", ticker: "AMZN", price: "178.15", change: "-1.20", changePercent: "-0.67", marketCap: "1.85T", summary: "Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions worldwide." },
  { name: "Alphabet", ticker: "GOOGL", price: "147.68", change: "+0.85", changePercent: "+0.58", marketCap: "1.87T", summary: "Alphabet Inc. provides various products and platforms in the United States, Europe, the Middle East, Africa, and internationally." },
  { name: "Meta", ticker: "META", price: "505.95", change: "+4.20", changePercent: "+0.84", marketCap: "1.28T", summary: "Meta Platforms, Inc. engages in the development of social media applications." }
];

interface SearchBarProps {
  onStockSelect: (stock: any) => void;
}

export const SearchBar = ({ onStockSelect }: SearchBarProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStocks = stocksData.filter(stock => 
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <Command className="rounded-lg border shadow-md">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <CommandInput 
            placeholder="Search stocks..." 
            onFocus={() => setOpen(true)}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
        </div>
        <CommandList>
          <CommandEmpty>No stocks found.</CommandEmpty>
          {open && searchQuery && (
            <CommandGroup heading="Stocks">
              {filteredStocks.map((stock) => (
                <CommandItem
                  key={stock.ticker}
                  onSelect={() => {
                    onStockSelect(stock);
                    setOpen(false);
                    setSearchQuery("");
                  }}
                  className="flex items-center px-4 py-2 hover:bg-accent cursor-pointer"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{stock.name}</p>
                    <p className="text-xs text-muted-foreground">{stock.ticker}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${stock.price}</p>
                    <p className={`text-xs ${parseFloat(stock.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stock.change} ({stock.changePercent}%)
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </div>
  );
};