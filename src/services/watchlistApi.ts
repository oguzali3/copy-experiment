/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/watchlistApi.ts
import axios from 'axios';
import { 
  Watchlist, 
  WatchlistStock, 
} from '../types/watchlist';
import { AddStockRequest, CreateWatchlistRequest, MetricInfo, UpdateWatchlistRequest } from '@/components/watchlist/types';
import apiClient from '@/utils/apiClient'; // Import the shared apiClient
import { getUserData } from '@/services/auth.service'; // Import getUserData from auth service

// Request deduplication system (similar to portfolioApi)
const pendingRequests = new Map<string, Promise<any>>();
const requestCache = new Map<string, {data: any, timestamp: number}>();
const CACHE_TTL = 10000; // 10 seconds cache lifetime

// Helper to create cache key from request details
const createCacheKey = (endpoint: string, params?: any) => {
  return `${endpoint}${params ? '_' + JSON.stringify(params) : ''}`;
};

// Deduplicate and cache GET requests
// Improved dedupGet function for watchlistApi.ts
const dedupGet = async <T>(endpoint: string, params?: any): Promise<T> => {
    // Add timestamp to prevent browser caching on page refresh
    const paramsWithTimestamp = { 
      ...params, 
      _t: Date.now() // Add timestamp to URL 
    };
    
    const cacheKey = createCacheKey(endpoint, params);
    const now = Date.now();
    
    // Check if there's already an in-flight request
    const pendingRequest = pendingRequests.get(cacheKey);
    if (pendingRequest) {
      console.log(`[Request dedup] Reusing in-flight request for ${cacheKey}`);
      return pendingRequest;
    }
    
    // Check if we have a valid cached response
    const cached = requestCache.get(cacheKey);
    if (cached && (now - cached.timestamp < CACHE_TTL)) {
      // Only use cache if it contains actual data
      if (cached.data && 
          ((Array.isArray(cached.data) && cached.data.length > 0) || 
           (!Array.isArray(cached.data) && Object.keys(cached.data).length > 0))) {
        console.log(`[Cache hit] Using cached response for ${cacheKey}`);
        return cached.data as T;
      } else {
        // Don't use empty cached responses
        console.log(`[Cache invalid] Cached response for ${cacheKey} is empty, fetching fresh data`);
        requestCache.delete(cacheKey);
      }
    }
    
    // Create a new request with the timestamped params
    const requestPromise = (async () => {
      try {
        const response = await apiClient.get<T>(endpoint, { 
          params: paramsWithTimestamp,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        // Only cache non-empty responses
        if (response.data && 
            ((Array.isArray(response.data) && response.data.length > 0) || 
             (!Array.isArray(response.data) && Object.keys(response.data).length > 0))) {
          requestCache.set(cacheKey, { data: response.data, timestamp: now });
        } else {
          console.log(`[Empty response] Not caching empty response for ${cacheKey}`);
        }
        
        return response.data;
      } finally {
        // Remove from pending requests when done
        pendingRequests.delete(cacheKey);
      }
    })();
    
    // Store the promise
    pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  };

// Create an API request queue to prevent multiple concurrent requests
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;

  public async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.process();
    });
  }

  private async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Request error:', error);
        }
      }
    }

    this.processing = false;
  }
}

// Create request queue instance
const requestQueue = new RequestQueue();

// Function to clear all caches
export function clearWatchlistCaches() {
  console.log('Clearing ALL watchlist-related caches');
  
  // Log all keys being cleared for debugging
  console.log('Cache keys being cleared:', Array.from(requestCache.keys()));
  
  // Clear the ENTIRE cache
  requestCache.clear();
  
  // Clear all in-flight requests too
  console.log('Pending requests being cleared:', Array.from(pendingRequests.keys()));
  pendingRequests.clear();
  
  console.log('Cache and pending requests completely cleared');
}

