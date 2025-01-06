import React from "react";
import { CommandItem } from "@/components/ui/command";
import { getDisplayName } from "./searchUtils";
import { SearchResultProps } from "./types";

export const SearchResult = ({ item, type, onSelect }: SearchResultProps) => {
  const handleClick = () => {
    try {
      onSelect(item);
    } catch (error) {
      console.error('Error selecting item:', error);
    }
  };

  return (
    <CommandItem
      key={type === "metrics" ? item.id : item.name}
      onSelect={handleClick}
      className="flex flex-col items-start px-4 py-2 hover:bg-accent cursor-pointer"
    >
      <p className="text-sm font-medium">{getDisplayName(item, type)}</p>
      <p className="text-xs text-muted-foreground">
        {type === "metrics" ? item.category : item.description}
      </p>
    </CommandItem>
  );
};