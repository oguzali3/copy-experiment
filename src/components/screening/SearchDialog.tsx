import React from "react";
import {
  Command,
  CommandDialog as Dialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { SearchResult } from "./SearchResult";
import { SearchItem } from "./types";
import { getPlaceholderText } from "./searchUtils";
import { useSearch } from "./SearchProvider";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "countries" | "industries" | "exchanges" | "metrics";
  onSelect: (item: SearchItem) => void;
}

export const SearchDialog = ({ 
  open, 
  onOpenChange, 
  type,
  onSelect 
}: SearchDialogProps) => {
  const { loading, searchQuery, setSearchQuery, filteredItems } = useSearch();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput
          placeholder={getPlaceholderText(type, loading)}
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {filteredItems.map((item) => (
              <SearchResult
                key={`${item.name}-${item.id || ''}`}
                item={item}
                type={type}
                onSelect={onSelect}
              />
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </Dialog>
  );
};