export function invalidateWatchlistCache(watchlistId: string) {
  const keysToInvalidate: string[] = [];
  
  // Find all cache keys related to this watchlist
  Array.from(requestCache.keys()).forEach(key => {
    if (key.includes(`/watchlists/${watchlistId}/`) || key === `/watchlists/${watchlistId}`) {
      keysToInvalidate.push(key);
    }
  });
  
  // Delete the cached data
  keysToInvalidate.forEach(key => {
    console.log(`[Cache] Invalidating ${key}`);
    requestCache.delete(key);
  });
}

class WatchlistService {
  // Get all watchlists for the current user
  async getWatchlists(): Promise<Watchlist[]> {
    // Use a consistent cache key regardless of timestamp
    const cacheKey = '/watchlists_user_data';
    
    // Check if there's already an in-flight request
    const pendingRequest = pendingRequests.get(cacheKey);
    if (pendingRequest) {
      console.log(`[Request dedup] Reusing in-flight watchlists request`);
      return pendingRequest;
    }
    
    const requestPromise = requestQueue.add(async () => {
      try {
        // Get current user ID from auth service
        const userData = getUserData();
        const userId = userData?.id;

        if (!userId) {
          console.warn('No user ID found, auth might not be initialized');
          return [];
        }

        const response = await apiClient.get<Watchlist[]>('/watchlists', {
          params: {
            userId: userId,
            _t: Date.now() // Add timestamp to prevent browser caching
          },
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        // Only cache non-empty responses
        if (response.data.length > 0) {
          requestCache.set(cacheKey, { 
            data: response.data, 
            timestamp: Date.now() 
          });
        } else {
          // Clear the cache if we got an empty response
          requestCache.delete(cacheKey);
        }
        
        return response.data;
      } catch (error) {
        console.error('Error fetching watchlists:', error);
        // Clear cache on error
        requestCache.delete(cacheKey);
        throw error;
      } finally {
        // Remove from pending requests when done
        pendingRequests.delete(cacheKey);
      }
    });
    
    // Store the promise with a fixed key
    pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }
  
  // Get a specific watchlist by ID
  async getWatchlistById(id: string): Promise<Watchlist> {
    return requestQueue.add(async () => {
      try {
        const response = await apiClient.get<Watchlist>(`/watchlists/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching watchlist ${id}:`, error);
        throw error;
      }
    });
  }
  
  // Fixed createWatchlist method for watchlistApi.ts
async createWatchlist(data: CreateWatchlistRequest): Promise<Watchlist> {
    return requestQueue.add(async () => {
      try {
        // Get current user ID from auth service
        const userData = getUserData();
        const userId = userData?.id;
  
        if (!userId) {
          console.error('User ID is missing. User data:', userData);
          throw new Error('Authentication required: Please sign in again to create a watchlist');
        }
  
        // Include the userId in the request
        // IMPORTANT: Always initialize selectedMetrics as an empty array, not an empty string
        const requestData = {
          ...data,
          userId,
          selectedMetrics: data.selectedMetrics || []  // Ensure this is always an array
        };
  
        console.log('Creating watchlist with data:', requestData);
  
        const response = await apiClient.post<Watchlist>('/watchlists', requestData);
        // Clear caches after creating
        clearWatchlistCaches();
        return response.data;
      } catch (error: any) {
        console.error('Error creating watchlist:', error);
        
        // Add better error handling
        if (error.response?.status === 500 && 
            error.response?.data?.message?.includes('malformed array literal')) {
          throw new Error('Error creating watchlist: There was a problem with the data format. Please try again.');
        }
        
        throw error;
      }
    });
  }
  
  // Update a watchlist
  async updateWatchlist(id: string, data: UpdateWatchlistRequest): Promise<Watchlist> {
    return requestQueue.add(async () => {
      try {
        const response = await apiClient.put<Watchlist>(`/watchlists/${id}`, data);
        // Invalidate cache for this watchlist
        invalidateWatchlistCache(id);
        return response.data;
      } catch (error) {
        console.error(`Error updating watchlist ${id}:`, error);
        throw error;
      }
    });
  }
  
  // Delete a watchlist
  async deleteWatchlist(id: string): Promise<void> {
    return requestQueue.add(async () => {
      try {
        await apiClient.delete(`/watchlists/${id}`);
        // Clear caches after deleting
        clearWatchlistCaches();
      } catch (error) {
        console.error(`Error deleting watchlist ${id}:`, error);
        throw error;
      }
    });
  }
  
  // Add a stock to a watchlist
  async addStock(watchlistId: string, data: AddStockRequest): Promise<WatchlistStock> {
    return requestQueue.add(async () => {
      try {
        const response = await apiClient.post<WatchlistStock>(`/watchlists/${watchlistId}/stocks`, data);
        // Invalidate cache for this watchlist
        invalidateWatchlistCache(watchlistId);
        return response.data;
      } catch (error) {
        console.error(`Error adding stock to watchlist ${watchlistId}:`, error);
        throw error;
      }
    });
  }
  
  // Delete a stock from a watchlist
  async deleteStock(watchlistId: string, ticker: string): Promise<void> {
    return requestQueue.add(async () => {
      try {
        await apiClient.delete(`/watchlists/${watchlistId}/stocks/${ticker}`);
        // Invalidate cache for this watchlist
        invalidateWatchlistCache(watchlistId);
      } catch (error) {
        console.error(`Error deleting stock ${ticker} from watchlist ${watchlistId}:`, error);
        throw error;
      }
    });
  }
  
  // Update the selected metrics for a watchlist
  async updateMetrics(watchlistId: string, metrics: string[]): Promise<Watchlist> {
    return requestQueue.add(async () => {
      try {
        const response = await apiClient.put<Watchlist>(`/watchlists/${watchlistId}/metrics`, { metrics });
        // Invalidate cache for this watchlist
        invalidateWatchlistCache(watchlistId);
        return response.data;
      } catch (error) {
        console.error(`Error updating metrics for watchlist ${watchlistId}:`, error);
        throw error;
      }
    });
  }
  
  // Refresh all metrics for a watchlist
  async refreshMetrics(watchlistId: string): Promise<Watchlist> {
    return requestQueue.add(async () => {
      try {
        const response = await apiClient.post<Watchlist>(`/watchlists/${watchlistId}/refresh`);
        // Invalidate cache for this watchlist
        invalidateWatchlistCache(watchlistId);
        return response.data;
      } catch (error) {
        console.error(`Error refreshing metrics for watchlist ${watchlistId}:`, error);
        throw error;
      }
    });
  }
  
  // Light refresh for a watchlist (less expensive operation)
  async lightRefreshWatchlist(watchlistId: string): Promise<Watchlist> {
    try {
      // Add cache-busting timestamp and headers
      const params = { _t: Date.now() };
      const headers = {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      console.log(`Performing light refresh for watchlist ${watchlistId}`);
      
      // Make the request with cache busting
      const response = await apiClient.get<Watchlist>(
        `/watchlists/${watchlistId}/light-refresh`,
        { params, headers }
      );
      
      // Store in a special cache key for immediate use
      const cacheKey = `light_refresh_${watchlistId}`;
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error light refreshing watchlist:', error);
      throw error;
    }
  }
  
  // Get all available metrics
  async getAvailableMetrics(): Promise<MetricInfo[]> {
    return requestQueue.add(async () => {
      try {
        const response = await apiClient.get<MetricInfo[]>('/watchlists/metrics/available');
        return response.data;
      } catch (error) {
        console.error('Error fetching available metrics:', error);
        throw error;
      }
    });
  }

  async getMetricsByCategory(): Promise<Array<{
    category: string;
    metrics: Array<{ id: string; name: string; description: string }>;
  }>> {
    return requestQueue.add(async () => {
      try {
        const response = await apiClient.get<Array<{
          category: string;
          metrics: Array<{ id: string; name: string; description: string }>;
        }>>('/watchlists/metrics/categorized');
        return response.data;
      } catch (error) {
        console.error('Error fetching categorized metrics:', error);
        throw error;
      }
    });
  }
}

export const watchlistService = new WatchlistService();

