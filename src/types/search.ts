// src/types/search.ts
export interface SearchItem {
    id?: string;
    name?: string;
    description?: string;
    category?: string;
    fullName?: string;
    field?: string;
  }
  
  export interface SearchResultProps {
    item: SearchItem;
    type: "metrics";
    onSelect: (item: SearchItem) => void;
  }
  
  export interface MetricItem extends SearchItem {
    id: string;
    name: string;
    field: string;
    description: string;
    category?: string;
  }