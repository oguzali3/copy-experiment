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
import { useRef, useEffect } from "react";
import { useSearch } from "@/hooks/useSearch";

interface CompanySearchProps {
  onCompanySelect: (company: any) => void;
}

export const CompanySearch = ({ onCompanySelect }: CompanySearchProps) => {
  const {
    searchQuery,
    setSearchQuery,
    results,
    isLoading,
    isOpen,
    setIsOpen
  } = useSearch();

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsOpen]);

  const handleSelect = (company: any) => {
    onCompanySelect({
      ticker: company.symbol,
      name: company.name,
    });
    setSearchQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={searchContainerRef}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput 
          placeholder="Search companies..." 
          value={searchQuery}
          onValueChange={(value) => {
            setSearchQuery(value);
            setIsOpen(true);
          }}
        />
        {isOpen && (searchQuery.length > 0 || isLoading) && (
          <CommandList>
            {isLoading && (
              <CommandEmpty>Searching...</CommandEmpty>
            )}
            {!isLoading && searchQuery.length < 2 && (
              <CommandEmpty>Type at least 2 characters to search...</CommandEmpty>
            )}
            {!isLoading && searchQuery.length >= 2 && results.length === 0 && (
              <CommandEmpty>No companies found.</CommandEmpty>
            )}
            {results.length > 0 && (
              <CommandGroup heading="Companies">
                {results.map((company) => (
                  <CommandItem
                    key={company.symbol}
                    onSelect={() => handleSelect(company)}
                    className="flex items-center px-4 py-2 hover:bg-accent cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium">{company.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {company.symbol} {company.exchangeShortName ? `• ${company.exchangeShortName}` : ''}
                        </p>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  );
};