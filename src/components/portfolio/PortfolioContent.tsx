// src/components/portfolio/PortfolioContent.tsx
import { useState, useEffect } from "react";
import { PortfolioEmpty } from "./PortfolioEmpty";
import { PortfolioCreate } from "./PortfolioCreate";
import { PortfolioView } from "./PortfolioView";
import { toast } from "sonner";
import { Portfolio } from "./types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import portfolioApi from '@/services/portfolioApi';

interface PortfolioContentProps {
  portfolioId: string;
  portfolios: Portfolio[];
  setPortfolios: React.Dispatch<React.SetStateAction<Portfolio[]>>;
}

const PortfolioContent = ({ portfolioId, portfolios, setPortfolios }: PortfolioContentProps) => {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(portfolioId || null);
  const [loading, setLoading] = useState(false); // No initial loading since data comes from props
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLightRefreshing, setIsLightRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [marketStatus, setMarketStatus] = useState<'open' | 'closed' | 'pre-market' | 'after-hours'>('closed');


  // Update selected portfolio ID when prop changes
  useEffect(() => {
    if (portfolioId) {
      setSelectedPortfolioId(portfolioId);
    }
  }, [portfolioId]);

  useEffect(() => {
    const updateMarketStatus = () => {
      setMarketStatus(determineMarketStatus());
    };
    
    // Update immediately and then every minute
    updateMarketStatus();
    const interval = setInterval(updateMarketStatus, 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedPortfolioId) {
      const performLightRefresh = async () => {
        try {
          // Don't show loading indicator for light refresh - keep it in the background
          setIsLightRefreshing(true);
          
          // Get latest data
          const refreshedPortfolio = await portfolioApi.getLightRefreshPortfolio(selectedPortfolioId);
          
          // Update only this portfolio in the list
          setPortfolios(prev => 
            prev.map(p => p.id === selectedPortfolioId ? refreshedPortfolio : p)
          );
          
          // Record the refresh time
          setLastRefreshTime(new Date());
        } catch (error) {
          console.error("Light refresh failed:", error);
          // No error toast - this is a background operation
        } finally {
          setIsLightRefreshing(false);
        }
      };
      
      performLightRefresh();
      
      // Set up poll only during market hours
      const isMarketOpen = () => {
        const now = new Date();
        const day = now.getDay();
        const hours = now.getHours();
        
        // Weekend check (0 = Sunday, 6 = Saturday)
        if (day === 0 || day === 6) return false;
        
        // Market hours check (9:30 AM - 4:00 PM ET, simplified)
        if (hours < 9 || hours >= 16) return false;
        if (hours === 9 && now.getMinutes() < 30) return false;
        
        return true;
      };
      
      // Only poll during market hours, and less frequently
      let refreshInterval: NodeJS.Timeout | null = null;
      if (isMarketOpen()) {
        // Poll every 5 minutes during market hours
        refreshInterval = setInterval(performLightRefresh, 5 * 60 * 1000);
      }
      
      return () => {
        if (refreshInterval) clearInterval(refreshInterval);
      };
    }
  }, [selectedPortfolioId]);

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
    setIsUpdating(true); // Add this line
    
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
      
      // Add the new portfolio to the existing list
      setPortfolios(prev => [...prev, createdPortfolio]);
      setSelectedPortfolioId(createdPortfolio.id);
      setIsCreating(false);
      toast.success("Portfolio created successfully");
    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast.error("Failed to create portfolio");
    } finally {
      setIsUpdating(false); // Add this line to reset the loading state
    }
  };
  const handleRefreshPrices = async (portfolioId: string) => {
    setIsUpdating(true);
    try {
      // Call API to refresh prices
      const refreshedPortfolio = await portfolioApi.refreshPrices(portfolioId);
      
      // Update the local state with new data
      updateLocalPortfolio(refreshedPortfolio);
      
      toast.success("Stock prices refreshed successfully");
    } catch (error) {
      console.error('Error refreshing prices:', error);
      toast.error("Failed to refresh stock prices");
    } finally {
      setIsUpdating(false);
    }
  };

  const updateLocalPortfolio = (updatedPortfolio: Portfolio) => {
    // Update the portfolio in the local state
    setPortfolios(prev => 
      prev.map(p => p.id === updatedPortfolio.id ? {
        ...updatedPortfolio,
        // Ensure these values are always updated correctly
        dayChange: updatedPortfolio.dayChange,
        dayChangePercent: updatedPortfolio.dayChangePercent,
        previousDayValue: updatedPortfolio.previousDayValue,
        lastPriceUpdate: updatedPortfolio.lastPriceUpdate
      } : p)
    );
  };

  const handleUpdatePortfolioName = async (id: string, newName: string) => {
    setIsUpdating(true);
    try {
      const updatedPortfolio = await portfolioApi.updatePortfolio(id, newName);
      updateLocalPortfolio(updatedPortfolio);
      toast.success("Portfolio name updated successfully");
    } catch (error) {
      console.error('Error updating portfolio name:', error);
      toast.error("Failed to update portfolio name");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddPosition = async (portfolioId: string, position: {
    ticker: string;
    name: string;
    shares: number;
    avgPrice: number;
  }) => {
    setIsUpdating(true);
    try {
      // Find current portfolio
      const currentPortfolio = portfolios.find(p => p.id === portfolioId);
      if (!currentPortfolio) throw new Error("Portfolio not found");

      // Add position to the API
      const newPosition = await portfolioApi.addPosition(portfolioId, position);
      
      // Optimistically update the local state without a full refresh
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
      
      // Recalculate total value
      const totalValue = updatedStocks.reduce((sum, stock) => sum + stock.marketValue, 0);
      
      // Create updated portfolio object
      const updatedPortfolio = {
        ...currentPortfolio,
        stocks: updatedStocks,
        totalValue
      };
      
      // Update state
      updateLocalPortfolio(updatedPortfolio);
      
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
  };

  const handleUpdatePosition = async (portfolioId: string, ticker: string, shares: number, avgPrice: number) => {
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
      
      // Optimistically update the local state
      const updatedStocks = currentPortfolio.stocks.map(stock => 
        stock.ticker === ticker ? updatedPosition : stock
      );
      
      // Recalculate total value
      const totalValue = updatedStocks.reduce((sum, stock) => sum + stock.marketValue, 0);
      
      // Recalculate percentages
      const stocksWithPercentages = updatedStocks.map(stock => ({
        ...stock,
        percentOfPortfolio: (stock.marketValue / totalValue) * 100
      }));
      
      // Create updated portfolio object
      const updatedPortfolio = {
        ...currentPortfolio,
        stocks: stocksWithPercentages,
        totalValue
      };
      
      // Update state
      updateLocalPortfolio(updatedPortfolio);
      
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
  };

  const handleDeletePosition = async (portfolioId: string, ticker: string) => {
    setIsUpdating(true);
    try {
      // Find current portfolio
      const currentPortfolio = portfolios.find(p => p.id === portfolioId);
      if (!currentPortfolio) throw new Error("Portfolio not found");

      // Delete position from the API
      await portfolioApi.deletePosition(portfolioId, ticker);
      
      // Optimistically update the local state
      const updatedStocks = currentPortfolio.stocks.filter(stock => stock.ticker !== ticker);
      
      // If all stocks are deleted, set empty array and zero total value
      if (updatedStocks.length === 0) {
        const updatedPortfolio = {
          ...currentPortfolio,
          stocks: [],
          totalValue: 0
        };
        
        // Update state
        updateLocalPortfolio(updatedPortfolio);
      } else {
        // Recalculate total value
        const totalValue = updatedStocks.reduce((sum, stock) => sum + stock.marketValue, 0);
        
        // Recalculate percentages
        const stocksWithPercentages = updatedStocks.map(stock => ({
          ...stock,
          percentOfPortfolio: (stock.marketValue / totalValue) * 100
        }));
        
        // Create updated portfolio object
        const updatedPortfolio = {
          ...currentPortfolio,
          stocks: stocksWithPercentages,
          totalValue
        };
        
        // Update state
        updateLocalPortfolio(updatedPortfolio);
      }
      
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
    // This is a local update function for when we modify a portfolio in the UI
    // It handles updating the portfolio in the local state
    updateLocalPortfolio(updatedPortfolio);
    
    // If we change the name, we need to update it on the server
    const currentPortfolio = portfolios.find(p => p.id === updatedPortfolio.id);
    if (currentPortfolio && currentPortfolio.name !== updatedPortfolio.name) {
      handleUpdatePortfolioName(updatedPortfolio.id, updatedPortfolio.name);
    }
  };

  // Handle loading state
  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading portfolios...</div>;
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={async () => {
            const refreshedPortfolios = await portfolioApi.getPortfolios();
            setPortfolios(refreshedPortfolios);
            setError(null);
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