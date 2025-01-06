import { SearchItem } from "./types";

export const filterSearchItems = (
  items: SearchItem[],
  searchQuery: string,
  type: "countries" | "industries" | "exchanges" | "metrics"
): SearchItem[] => {
  const searchTerm = searchQuery.toLowerCase().trim();
  
  if (!searchTerm) return items;
  
  return items.filter(item => {
    if (!item) return false;
    
    const name = (item.name || '').toLowerCase();
    const fullName = (item.fullName || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    const category = (item.category || '').toLowerCase();

    // Basic search matches
    const matchesName = name.includes(searchTerm);
    const matchesFullName = fullName.includes(searchTerm);
    const matchesDescription = description.includes(searchTerm);
    const matchesCategory = type === "metrics" && category.includes(searchTerm);

    // Special handling for countries and exchanges
    if (type === "countries" || type === "exchanges") {
      return (
        name.includes(searchTerm) || // Partial code match
        fullName.includes(searchTerm) || // Full name match
        matchesDescription
      );
    }

    return matchesName || matchesFullName || matchesDescription || matchesCategory;
  });
};

export const getDisplayName = (item: SearchItem, type: "countries" | "industries" | "exchanges" | "metrics"): string => {
  if (type === "countries" || type === "exchanges") {
    return `${item.name} - ${item.fullName || item.name}`;
  }
  return item.name;
};

export const getPlaceholderText = (type: "countries" | "industries" | "exchanges" | "metrics", isLoading: boolean): string => {
  if (isLoading) return "Loading...";
  
  switch (type) {
    case "countries":
      return "Search countries...";
    case "industries":
      return "Search industries...";
    case "exchanges":
      return "Search exchanges...";
    case "metrics":
      return "Search metrics...";
    default:
      return "Search...";
  }
};