// src/components/portfolio/PortfolioContent.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { PortfolioEmpty } from "./PortfolioEmpty";
import { PortfolioCreate } from "./PortfolioCreate";
import { PortfolioView } from "./PortfolioView";
import { toast } from "sonner";
import { Portfolio } from "./types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import portfolioApi from '@/services/portfolioApi';
import { standardizePortfolioData } from "@/utils/portfolioDataUtils";

interface PortfolioContentProps {
  portfolioId: string;
  portfolios: Portfolio[];
  setPortfolios: React.Dispatch<React.SetStateAction<Portfolio[]>>;
}

// Minimum time between light refreshes (30 seconds)
const MIN_REFRESH_INTERVAL = 30 * 1000; 
// Minimum time between initial page load refreshes (5 minutes)
const PAGE_LOAD_REFRESH_INTERVAL = 5 * 60 * 1000;

const PortfolioContent = ({ portfolioId, portfolios, setPortfolios }: PortfolioContentProps) => {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(portfolioId || null);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLightRefreshing, setIsLightRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [marketStatus, setMarketStatus] = useState<'open' | 'closed' | 'pre-market' | 'after-hours'>('closed');
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  // Track the last refresh timestamp to throttle requests
  const lastRefreshTimestamp = useRef<number>(0);
  // Track the last page load refresh timestamp
  const lastPageLoadRefresh = useRef<number>(0);
  // Keep track of the refresh interval
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Track if component is mounted to avoid memory leaks
  const isMounted = useRef(true);

  // Update selected portfolio ID when prop changes
  useEffect(() => {
    if (portfolioId) {
      setSelectedPortfolioId(portfolioId);
    }
  }, [portfolioId]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const updateMarketStatus = () => {
      setMarketStatus(determineMarketStatus());
    };
    
    // Update immediately and then every minute
    updateMarketStatus();
    const interval = setInterval(updateMarketStatus, 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Add effect for refreshing prices on initial load
  useEffect(() => {
    const refreshOnInitialLoad = async () => {
      // Only refresh if we have a selected portfolio and we're not already refreshing
      if (!selectedPortfolioId || isUpdating || isLightRefreshing) return;
      
      const now = Date.now();
      // Skip if we've refreshed recently
      if (now - lastPageLoadRefresh.current < PAGE_LOAD_REFRESH_INTERVAL) {
        return;
      }
      
      // Update the timestamp
      lastPageLoadRefresh.current = now;
      
      try {
        console.log("Automatically refreshing prices on page load for portfolio:", selectedPortfolioId);
        // Use the full refresh API to get latest prices
        await handleRefreshPrices(selectedPortfolioId);
        
        // Set initial load flag to true
        setInitialLoadDone(true);
        toast.success("Prices updated on page load");
      } catch (error) {
        console.error("Error refreshing prices on initial load:", error);
        // Still mark as done even if there's an error
        setInitialLoadDone(true);
      }
    };
    
    // Only run this if initialLoadDone is false
    if (!initialLoadDone && selectedPortfolioId) {
      refreshOnInitialLoad();
    }
  }, [selectedPortfolioId, initialLoadDone, isUpdating, isLightRefreshing]);

  // Improved sanitizer function for portfolio data validation
  const sanitizePortfolio = useCallback((portfolio: Portfolio): Portfolio => {
    // Helper to ensure numeric values
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ensureNumber = (val: any): number => {
      if (val === null || val === undefined) return 0;
      if (typeof val === 'string') return parseFloat(val) || 0;
      return typeof val === 'number' && !isNaN(val) ? val : 0;
    };
    
    // Sanitize stocks first
    const sanitizedStocks = portfolio.stocks.map(stock => ({
      ...stock,
      shares: ensureNumber(stock.shares),
      avgPrice: ensureNumber(stock.avgPrice),
      currentPrice: ensureNumber(stock.currentPrice),
      marketValue: ensureNumber(stock.shares) * ensureNumber(stock.currentPrice),
      percentOfPortfolio: 0, // Recalculate this later
      gainLoss: ensureNumber(stock.shares) * (ensureNumber(stock.currentPrice) - ensureNumber(stock.avgPrice)),
      gainLossPercent: ensureNumber(stock.avgPrice) > 0 
        ? ((ensureNumber(stock.currentPrice) - ensureNumber(stock.avgPrice)) / ensureNumber(stock.avgPrice)) * 100 
        : 0
    }));
    
    // Calculate total value based on market values
    const totalValue = sanitizedStocks.reduce((sum, stock) => sum + stock.marketValue, 0);
    
    // Add percentage of portfolio
    const stocksWithPercentages = sanitizedStocks.map(stock => ({
      ...stock,
      percentOfPortfolio: totalValue > 0 ? (stock.marketValue / totalValue) * 100 : 0
    }));
    
    // Ensure previous day value makes sense
    const previousDayValue = ensureNumber(portfolio.previousDayValue);
    
    // Calculate day changes based on sanitized values
    const dayChange = totalValue - previousDayValue;
    const dayChangePercent = previousDayValue > 0 
      ? (dayChange / previousDayValue) * 100 
      : 0;
    
    return {
      ...portfolio,
      totalValue,
      previousDayValue,
      dayChange,
      dayChangePercent,
      stocks: stocksWithPercentages,
      lastPriceUpdate: portfolio.lastPriceUpdate
    };
  }, []);

  // Optimized light refresh function with improved validation
  const performLightRefresh = useCallback(async (force = false) => {
    // Skip if no portfolio is selected
    if (!selectedPortfolioId) return;
    
    // Skip if a refresh is already in progress
    if (isLightRefreshing) return;
    
    const now = Date.now();
    // Skip if we've refreshed recently, unless force=true
    if (!force && now - lastRefreshTimestamp.current < MIN_REFRESH_INTERVAL) {
      return;
    }
    
    try {
      // Set refreshing state and update timestamp
      setIsLightRefreshing(true);
      lastRefreshTimestamp.current = now;
      
      // Get latest data
      const refreshedPortfolio = await portfolioApi.getLightRefreshPortfolio(selectedPortfolioId);
      
      // Only update if component is still mounted
      if (isMounted.current) {
        console.log("Light refresh received portfolio data:", refreshedPortfolio);
        
        // Import and use the standardizer to ensure consistency
        const standardizedPortfolio = standardizePortfolioData(refreshedPortfolio);
        
        // Update the specific portfolio with the standardized data
        setPortfolios(prev => 
          prev.map(p => p.id === selectedPortfolioId ? standardizedPortfolio : p)
        );
        
        // Record the refresh time
        setLastRefreshTime(new Date());
      }
    } catch (error) {
      console.error("Light refresh failed:", error);
      // No error toast - this is a background operation
    } finally {
      if (isMounted.current) {
        setIsLightRefreshing(false);
      }
    }
  }, [selectedPortfolioId, isLightRefreshing, setPortfolios]);

  // Set up light refresh polling based on selected portfolio
  useEffect(() => {
    // Clear any existing interval when portfolio changes
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    if (selectedPortfolioId) {
      // Initial refresh (if needed)
      performLightRefresh();
      
      // Determine if market is open for polling frequency
      const isMarketOpen = () => {
        const status = determineMarketStatus();
        return status === 'open' || status === 'pre-market' || status === 'after-hours';
      };
      
      // Set polling interval based on market status
      const intervalTime = isMarketOpen() ? 5 * 60 * 1000 : 15 * 60 * 1000; // 5 min during market hours, 15 min otherwise
      
      refreshIntervalRef.current = setInterval(() => {
        performLightRefresh();
      }, intervalTime);
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [selectedPortfolioId, performLightRefresh]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ensureNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'string') return parseFloat(val) || 0;
    return typeof val === 'number' && !isNaN(val) ? val : 0;
  };
  const determineMarketStatus = () => {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Weekend
    if (day === 0 || day === 6) return 'closed';
    
    // Check market hours (9:30 AM - 4:00 PM ET, simplified)
    const marketMinutes = hours * 60 + minutes;
    const marketOpenMinutes = 9 * 60 + 30;  // 9:30 AM
    const marketCloseMinutes = 16 * 60;     // 4:00 PM
    const preMarketOpenMinutes = 4 * 60;    // 4:00 AM (pre-market)
    const afterHoursCloseMinutes = 20 * 60; // 8:00 PM (after-hours)
    
    if (marketMinutes >= marketOpenMinutes && marketMinutes < marketCloseMinutes) {
      return 'open';
    } else if (marketMinutes >= preMarketOpenMinutes && marketMinutes < marketOpenMinutes) {
      return 'pre-market';
    } else if (marketMinutes >= marketCloseMinutes && marketMinutes < afterHoursCloseMinutes) {
      return 'after-hours';
    } else {
      return 'closed';
    }
  };
  
  const handleAddPortfolio = async (newPortfolio: Portfolio) => {
    // Set loading state to true BEFORE the API call
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
      
      const createdPortfolio = await portfolioApi.createPortfolio(createRequest);
      
      // Sanitize the returned portfolio
      const sanitizedPortfolio = sanitizePortfolio(createdPortfolio);
      
      // Add the new portfolio to the existing list
      setPortfolios(prev => [...prev, sanitizedPortfolio]);
      setSelectedPortfolioId(sanitizedPortfolio.id);
      setIsCreating(false);
      toast.success("Portfolio created successfully");
    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast.error("Failed to create portfolio");
    } finally {
      setIsUpdating(false);
    }
  };
  
  // In PortfolioContent.tsx
const handleRefreshPrices = useCallback(async (portfolioId: string): Promise<void> => {
  setIsUpdating(true);
  try {
    // Call API to refresh prices
    const refreshedPortfolio = await portfolioApi.refreshPrices(portfolioId);
    
    // Sanitize the returned portfolio
    const sanitizedPortfolio = sanitizePortfolio(refreshedPortfolio);
    
    // Update the specific portfolio
    setPortfolios(prev => 
      prev.map(p => p.id === portfolioId ? sanitizedPortfolio : p)
    );
    
    // Update last refresh time
    setLastRefreshTime(new Date());
    
    // Also update lastRefreshTimestamp to prevent immediate light refreshes
    lastRefreshTimestamp.current = Date.now();
    
    // IMPORTANT: Add a longer timeout to ensure the forced refresh has time to complete
    setTimeout(async () => {
      try {
        console.log("Performing delayed complete refresh of all portfolios");
        // Clear all caches before making the request
        await portfolioApi.clearAllCaches(); // Make sure this function is exported
        
        const freshPortfolios = await portfolioApi.getPortfolios({
          forceRefresh: true
        });
        
        if (freshPortfolios.length > 0 && isMounted.current) {
          console.log("Updating with fresh portfolio data");
          setPortfolios(freshPortfolios);
        }
      } catch (refreshError) {
        console.error('Delayed refresh error:', refreshError);
      }
    }, 2000); // Increase timeout to 2 seconds
  } catch (error) {
    console.error('Error refreshing prices:', error);
    toast.error("Failed to refresh stock prices");
    throw error;
  } finally {
    setIsUpdating(false);
  }
}, [setPortfolios, sanitizePortfolio]);

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
      const updatedPortfolio = await portfolioApi.updatePortfolio(id, newName);
      // Sanitize before updating state
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
      // Add position to the API
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
      
      // Update the last refresh time
      setLastRefreshTime(new Date());
      lastRefreshTimestamp.current = Date.now();
      
      toast.success(`Position ${position.ticker} added successfully`);
    } catch (error) {
      console.error('Error adding position:', error);
      toast.error("Failed to add position");
      
      // If there was an error, refresh the data
      const refreshedPortfolios = await portfolioApi.getPortfolios();
      setPortfolios(refreshedPortfolios);
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
  
      // Update position in the API
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
      
      // Update the last refresh time
      setLastRefreshTime(new Date());
      lastRefreshTimestamp.current = Date.now();
      
      toast.success(`Position ${ticker} updated successfully`);
    } catch (error) {
      console.error('Error updating position:', error);
      toast.error("Failed to update position");
      
      // If there was an error, refresh the data
      const refreshedPortfolios = await portfolioApi.getPortfolios();
      setPortfolios(refreshedPortfolios);
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
  
      // Delete position from the API
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
      
      // If there was an error, refresh the data
      const refreshedPortfolios = await portfolioApi.getPortfolios();
      setPortfolios(refreshedPortfolios);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    try {
      await portfolioApi.deletePortfolio(id);
      
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

  // Handle loading state
  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      <span className="ml-3">Loading portfolios...</span>
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
              const refreshedPortfolios = await portfolioApi.getPortfolios();
              setPortfolios(refreshedPortfolios);
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
        isLoading={isUpdating}  // Pass the loading state
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
          value={selectedPortfolioId || undefined}
          onValueChange={(value) => setSelectedPortfolioId(value)}
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