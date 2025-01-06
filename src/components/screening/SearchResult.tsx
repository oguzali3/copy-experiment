import React from "react";
import { CommandItem } from "@/components/ui/command";
import { getDisplayName } from "./searchUtils";
import { SearchResultProps } from "./types";

export const SearchResult = ({ item, type, onSelect }: SearchResultProps) => {
  return (
    <CommandItem
      key={type === "metrics" ? item.id : item.name}
      onSelect={() => onSelect(item)}
      className="flex flex-col items-start px-4 py-2 hover:bg-accent cursor-pointer"
    >
      <p className="text-sm font-medium">{getDisplayName(item, type)}</p>
      <p className="text-xs text-muted-foreground">
        {type === "metrics" ? item.category : item.description}
      </p>
    </CommandItem>
  );
};