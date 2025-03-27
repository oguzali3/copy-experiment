// src/components/watchlist/types.ts
export interface MetricInfo {
    id: string;
    name: string;
    description: string;
  }
  
  // Request types for API calls
  export interface CreateWatchlistRequest {
    name: string;
    selectedMetrics?: string[];
  }
  
  export interface UpdateWatchlistRequest {
    name?: string;
    selectedMetrics?: string[];
  }
  
  export interface AddStockRequest {
    ticker: string;
    name: string;
    metrics?: Record<string, number | null>;
  }