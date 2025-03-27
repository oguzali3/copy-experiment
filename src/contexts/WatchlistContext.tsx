// src/contexts/WatchlistContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Watchlist, WatchlistStock } from "@/types/watchlist";
import { MetricInfo } from "@/components/watchlist/types";
import { watchlistService } from "@/services/watchlistApi";
import { isAuthenticated } from "@/services/auth.service";

// Define the categorized metrics type
interface MetricCategory {
  category: string;
  metrics: Array<{ id: string; name: string; description: string }>;
}

// Updated interface including categorizedMetrics
interface WatchlistContextType {
  watchlists: Watchlist[];
  selectedWatchlist: Watchlist | null;
  availableMetrics: MetricInfo[];
  categorizedMetrics: MetricCategory[]; // Added categorized metrics
  isLoading: boolean;
  authError: string | null;
  setSelectedWatchlist: (watchlist: Watchlist) => void;
  fetchWatchlists: () => Promise<void>;
  createWatchlist: (name: string) => Promise<Watchlist>;
  updateWatchlist: (watchlist: Watchlist) => Promise<Watchlist>;
  deleteWatchlist: (id: string) => Promise<void>;
  addStock: (stock: { ticker: string; name: string }) => Promise<WatchlistStock>;
  deleteStock: (ticker: string) => Promise<void>;
  refreshMetrics: () => Promise<Watchlist>;
  lightRefreshSelectedWatchlist: () => Promise<void>;
  addMetric: (metricId: string) => Promise<void>;
  removeMetric: (metricId: string) => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<Watchlist | null>(null);
  const [availableMetrics, setAvailableMetrics] = useState<MetricInfo[]>([]);
  const [categorizedMetrics, setCategorizedMetrics] = useState<MetricCategory[]>([]); // New state for categorized metrics
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Fetch available metrics
  const fetchAvailableMetrics = async () => {
    try {
      const metrics = await watchlistService.getAvailableMetrics();
      setAvailableMetrics(metrics);
    } catch (error) {
      console.error('Error fetching available metrics:', error);
      toast.error('Failed to load available metrics');
    }
  };
  
  // New function to fetch categorized metrics
  const fetchCategorizedMetrics = async () => {
    try {
      const metrics = await watchlistService.getMetricsByCategory();
      setCategorizedMetrics(metrics);
    } catch (error) {
      console.error('Error fetching categorized metrics:', error);
      toast.error('Failed to load metric categories');
    }
  };

  // Setup periodic refresh
  useEffect(() => {
    // Start periodic refresh if a watchlist is selected
    if (selectedWatchlist && !refreshInterval) {
      const interval = setInterval(() => {
        lightRefreshSelectedWatchlist();
      }, 60000); // Refresh every 60 seconds
      
      setRefreshInterval(interval);
    }
    
    // Cleanup on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    };
  }, [selectedWatchlist]);
  
  // Light refresh for the selected watchlist
  const lightRefreshSelectedWatchlist = async () => {
    if (!selectedWatchlist) return;
    
    try {
      console.log(`Light refreshing watchlist: ${selectedWatchlist.id}`);
      const refreshedWatchlist = await watchlistService.lightRefreshWatchlist(selectedWatchlist.id);
      
      // Update the selected watchlist state
      setSelectedWatchlist(refreshedWatchlist);
      
      // Also update in the watchlists array
      setWatchlists(prevWatchlists => prevWatchlists.map(w => 
        w.id === refreshedWatchlist.id ? refreshedWatchlist : w
      ));
    } catch (error) {
      console.error('Error in light refresh:', error);
      // Don't show toast for background refresh errors
    }
  };

