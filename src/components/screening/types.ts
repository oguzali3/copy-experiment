export interface SearchItem {
  name: string;
  description: string;
  category?: string;
  id?: string;
  fullName?: string;
}

export interface SearchResultProps {
  item: SearchItem;
  type: "countries" | "industries" | "exchanges" | "metrics";
  onSelect: (item: SearchItem) => void;
}