import { SearchItem, SearchItemSchema } from "./types";

export const filterSearchItems = (
  items: SearchItem[],
  searchQuery: string,
  type: "countries" | "industries" | "exchanges" | "metrics"
): SearchItem[] => {
  try {
    console.log(`Filtering ${items.length} items for type: ${type}`);
    const searchTerm = searchQuery.toLowerCase().trim();
    
    if (!searchTerm) return items;
    
    return items.filter(item => {
      try {
        // Validate item structure
        const validatedItem = SearchItemSchema.parse(item);
        
        const searchableFields = {
          name: validatedItem.name.toLowerCase(),
          fullName: validatedItem.fullName?.toLowerCase() || '',
          description: validatedItem.description?.toLowerCase() || '',
          category: validatedItem.category?.toLowerCase() || ''
        };

        // Log search attempt for debugging
        console.log(`Searching item: ${JSON.stringify(searchableFields)}`);

        const matches = {
          name: searchableFields.name.includes(searchTerm),
          fullName: searchableFields.fullName.includes(searchTerm),
          description: searchableFields.description.includes(searchTerm),
          category: type === "metrics" && searchableFields.category.includes(searchTerm)
        };

        // Log matches for debugging
        console.log(`Matches for "${searchTerm}":`, matches);

        return Object.values(matches).some(match => match);
      } catch (error) {
        console.error('Invalid item structure:', item, error);
        return false;
      }
    });
  } catch (error) {
    console.error('Error filtering items:', error);
    return [];
  }
};

export const getDisplayName = (item: SearchItem, type: "countries" | "industries" | "exchanges" | "metrics"): string => {
  try {
    const validatedItem = SearchItemSchema.parse(item);
    
    if (type === "countries" || type === "exchanges") {
      return `${validatedItem.name} - ${validatedItem.fullName || validatedItem.name}`;
    }
    return validatedItem.name;
  } catch (error) {
    console.error('Error getting display name:', error);
    return 'Invalid Item';
  }
};

export const getPlaceholderText = (
  type: "countries" | "industries" | "exchanges" | "metrics",
  isLoading: boolean
): string => {
  if (isLoading) return "Loading...";
  
  const placeholders = {
    countries: "Search by country name or code...",
    industries: "Search industries...",
    exchanges: "Search by exchange name or code...",
    metrics: "Search metrics...",
  };

  return placeholders[type] || "Search...";
};