  // Fetch all watchlists - updated to also fetch categorized metrics
  const fetchWatchlists = async () => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      const error = "Please sign in to access your watchlists";
      setAuthError(error);
      toast.error(error);
      navigate("/signin");
      return;
    }
  
    setIsLoading(true);
    setHasAttemptedFetch(true); // Mark that we've attempted to fetch
    
    try {
      // Fetch available metrics if not already loaded
      if (availableMetrics.length === 0) {
        await fetchAvailableMetrics();
        await fetchCategorizedMetrics(); // Added this line to fetch categorized metrics
      }
      
      const data = await watchlistService.getWatchlists();
      
      // Log for debugging
      console.log('Fetched watchlists:', data);
      
      // Set watchlists state
      setWatchlists(data);
      
      if (data.length > 0) {
        // If we have watchlists and none is selected, select the first one
        if (!selectedWatchlist) {
          setSelectedWatchlist(data[0]);
        } else {
          // If we already have a selected watchlist, update it with fresh data
          const updated = data.find(w => w.id === selectedWatchlist.id);
          if (updated) {
            setSelectedWatchlist(updated);
          } else {
            // If the selected watchlist no longer exists, select the first one
            setSelectedWatchlist(data[0]);
          }
        }
      } else {
        // No watchlists exist
        setSelectedWatchlist(null);
        console.log("No watchlists found for user. This is normal if the user hasn't created any watchlists yet.");
      }
    } catch (error) {
      console.error('Error fetching watchlists:', error);
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        const errorMsg = "Please sign in to access your watchlists";
        setAuthError(errorMsg);
        toast.error(errorMsg);
        navigate("/signin");
      } else {
        toast.error('Failed to load watchlists');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new watchlist
  const createWatchlist = async (name: string): Promise<Watchlist> => {
    setIsLoading(true);
    try {
      // Validate input
      if (!name || name.trim() === '') {
        toast.error('Watchlist name cannot be empty');
        throw new Error('Watchlist name cannot be empty');
      }
  
      // Create proper request data with empty selectedMetrics array
      const watchlistData = { 
        name: name.trim(),
        selectedMetrics: [] // Explicitly set as empty array, not undefined or empty string
      };
      
      console.log('Creating watchlist with data:', watchlistData);
      
      const newWatchlist = await watchlistService.createWatchlist(watchlistData);
      
      // Update local state with the new watchlist
      setWatchlists(prev => [...prev, newWatchlist]);
      setSelectedWatchlist(newWatchlist);
      
      toast.success('Watchlist created successfully');
      return newWatchlist;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error creating watchlist:', error);
      
      // Show more specific error messages based on the error type
      if (error.message && error.message.includes('Authentication required')) {
        // Auth issues
        setAuthError(error.message);
        toast.error(error.message);
        navigate("/signin");
      } else if (error.message) {
        // Other errors with messages
        toast.error(error.message);
      } else {
        // Generic error
        toast.error('Failed to create watchlist');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update a watchlist
const updateWatchlist = async (watchlist: Watchlist): Promise<Watchlist> => {
    setIsLoading(true);
    try {
      // Get the original watchlist to have a reference to the stocks
      const originalWatchlist = watchlists.find(w => w.id === watchlist.id);
      
      const updatedWatchlist = await watchlistService.updateWatchlist(watchlist.id, {
        name: watchlist.name,
        selectedMetrics: watchlist.selectedMetrics,
      });
      
      // Important: Preserve stocks data if it's not included in the response
      if (!updatedWatchlist.stocks || updatedWatchlist.stocks.length === 0) {
        console.log('Preserving stocks data as it was not included in the response');
        updatedWatchlist.stocks = originalWatchlist?.stocks || [];
      }
      
      // Update the watchlist in the list
      setWatchlists(watchlists.map(w => 
        w.id === updatedWatchlist.id ? updatedWatchlist : w
      ));
      
      // Update the selected watchlist if it's the one that was updated
      if (selectedWatchlist?.id === updatedWatchlist.id) {
        setSelectedWatchlist(updatedWatchlist);
      }
      
      toast.success('Watchlist updated successfully');
      return updatedWatchlist;
    } catch (error) {
      console.error('Error updating watchlist:', error);
      toast.error('Failed to update watchlist');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a watchlist
  const deleteWatchlist = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      await watchlistService.deleteWatchlist(id);
      
      // Remove the watchlist from the list
      const updatedWatchlists = watchlists.filter(w => w.id !== id);
      setWatchlists(updatedWatchlists);
      
      // If the deleted watchlist was selected, select another one
      if (selectedWatchlist?.id === id) {
        if (updatedWatchlists.length > 0) {
          setSelectedWatchlist(updatedWatchlists[0]);
        } else {
          setSelectedWatchlist(null);
        }
      }
      
      toast.success('Watchlist deleted successfully');
    } catch (error) {
      console.error('Error deleting watchlist:', error);
      toast.error('Failed to delete watchlist');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a stock to a watchlist
  const addStock = async (stock: { ticker: string; name: string }): Promise<WatchlistStock> => {
    if (!selectedWatchlist) {
      toast.error('No watchlist selected');
      throw new Error('No watchlist selected');
    }
    
    setIsLoading(true);
    try {
      const newStock = await watchlistService.addStock(selectedWatchlist.id, stock);
      
      // Update the selected watchlist with the new stock
      const updatedWatchlist = {
        ...selectedWatchlist,
        stocks: [...selectedWatchlist.stocks, newStock],
      };
      
      setSelectedWatchlist(updatedWatchlist);
      
      // Also update the watchlist in the list
      setWatchlists(watchlists.map(w => 
        w.id === updatedWatchlist.id ? updatedWatchlist : w
      ));
      
      toast.success(`Added ${stock.name} to watchlist`);
      return newStock;
    } catch (error) {
      console.error('Error adding stock to watchlist:', error);
      toast.error('Failed to add stock to watchlist');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a stock from a watchlist
  const deleteStock = async (ticker: string): Promise<void> => {
    if (!selectedWatchlist) {
      toast.error('No watchlist selected');
      throw new Error('No watchlist selected');
    }
    
    setIsLoading(true);
    try {
      await watchlistService.deleteStock(selectedWatchlist.id, ticker);
      
      // Update the selected watchlist by removing the stock
      const updatedWatchlist = {
        ...selectedWatchlist,
        stocks: selectedWatchlist.stocks.filter(stock => stock.ticker !== ticker),
      };
      
      setSelectedWatchlist(updatedWatchlist);
      
      // Also update the watchlist in the list
      setWatchlists(watchlists.map(w => 
        w.id === updatedWatchlist.id ? updatedWatchlist : w
      ));
      
      toast.success(`Removed ${ticker} from watchlist`);
    } catch (error) {
      console.error('Error removing stock from watchlist:', error);
      toast.error('Failed to remove stock from watchlist');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh metrics for a watchlist
  // Update the refreshMetrics function in WatchlistContext.tsx
const refreshMetrics = async (): Promise<Watchlist> => {
    if (!selectedWatchlist) {
      toast.error('No watchlist selected');
      throw new Error('No watchlist selected');
    }
    
    setIsLoading(true);
    try {
      console.log(`Refreshing metrics for watchlist: ${selectedWatchlist.id}`);
      const refreshedWatchlist = await watchlistService.refreshMetrics(selectedWatchlist.id);
      
      // Validate the response to ensure it has stocks
      if (!refreshedWatchlist.stocks || refreshedWatchlist.stocks.length === 0) {
        console.warn('Refresh metrics returned a watchlist with no stocks');
        
        // If the original watchlist had stocks but the refreshed one doesn't,
        // this could indicate an API issue - preserve the original stocks
        if (selectedWatchlist.stocks && selectedWatchlist.stocks.length > 0) {
          console.log('Preserving original stocks data');
          refreshedWatchlist.stocks = selectedWatchlist.stocks;
        }
      }
      
      console.log(`Refreshed watchlist has ${refreshedWatchlist.stocks?.length || 0} stocks`);
      
      // Update the selected watchlist with the refreshed data
      setSelectedWatchlist(refreshedWatchlist);
      
      // Also update the watchlist in the list
      setWatchlists(watchlists.map(w => 
        w.id === refreshedWatchlist.id ? refreshedWatchlist : w
      ));
      
      toast.success('Metrics refreshed successfully');
      return refreshedWatchlist;
    } catch (error) {
      console.error('Error refreshing metrics:', error);
      toast.error('Failed to refresh metrics');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

    const addMetric = async (metricId: string): Promise<void> => {
        if (!selectedWatchlist) {
        toast.error('No watchlist selected');
        throw new Error('No watchlist selected');
        }
        
        // Check if the metric is already selected
        if (selectedWatchlist.selectedMetrics.includes(metricId)) {
        return;
        }
        
        const updatedMetrics = [...selectedWatchlist.selectedMetrics, metricId];
        
        setIsLoading(true);
        try {
        // Call the API to update metrics
        const updatedWatchlist = await watchlistService.updateMetrics(
            selectedWatchlist.id, 
            updatedMetrics
        );
        
        // Important: Preserve stocks data if it's not included in the response
        if (!updatedWatchlist.stocks || updatedWatchlist.stocks.length === 0) {
            console.log('Preserving stocks data as it was not included in the response');
            updatedWatchlist.stocks = selectedWatchlist.stocks;
        }
        
        // Update the selected watchlist with the merged data
        setSelectedWatchlist(updatedWatchlist);
        
        // Also update the watchlist in the list
        setWatchlists(watchlists.map(w => 
            w.id === updatedWatchlist.id ? updatedWatchlist : w
        ));
        
        // If the watchlist has stocks, refresh metrics to get values for the new metric
        if (updatedWatchlist.stocks.length > 0) {
            await refreshMetrics();
        }
        } catch (error) {
        console.error('Error adding metric:', error);
        toast.error('Failed to add metric');
        throw error;
        } finally {
        setIsLoading(false);
        }
    };

  // Remove a metric from selected metrics
const removeMetric = async (metricId: string): Promise<void> => {
    if (!selectedWatchlist) {
      toast.error('No watchlist selected');
      throw new Error('No watchlist selected');
    }
    
    const updatedMetrics = selectedWatchlist.selectedMetrics.filter(id => id !== metricId);
    
    setIsLoading(true);
    try {
      const updatedWatchlist = await watchlistService.updateMetrics(
        selectedWatchlist.id, 
        updatedMetrics
      );
      
      // Important: Preserve stocks data if it's not included in the response
      if (!updatedWatchlist.stocks || updatedWatchlist.stocks.length === 0) {
        console.log('Preserving stocks data as it was not included in the response');
        updatedWatchlist.stocks = selectedWatchlist.stocks;
      }
      
      // Update the selected watchlist with the merged data
      setSelectedWatchlist(updatedWatchlist);
      
      // Also update the watchlist in the list
      setWatchlists(watchlists.map(w => 
        w.id === updatedWatchlist.id ? updatedWatchlist : w
      ));
    } catch (error) {
      console.error('Error removing metric:', error);
      toast.error('Failed to remove metric');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlists,
        selectedWatchlist,
        availableMetrics,
        categorizedMetrics, // Add the categorized metrics to the context value
        isLoading,
        authError,
        setSelectedWatchlist,
        fetchWatchlists,
        createWatchlist,
        updateWatchlist,
        deleteWatchlist,
        addStock,
        deleteStock,
        refreshMetrics,
        lightRefreshSelectedWatchlist,
        addMetric,
        removeMetric
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = (): WatchlistContextType => {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
};
