// src/types/screening.ts

// src/types/screening.ts

export interface ScreeningMetric {
  id: string;
  name: string;
  category?: string;
  description?: string;
  field: string;
  table?: string;
  min?: string;
  max?: string;
}

// GraphQL specific types
export interface GraphQLScreeningFilter {
  table: 'COMPANY_PROFILES_DYNAMIC';
  field: string;
  operator: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS';
  value: string;
}

export interface GraphQLField {
  fieldName: string;
  value: string;
}

export interface GraphQLCompany {
  symbol: string;
  fields: GraphQLField[];
}

export interface GraphQLScreeningResponse {
  screenCompanies: GraphQLCompany[];
}

// Search related types
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
  type: "metrics" | "countries" | "industries" | "exchanges";
  onSelect: (item: SearchItem) => void;
}