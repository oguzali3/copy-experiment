// src/components/portfolio/PortfolioContent.tsx - Updated for new backend
import { useState, useEffect, useRef, useCallback } from "react";
import { PortfolioEmpty } from "./PortfolioEmpty";
import { PortfolioCreate } from "./PortfolioCreate";
import { PortfolioView } from "./PortfolioView";
import { toast } from "sonner";
import { Portfolio } from "./types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import portfolioApi from '@/services/portfolioApi';
import { standardizePortfolioData } from "@/utils/portfolioDataUtils";
import priceRefreshService from "@/services/priceRefreshService";

interface PortfolioContentProps {
  portfolioId: string;
  portfolios: Portfolio[];
  setPortfolios: React.Dispatch<React.SetStateAction<Portfolio[]>>;
}

// Minimum time between light refreshes (30 seconds)
const MIN_REFRESH_INTERVAL = 30 * 1000; 

const PortfolioContent = ({ portfolioId, portfolios, setPortfolios }: PortfolioContentProps) => {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(portfolioId || null);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLightRefreshing, setIsLightRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [marketStatus, setMarketStatus] = useState<'open' | 'closed' | 'pre-market' | 'after-hours'>('closed');
  
  // Store previous portfolio ID to detect changes
  const previousPortfolioIdRef = useRef<string | null>(null);
  // Track if component is mounted
  const isMounted = useRef(true);
  // Keep track of the refresh interval
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Track if initial load has happened
  const hasInitialLoadRef = useRef(false);

  // Set mounted flag on mount and clean up on unmount
  useEffect(() => {
    console.log("Component mounted");
    isMounted.current = true;
    
    // Get current market status
    const updateMarketStatus = async () => {
      try {
        const status = priceRefreshService.getMarketStatus();
        setMarketStatus(status);
      } catch (error) {
        console.error("Error getting market status:", error);
      }
    };
    
    updateMarketStatus();
    
    return () => {
      console.log("Component unmounting, cleaning up");
      isMounted.current = false;
      
      // Clear any timers
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, []);

  // Set initial selectedPortfolioId from props
  useEffect(() => {
    if (portfolioId && !selectedPortfolioId) {
      console.log(`Setting initial portfolio ID from props (ONCE ONLY): ${portfolioId}`);
      setSelectedPortfolioId(portfolioId);
    }
  }, [portfolioId, selectedPortfolioId]);

  // Initial portfolio data loading - only happens once
  useEffect(() => {
    const loadInitialPortfolio = async () => {
      // Skip if there's no initially selected portfolio or if already loaded
      if (!selectedPortfolioId || hasInitialLoadRef.current || isUpdating || loading) {
        return;
      }
      
      console.log(`Initial load for portfolio ${selectedPortfolioId}`);
      setLoading(true);
      
      try {
        // Use the new API to get portfolio data
        const refreshedPortfolio = await portfolioApi.getPortfolioById(selectedPortfolioId);
        
        // Only update if component is still mounted
        if (isMounted.current) {
          console.log("Initial load successful", refreshedPortfolio.id);
          
          // Update portfolios in the parent component
          setPortfolios(prevPortfolios => {
            return prevPortfolios.map(p => 
              p.id === refreshedPortfolio.id ? refreshedPortfolio : p
            );
          });
          
          // Update last refresh time
          setLastRefreshTime(new Date());
          
          // Mark initial load as complete
          hasInitialLoadRef.current = true;
          
          // Update market status
          setMarketStatus(priceRefreshService.getMarketStatus());
        }
      } catch (error) {
        console.error("Error during initial portfolio load:", error);
        if (isMounted.current) {
          toast.error("Unable to get latest prices. Retrying...");
          // Try a different approach if the first one fails
          try {
            // Force refresh the portfolio with the new API
            const forcedRefresh = await portfolioApi.refreshPrices(selectedPortfolioId);
            if (isMounted.current) {
              setPortfolios(prevPortfolios => {
                return prevPortfolios.map(p => 
                  p.id === selectedPortfolioId ? forcedRefresh : p
                );
              });
              setLastRefreshTime(new Date());
              hasInitialLoadRef.current = true;
            }
          } catch (secondError) {
            console.error("Second attempt failed:", secondError);
            toast.error("Failed to refresh portfolio data. Please try again later.");
          }
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
    
    loadInitialPortfolio();
  }, [selectedPortfolioId, loading, isUpdating, setPortfolios]);

  // Handle portfolio change detection
  useEffect(() => {
    const handlePortfolioChange = async () => {
      // Only trigger when there's an actual change in the selected portfolio
      if (selectedPortfolioId && previousPortfolioIdRef.current !== selectedPortfolioId) {
        console.log(`Portfolio changed from ${previousPortfolioIdRef.current} to ${selectedPortfolioId}`);
        
        // Update the previous ID ref
        previousPortfolioIdRef.current = selectedPortfolioId;
        
        // If we're coming from another portfolio, perform a light refresh
        if (!loading && !isUpdating) {
          // Add a small delay to prevent UI jank
          setTimeout(() => {
            if (isMounted.current && selectedPortfolioId) {
              performLightRefresh(selectedPortfolioId);
            }
          }, 50);
        }
      }
    };
    
    handlePortfolioChange();
  }, [selectedPortfolioId, loading, isUpdating]);

  const handlePortfolioSelection = async (portfolioId: string) => {
    console.log("=========== SELECTION DEBUG ===========");
    console.log(`Attempting to select portfolio: ${portfolioId}`);
    console.log("Current selected ID:", selectedPortfolioId);
    
    // Skip if trying to select the same portfolio
    if (portfolioId === selectedPortfolioId) {
      console.log(`Already viewing portfolio ${portfolioId}, skipping selection`);
      return;
    }
    
    console.log(`Changing portfolio from ${selectedPortfolioId} to ${portfolioId}`);
    
    try {
      // Set loading state first
      setLoading(true);
      
      // Update the selectedPortfolioId immediately
      setSelectedPortfolioId(prevId => {
        console.log(`Setting selectedPortfolioId from ${prevId} to ${portfolioId}`);
        return portfolioId;
      });
      
      // Reset the hasInitialLoadRef to force a reload
      hasInitialLoadRef.current = false;
      
      // Get fresh data with the new API
      console.log(`Fetching fresh data for portfolio ${portfolioId}`);
      const refreshedPortfolio = await portfolioApi.getLightRefreshPortfolio(portfolioId);
      
      console.log("Received refreshed portfolio data:", {
        id: refreshedPortfolio.id,
        name: refreshedPortfolio.name,
        stockCount: refreshedPortfolio.stocks.length
      });
      
      // Update the portfolios array with the fresh data
      setPortfolios(prev => {
        console.log("Updating portfolios state with refreshed data");
        return prev.map(p => p.id === portfolioId ? refreshedPortfolio : p);
      });
      
      // Update last refresh time
      setLastRefreshTime(new Date());
      
      // Set hasInitialLoadRef to true to prevent another reload
      hasInitialLoadRef.current = true;
      
      // Log success
      console.log(`Successfully switched to portfolio ${portfolioId}`);
      console.log("=============================================");
    } catch (error) {
      console.error("Error switching portfolio:", error);
      toast.error("Failed to load portfolio data");
    } finally {
      setLoading(false);
    }
  };

  // Portfolio data validation function
  const sanitizePortfolio = useCallback((portfolio: Portfolio): Portfolio => {
    // Use the utility function for standardization to ensure consistency
    return standardizePortfolioData(portfolio);
  }, []);

  // Optimized light refresh function - with debouncing
  const performLightRefresh = useCallback(async (portfolioId: string, force = false) => {
    // Skip if a refresh is already in progress
    if (isLightRefreshing || isUpdating || loading) {
      console.log(`Skipping light refresh - another operation is in progress`);
      return;
    }
    
    // Skip if the component is not mounted
    if (!isMounted.current) {
      console.log('Component no longer mounted, skipping refresh');
      return;
    }
    
    // Check when this portfolio was last refreshed
    const lastRefresh = priceRefreshService.getLastRefreshTime(portfolioId);
    const now = Date.now();
    const timeSinceLastRefresh = lastRefresh ? now - lastRefresh.getTime() : Infinity;
    
    // Skip if we've refreshed recently, unless force=true
    if (!force && timeSinceLastRefresh < MIN_REFRESH_INTERVAL) {
      console.log(`Skipping light refresh - refreshed ${(timeSinceLastRefresh / 1000).toFixed(1)}s ago`);
      return;
    }
    
    try {
      // Set refreshing state
      setIsLightRefreshing(true);
      
      console.log(`Performing light refresh for portfolio ${portfolioId}`);
      
      // Get latest data from the new API
      const refreshedPortfolio = await portfolioApi.getLightRefreshPortfolio(portfolioId);
      
      // Only update if component is still mounted
      if (isMounted.current) {
        console.log("Light refresh completed successfully");
        
        // Update the specific portfolio with the standardized data
        setPortfolios(prev => 
          prev.map(p => p.id === portfolioId ? refreshedPortfolio : p)
        );
        
        // Record the refresh time
        setLastRefreshTime(new Date());
        priceRefreshService.recordRefresh(portfolioId);
      }
    } catch (error) {
      console.error("Light refresh failed:", error);
      // No error toast - this is a background operation
    } finally {
      if (isMounted.current) {
        setIsLightRefreshing(false);
      }
    }
  }, [isLightRefreshing, loading, isUpdating, setPortfolios]);

  // Setup periodic light refreshes
  useEffect(() => {
    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    if (selectedPortfolioId) {
      // Determine polling interval based on market status
      const isMarketActive = marketStatus === 'open' || marketStatus === 'pre-market' || marketStatus === 'after-hours';
      const intervalTime = isMarketActive ? 5 * 60 * 1000 : 15 * 60 * 1000; // 5 min during market hours, 15 min otherwise
      
      console.log(`Setting up refresh interval: ${intervalTime/1000}s for portfolio ${selectedPortfolioId}`);
      
      refreshIntervalRef.current = setInterval(() => {
        if (selectedPortfolioId && isMounted.current) {
          performLightRefresh(selectedPortfolioId, false);
        }
      }, intervalTime);
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [selectedPortfolioId, performLightRefresh, marketStatus]);

  // Update market status periodically
  useEffect(() => {
    const updateMarketStatus = () => {
      setMarketStatus(priceRefreshService.getMarketStatus());
    };
    
    // Update immediately and then every minute
    updateMarketStatus();
    const interval = setInterval(updateMarketStatus, 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleAddPortfolio = async (newPortfolio: Portfolio) => {
    setIsUpdating(true);
    
    try {
      const createRequest = {
        name: newPortfolio.name,
        positions: newPortfolio.stocks.map(stock => ({
          ticker: stock.ticker,
          name: stock.name,
          shares: stock.shares,
          avgPrice: stock.avgPrice
        }))
      };
      
      // Use the new API to create the portfolio
      const createdPortfolio = await portfolioApi.createPortfolio(createRequest);
      
      // Add the new portfolio to the existing list
      setPortfolios(prev => [...prev, createdPortfolio]);
      
      // Set as selected portfolio
      setSelectedPortfolioId(createdPortfolio.id);
      
      setIsCreating(false);
      toast.success("Portfolio created successfully");
    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast.error("Failed to create portfolio");
    } finally {
      setIsUpdating(false);
    }
  };
  

  const handleRefreshPrices = async (portfolioId: string, excludedTickers?: string[]): Promise<void> => {
    setIsUpdating(true);
    try {
      console.log(`Starting full refresh for portfolio ${portfolioId} with excluded tickers:`, excludedTickers);
      
      // Use the new API for refreshing prices with excluded tickers
      const refreshedPortfolio = await portfolioApi.refreshPrices(portfolioId, excludedTickers);
      
      // Update the specific portfolio
      setPortfolios(prev => 
        prev.map(p => p.id === portfolioId ? refreshedPortfolio : p)
      );
      
      // Update refresh time
      setLastRefreshTime(new Date());
      
      toast.success("Stock prices refreshed successfully");
    } catch (error) {
      console.error('Error refreshing prices:', error);
      toast.error("Failed to refresh stock prices");
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };
  

  const updateLocalPortfolio = useCallback((updatedPortfolio: Portfolio) => {
    // Sanitize the portfolio data first
    const sanitizedPortfolio = sanitizePortfolio(updatedPortfolio);
    
    // Update the portfolio in the local state
    setPortfolios(prev => 
      prev.map(p => p.id === updatedPortfolio.id ? sanitizedPortfolio : p)
    );
  }, [sanitizePortfolio, setPortfolios]);  

  const handleUpdatePortfolioName = useCallback(async (id: string, newName: string) => {
    setIsUpdating(true);
    try {
      const updatedPortfolio = await portfolioApi.updatePortfolio(id, { name: newName });
      // Update local state
      updateLocalPortfolio(updatedPortfolio);
      toast.success("Portfolio name updated successfully");
    } catch (error) {
      console.error('Error updating portfolio name:', error);
      toast.error("Failed to update portfolio name");
    } finally {
      setIsUpdating(false);
    }
  }, [updateLocalPortfolio]);

  const handleAddPosition = useCallback(async (portfolioId: string, position: {
    ticker: string;
    name: string;
    shares: number;
    avgPrice: number;
  }) => {
    setIsUpdating(true);
    try {
      // Use the new API to add position
      const newPosition = await portfolioApi.addPosition(portfolioId, position);
      
      // Find current portfolio
      const currentPortfolio = portfolios.find(p => p.id === portfolioId);
      if (!currentPortfolio) {
        throw new Error("Portfolio not found");
      }
      
      // Create an updated portfolio with the new position
      const updatedStocks = [...currentPortfolio.stocks];
      
      // Check if we're updating an existing position
      const existingIndex = updatedStocks.findIndex(s => s.ticker === position.ticker);
      if (existingIndex >= 0) {
        // Replace the existing position
        updatedStocks[existingIndex] = newPosition;
      } else {
        // Add the new position
        updatedStocks.push(newPosition);
      }
      
      // Create a temporary portfolio with the updated stocks
      const tempPortfolio: Portfolio = {
        ...currentPortfolio,
        stocks: updatedStocks
      };
      
      // Let the sanitize function handle all the calculations
      const sanitizedPortfolio = sanitizePortfolio(tempPortfolio);
      
      // Update the state with the complete updated portfolio
      setPortfolios(prev => 
        prev.map(p => p.id === portfolioId ? sanitizedPortfolio : p)
      );
      
      // Update the refresh time
      setLastRefreshTime(new Date());
      priceRefreshService.recordRefresh(portfolioId);
      
      toast.success(`Position ${position.ticker} added successfully`);
    } catch (error) {
      console.error('Error adding position:', error);
      toast.error("Failed to add position");
      
      // Get only this portfolio's data - not all portfolios
      try {
        const refreshedPortfolio = await portfolioApi.getPortfolioById(portfolioId);
        setPortfolios(prev => 
          prev.map(p => p.id === portfolioId ? refreshedPortfolio : p)
        );
      } catch (err) {
        console.error('Error refreshing portfolio data:', err);
      }
    } finally {
      setIsUpdating(false);
    }
  }, [portfolios, setPortfolios, sanitizePortfolio]);

  const handleUpdatePosition = useCallback(async (portfolioId: string, ticker: string, shares: number, avgPrice: number) => {
    setIsUpdating(true);
    try {
      // Find current portfolio
      const currentPortfolio = portfolios.find(p => p.id === portfolioId);
      if (!currentPortfolio) throw new Error("Portfolio not found");
  
      // Update position with the new API
      const updatedPosition = await portfolioApi.updatePosition(portfolioId, ticker, { 
        ticker, 
        shares, 
        avgPrice 
      });
      
      // Create updated stocks array
      const updatedStocks = currentPortfolio.stocks.map(stock => 
        stock.ticker === ticker ? updatedPosition : stock
      );
      
      // Create a temporary portfolio with updated stocks
      const tempPortfolio: Portfolio = {
        ...currentPortfolio,
        stocks: updatedStocks
      };
      
      // Process the portfolio through our sanitizer
      const sanitizedPortfolio = sanitizePortfolio(tempPortfolio);
      
      // Update state with sanitized portfolio
      updateLocalPortfolio(sanitizedPortfolio);
      
      // Update the refresh time
      setLastRefreshTime(new Date());
      priceRefreshService.recordRefresh(portfolioId);
      
      toast.success(`Position ${ticker} updated successfully`);
    } catch (error) {
      console.error('Error updating position:', error);
      toast.error("Failed to update position");
      
      // Refresh only this portfolio's data
      try {
        const refreshedPortfolio = await portfolioApi.getPortfolioById(portfolioId);
        updateLocalPortfolio(refreshedPortfolio);
      } catch (err) {
        console.error('Error refreshing single portfolio data:', err);
      }
    } finally {
      setIsUpdating(false);
    }
  }, [portfolios, updateLocalPortfolio, setPortfolios, sanitizePortfolio]);

  const handleDeletePosition = async (portfolioId: string, ticker: string) => {
    setIsUpdating(true);
    try {
      // Find current portfolio
      const currentPortfolio = portfolios.find(p => p.id === portfolioId);
      if (!currentPortfolio) throw new Error("Portfolio not found");
  
      // Use the new API to delete position
      await portfolioApi.deletePosition(portfolioId, ticker);
      
      // Remove the position from the local state
      const updatedStocks = currentPortfolio.stocks.filter(stock => stock.ticker !== ticker);
      
      // Create a temporary portfolio without the deleted position
      const tempPortfolio: Portfolio = {
        ...currentPortfolio,
        stocks: updatedStocks
      };
      
      // Process through sanitizer for consistent calculations
      const sanitizedPortfolio = sanitizePortfolio(tempPortfolio);
      
      // Update state
      updateLocalPortfolio(sanitizedPortfolio);
      
      toast.success(`Position ${ticker} removed successfully`);
    } catch (error) {
      console.error('Error deleting position:', error);
      toast.error("Failed to delete position");
      
      // Refresh only this portfolio
      try {
        const refreshedPortfolio = await portfolioApi.getPortfolioById(portfolioId);
        updateLocalPortfolio(refreshedPortfolio);
      } catch (err) {
        console.error('Error refreshing portfolio after delete:', err);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    try {
      await portfolioApi.deletePortfolio(id);
      
      // Clear from state
      priceRefreshService.clearRefreshCache(id);
      
      // Reset previous portfolio ID if needed
      if (previousPortfolioIdRef.current === id) {
        previousPortfolioIdRef.current = null;
      }
      
      // Update local state without refetching
      setPortfolios(prev => prev.filter(portfolio => portfolio.id !== id));
      
      // If we deleted the selected portfolio, select another one if available
      if (selectedPortfolioId === id) {
        const remainingPortfolios = portfolios.filter(p => p.id !== id);
        setSelectedPortfolioId(remainingPortfolios.length > 0 ? remainingPortfolios[0].id : null);
      }
      
      toast.success("Portfolio deleted successfully");
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast.error("Failed to delete portfolio");
      throw error; // Important: rethrow the error so the dialog component knows
    }
  };

  const handleUpdatePortfolio = (updatedPortfolio: Portfolio) => {
    // Process through sanitizer before updating
    const sanitizedPortfolio = sanitizePortfolio(updatedPortfolio);
    
    // Update the local state
    updateLocalPortfolio(sanitizedPortfolio);
    
    // If we change the name, we need to update it on the server
    const currentPortfolio = portfolios.find(p => p.id === updatedPortfolio.id);
    if (currentPortfolio && currentPortfolio.name !== updatedPortfolio.name) {
      handleUpdatePortfolioName(updatedPortfolio.id, updatedPortfolio.name);
    }
  };
  const handleSellPosition = async (portfolioId: string, ticker: string, shares: number, sellPrice: number) => {
    setIsUpdating(true);
    try {
      // Find current portfolio and position
      const currentPortfolio = portfolios.find(p => p.id === portfolioId);
      if (!currentPortfolio) throw new Error("Portfolio not found");
      
      const currentPosition = currentPortfolio.stocks.find(s => s.ticker === ticker);
      if (!currentPosition) throw new Error("Position not found");
      
      // Check if selling entire position
      if (shares >= currentPosition.shares) {
        // If selling all, just delete the position
        await handleDeletePosition(portfolioId, ticker);
        toast.success(`Sold entire position of ${ticker}`);
      } else {
        // Otherwise update with new share count
        const newShares = currentPosition.shares - shares;
        await handleUpdatePosition(portfolioId, ticker, newShares, currentPosition.avgPrice);
        toast.success(`Sold ${shares} shares of ${ticker}`);
      }
      
      // Refresh portfolio data
      const refreshedPortfolio = await portfolioApi.getPortfolioById(portfolioId);
      updateLocalPortfolio(refreshedPortfolio);
      
    } catch (error) {
      console.error('Error selling position:', error);
      toast.error("Failed to sell position");
      
      try {
        // Refresh portfolio data on error
        const refreshedPortfolio = await portfolioApi.getPortfolioById(portfolioId);
        updateLocalPortfolio(refreshedPortfolio);
      } catch (err) {
        console.error('Error refreshing portfolio after sell error:', err);
      }
    } finally {
      setIsUpdating(false);
    }
  }
  

  // Handle loading state
  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      <span className="ml-3">Loading portfolio data...</span>
    </div>;
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={async () => {
            try {
              // Only load the current portfolio, not all portfolios
              if (selectedPortfolioId) {
                const refreshedPortfolio = await portfolioApi.getPortfolioById(selectedPortfolioId);
                setPortfolios(prevPortfolios => 
                  prevPortfolios.map(p => 
                    p.id === selectedPortfolioId ? refreshedPortfolio : p
                  )
                );
              } else {
                // Only get a minimal list if no portfolio is selected
                const refreshedPortfolios = await portfolioApi.getPortfolios({
                  skipRefresh: true
                });
                setPortfolios(refreshedPortfolios);
              }
              setError(null);
            } catch (e) {
              console.error("Error retrying portfolio fetch:", e);
              toast.error("Failed to refresh portfolios. Please try again.");
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Handle creating a new portfolio
  if (isCreating) {
    return (
      <PortfolioCreate
        onSubmit={handleAddPortfolio}
        onCancel={() => setIsCreating(false)}
        isLoading={isUpdating}
      />
    );
  }

  // Handle empty portfolios
  if (portfolios.length === 0) {
    return <PortfolioEmpty onCreate={() => setIsCreating(true)} />;
  }

  // Find the selected portfolio
  const selectedPortfolio = portfolios.find(p => p.id === selectedPortfolioId);

  return (
    <div className="space-y-6">
      {/* Loading overlay for operations */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              <span>Updating...</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Portfolio selector */}
      <div className="flex items-center space-x-4">
      <Select
          key={`portfolio-selector-${portfolios.length}`}
          value={selectedPortfolioId || undefined}
          onValueChange={handlePortfolioSelection}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Portfolio" />
          </SelectTrigger>
          <SelectContent>
            {portfolios.map((portfolio) => (
              <SelectItem key={portfolio.id} value={portfolio.id}>
                {portfolio.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Portfolio view */}
      {selectedPortfolio ? (
        <PortfolioView
          portfolio={selectedPortfolio}
          onAddPortfolio={() => setIsCreating(true)}
          onDeletePortfolio={handleDeletePortfolio}
          onUpdatePortfolio={handleUpdatePortfolio}
          onRefreshPrices={handleRefreshPrices}
          marketStatus={marketStatus}
          lastRefreshTime={lastRefreshTime}
          // Pass the new position handlers
          onAddPosition={(company, shares, avgPrice) => {
            if (!selectedPortfolio) return;
            
            // Convert to proper types
            const newShares = Number(shares);
            const newAvgPrice = Number(avgPrice);
            
            handleAddPosition(selectedPortfolio.id, {
              ticker: company.ticker,
              name: company.name,
              shares: newShares,
              avgPrice: newAvgPrice
            });
          }}
          onUpdatePosition={(ticker, shares, avgPrice) => {
            if (!selectedPortfolio) return;
            handleUpdatePosition(selectedPortfolio.id, ticker, shares, avgPrice);
          }}
          onDeletePosition={(ticker) => {
            if (!selectedPortfolio) return;
            handleDeletePosition(selectedPortfolio.id, ticker);
          }}
          onSellPosition={(ticker, shares, price) => {
            if (!selectedPortfolio) return;
            handleSellPosition(selectedPortfolio.id, ticker, shares, price);
          }}
          
        />
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-6">No portfolio selected. Please select a portfolio from the dropdown above.</p>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create New Portfolio
          </button>
        </div>
      )}
    </div>
  );
};

export default PortfolioContent;