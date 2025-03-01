// src/components/portfolio/PortfolioContent.tsx
import { useState, useEffect, useCallback } from "react";
import { PortfolioEmpty } from "./PortfolioEmpty";
import { PortfolioCreate } from "./PortfolioCreate";
import { PortfolioView } from "./PortfolioView";
import { toast } from "sonner";
import { Portfolio, Stock } from "./types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import portfolioApi from '@/services/portfolioApi';

interface PortfolioContentProps {
  portfolioId: string;
}

const PortfolioContent = ({ portfolioId }: PortfolioContentProps) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(portfolioId || null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Separate loading states for different operations
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchPortfolios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const portfolios = await portfolioApi.getPortfolios();
      setPortfolios(portfolios);
      
      // Set the first portfolio as selected if none is selected and we have portfolios
      if ((!selectedPortfolioId || selectedPortfolioId === "") && portfolios.length > 0) {
        setSelectedPortfolioId(portfolios[0].id);
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      setError("Failed to fetch portfolio data. Please try again later.");
      toast.error("Failed to fetch portfolio data");
    } finally {
      setLoading(false);
    }
  }, [selectedPortfolioId]);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  useEffect(() => {
    if (portfolioId) {
      setSelectedPortfolioId(portfolioId);
    }
  }, [portfolioId]);

  const handleAddPortfolio = async (newPortfolio: Portfolio) => {
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
      
      // Add the new portfolio to the existing list instead of refetching all portfolios
      setPortfolios(prev => [...prev, createdPortfolio]);
      setSelectedPortfolioId(createdPortfolio.id);
      setIsCreating(false);
      toast.success("Portfolio created successfully");
    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast.error("Failed to create portfolio");
    }
  };

  const updateLocalPortfolio = (updatedPortfolio: Portfolio) => {
    // Update the portfolio in the local state
    setPortfolios(prev => 
      prev.map(p => p.id === updatedPortfolio.id ? updatedPortfolio : p)
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
      
      // If there was an error, refresh the portfolios to ensure data consistency
      fetchPortfolios();
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
      
      // If there was an error, refresh the portfolios to ensure data consistency
      fetchPortfolios();
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
      
      // If there was an error, refresh the portfolios to ensure data consistency
      fetchPortfolios();
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
          onClick={() => fetchPortfolios()}
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
          <p className="text-gray-500">No portfolio selected. Please select a portfolio from the dropdown above.</p>
        </div>
      )}
    </div>
  );
};

export default PortfolioContent;