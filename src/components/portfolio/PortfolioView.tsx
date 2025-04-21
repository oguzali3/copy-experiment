// src/components/portfolio/PortfolioView.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PortfolioAllocationChart } from "./PortfolioAllocationChart";
import { PortfolioTable } from "./PortfolioTable";
import { Stock, Portfolio } from "./types";
import { PortfolioSettingsDialog } from "./dialogs/PortfolioSettingsDialog";
import { AddPositionDialog } from "./dialogs/AddPositionDialog";
import { PortfolioSummaryCards } from "./PortfolioSummaryCards";
import { DeletePortfolioDialog } from "./PortfolioDelete";
// Import the chart components
import { PortfolioValueChart } from "./PortfolioValueChart";
import { PortfolioPerformanceChart } from "./PortfolioPerformanceChart";
import portfolioApi from "@/services/portfolioApi";
import { PortfolioVisibility } from "@/constants/portfolioVisibility";
import { PortfolioTransactionHistory } from "./PortfolioTransactionHistory";
import { SellPositionDialog } from "./dialogs/SellPositionDialog";

interface PortfolioViewProps {
  portfolio: Portfolio;
  onAddPortfolio: () => void;
  onDeletePortfolio: (id: string) => void | Promise<void>; // Allow both void and Promise<void>
  onUpdatePortfolio: (portfolio: Portfolio) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAddPosition: (company: any, shares: string, avgPrice: string) => void | Promise<void>;
  onUpdatePosition: (ticker: string, shares: number, avgPrice: number) => void | Promise<void>;
  onRefreshPrices: (portfolioId: string, excludedTickers?: string[]) => Promise<void>;
  lastRefreshTime?: Date | null;
  onDeletePosition: (ticker: string) => void | Promise<void>;
  marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours';
  isViewOnly?: boolean;
  onSellPosition: (ticker: string, shares: number, price: number) => void | Promise<void>;
}

export const PortfolioView = ({
  portfolio,
  onAddPortfolio,
  onDeletePortfolio,
  onUpdatePortfolio,
  onAddPosition,
  onUpdatePosition,
  onRefreshPrices,
  lastRefreshTime,
  onDeletePosition,
  marketStatus,
  isViewOnly = false,
  onSellPosition
}: PortfolioViewProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddingTicker, setIsAddingTicker] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [excludedTickers, setExcludedTickers] = useState<string[]>([]);
  const [isSellPositionOpen, setIsSellPositionOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Stock | null>(null);
  
  // Memoize portfolio state to reduce unnecessary re-renders
  const portfolioState = useMemo(() => {
    // Helper to ensure numeric values
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ensureNumber = (value: any): number => {
      if (value === null || value === undefined) return 0;
      if (typeof value === 'string') return parseFloat(value) || 0;
      if (typeof value === 'number') return isNaN(value) ? 0 : value;
      return 0;
    };
  
    // Sanitize portfolio data to ensure consistent types
    return {
      ...portfolio,
      totalValue: ensureNumber(portfolio.totalValue),
      dayChange: ensureNumber(portfolio.dayChange),
      dayChangePercent: ensureNumber(portfolio.dayChangePercent),
      previousDayValue: ensureNumber(portfolio.previousDayValue),
      stocks: portfolio.stocks.map(stock => ({
        ...stock,
        shares: ensureNumber(stock.shares),
        avgPrice: ensureNumber(stock.avgPrice),
        currentPrice: ensureNumber(stock.currentPrice),
        marketValue: ensureNumber(stock.marketValue),
        percentOfPortfolio: ensureNumber(stock.percentOfPortfolio),
        gainLoss: ensureNumber(stock.gainLoss),
        gainLossPercent: ensureNumber(stock.gainLossPercent)
      }))
    };
  }, [
    portfolio.id, 
    portfolio.name,
    portfolio.totalValue, 
    portfolio.dayChange,
    portfolio.dayChangePercent,
    portfolio.previousDayValue,
    portfolio.stocks // We track the array reference, but components should have their own deep equality checks
  ]);
  
  // Generate a stable key for chart components based on portfolio ID
  // This prevents unnecessary re-renders while still ensuring proper updates when needed
  const chartKey = useMemo(
    () => `${portfolioState.id}-${new Date(lastRefreshTime || 0).getTime()}`,
    [portfolioState.id, lastRefreshTime]
   );

  // Add a unique key for summary cards to force a refresh when portfolio changes
  const summaryKey = useMemo(() => 
    `summary-${portfolioState.id}-${portfolioState.totalValue}-${lastRefreshTime?.getTime() || 0}-${excludedTickers.join(',')}`,
    [portfolioState.id, portfolioState.totalValue, lastRefreshTime, excludedTickers]
  );

  // Handler for when excluded tickers change in the allocation chart
  const handleExcludedTickersChange = useCallback((tickers: string[]) => {
    console.log("handleExcludedTickersChange called with:", tickers);
    
    // Validate tickers array
    if (!Array.isArray(tickers)) {
      console.error("Expected array of tickers but got:", tickers);
      return;
    }
    
    // Update state and localStorage
    setExcludedTickers(tickers);
    
    // Only update localStorage if we have tickers to exclude
    if (tickers.length > 0) {
      localStorage.setItem(`portfolio-${portfolio.id}-excluded-tickers`, JSON.stringify(tickers));
      console.log("Saved excluded tickers to localStorage:", tickers);
    } else {
      // If clearing tickers, remove the item from localStorage
      localStorage.removeItem(`portfolio-${portfolio.id}-excluded-tickers`);
      console.log("Cleared excluded tickers from localStorage");
    }
    
    console.log("Excluded tickers updated to:", tickers);
  }, [portfolio.id]);

  useEffect(() => {
    try {
      // Don't reset excluded tickers if we already have them for this portfolio
      if (excludedTickers.length > 0) {
        return; // Skip if we already have excluded tickers
      }
      
      const savedExcluded = localStorage.getItem(`portfolio-${portfolio.id}-excluded-tickers`);
      if (savedExcluded) {
        const parsed = JSON.parse(savedExcluded);
        console.log("Loaded saved excluded tickers:", parsed);
        setExcludedTickers(parsed);
      }
      // Don't reset to empty array if we don't find saved tickers
    } catch (e) {
      console.error("Error loading saved excluded tickers:", e);
      // Don't reset here either
    }
  }, [portfolio.id, excludedTickers.length]);
  
  // Create a delete handler
  const handleDeletePortfolio = async () => {
    setIsDeleting(true);
    try {
      await onDeletePortfolio(portfolio.id);
      // The toast will be shown by the parent component
    } catch (error) {
      // Error will be handled by parent, but we should reset our local state
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleUpdatePortfolioName = (newName: string) => {
    onUpdatePortfolio({
      ...portfolio,
      name: newName
    });
    toast.success("Portfolio name updated");
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddPosition = useCallback((company: any, shares: string, avgPrice: string) => {
    if (!company || !shares || !avgPrice) {
      toast.error("Please fill in all fields");
      return;
    }

    const newShares = Number(shares);
    const newAvgPrice = Number(avgPrice);
    
    if (newShares <= 0 || newAvgPrice <= 0) {
      toast.error("Shares and average price must be greater than zero");
      return;
    }
    
    // Use the direct handler passed from parent
    onAddPosition(company, shares, avgPrice);
    
    // Close the dialog
    setIsAddingTicker(false);
  }, [onAddPosition]);

  // Create a wrapper for position updates
  const handleUpdatePositionWrapper = useCallback((ticker: string, shares: number, avgPrice: number) => {
    onUpdatePosition(ticker, shares, avgPrice);
  }, [onUpdatePosition]);

  // Create a wrapper for position deletion
  const handleDeletePositionWrapper = useCallback((ticker: string) => {
    onDeletePosition(ticker);
  }, [onDeletePosition]);

  // Handle refresh prices with proper loading state feedback and excluded tickers
  const handleRefreshPrices = useCallback(async () => {
    try {
      console.log(`Refreshing prices for portfolio ${portfolioState.id} with excluded tickers:`, excludedTickers);
      
      // Call API with excluded tickers
      await onRefreshPrices(portfolioState.id, excludedTickers);
      
      if (excludedTickers.length > 0) {
        toast.success(`Prices refreshed successfully (${excludedTickers.length} positions excluded)`);
      } else {
        toast.success("Prices refreshed successfully");
      }
    } catch (error) {
      toast.error("Failed to refresh prices");
      console.error("Error refreshing prices:", error);
    }
  }, [portfolioState.id, onRefreshPrices, excludedTickers]);

  // Filter stocks for components that need to respect exclusions
  const filteredStocks = useMemo(() => {
    if (excludedTickers.length === 0) {
      return portfolioState.stocks;
    }
    return portfolioState.stocks.filter(
      stock => !excludedTickers.includes(stock.ticker)
    );
  }, [portfolioState.stocks, excludedTickers]);
  const handleSellPositionClick = (stock: Stock) => {
    setSelectedPosition(stock);
    setIsSellPositionOpen(true);
  };
  
  // Add a handler for selling a position
  const handleSellPosition = async (ticker: string, shares: number, price: number) => {
    try {
      // If selling all shares, just use the delete handler
      if (shares === selectedPosition?.shares) {
        await onDeletePosition(ticker);
        toast.success(`Sold entire position of ${ticker}`);
        return;
      }
      
      // Otherwise update the position with reduced shares
      if (selectedPosition) {
        const newShares = selectedPosition.shares - shares;
        await onUpdatePosition(ticker, newShares, selectedPosition.avgPrice);
        toast.success(`Sold ${shares} shares of ${ticker}`);
      }
    } catch (error) {
      console.error("Error selling position:", error);
      toast.error("Failed to sell position");
      throw error;
    }
  };

  // Log portfolio updates for debugging
  useEffect(() => {
    console.log('Portfolio updated:', {
      id: portfolioState.id,
      name: portfolioState.name,
      totalValue: portfolioState.totalValue,
      dayChange: portfolioState.dayChange,
      dayChangePercent: portfolioState.dayChangePercent,
      excludedTickers: excludedTickers
    });
  }, [portfolioState, excludedTickers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{portfolioState.name}</h1>
        <div className="flex items-center gap-4">
          {lastRefreshTime && (
            <span className="text-xs text-gray-500">
              Last updated: {lastRefreshTime.toLocaleTimeString()}
            </span>
          )}
          {excludedTickers.length > 0 && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              {excludedTickers.length} positions excluded
            </span>
          )}
           {!isViewOnly && (
            <>
              <Button 
                variant="outline" 
                className="text-blue-600 border-blue-600"
                onClick={onAddPortfolio}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Portfolio
              </Button>
              <Button 
                variant="outline" 
                className="text-green-600 border-green-600"
                onClick={() => setIsAddingTicker(true)}
              >
                Add a New Position
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Add the summary cards here with stable props and a unique key */}
      <PortfolioSummaryCards
        key={summaryKey}
        totalValue={portfolioState.totalValue}
        dayChange={portfolioState.dayChange}
        dayChangePercent={portfolioState.dayChangePercent}
        stocks={filteredStocks} // Use filtered stocks here to reflect exclusions
        previousDayValue={portfolioState.previousDayValue}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Portfolio Allocation</h2>
          <PortfolioAllocationChart 
            key={`allocation-chart-${chartKey}`}
            stocks={portfolioState.stocks} 
            onExcludedStocksChange={handleExcludedTickersChange}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          {/* Use the stable chartKey to prevent unnecessary reloads */}
          {portfolioState.id ? (
            <PortfolioValueChart 
              key={`value-chart-${chartKey}`} 
              portfolioId={portfolioState.id}
              portfolio={portfolioState}
              onUpdatePortfolio={onUpdatePortfolio}
              excludedTickers={excludedTickers}
            />
          ) : (
            <div className="text-center text-gray-500 py-10">
              Save your portfolio to see historical value chart
            </div>
          )}
        </div>
      </div>
      
      {/* Add the performance chart with stable chartKey and excluded tickers */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {portfolioState.id ? (
          <PortfolioPerformanceChart
            key={`value-chart-${chartKey}`}
            portfolioId={portfolioState.id}
            portfolio={portfolioState}
            excludedTickers={excludedTickers}
            onUpdatePortfolio={isViewOnly ? undefined : onUpdatePortfolio}
          />
        ) : (
          <div className="text-center text-gray-500 py-10">
            Save your portfolio to see performance chart
          </div>
        )}
      </div>
      {!isViewOnly && (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 italic">
            Tip: Click directly on the Shares or Average Price values in the table below to edit existing positions.
          </p>
          <div className="text-sm text-gray-500">
            {excludedTickers.length > 0 ? (
              <span className="text-amber-600">
                Showing {portfolioState.stocks.length - excludedTickers.length} of {portfolioState.stocks.length} positions
              </span>
            ) : (
              <span>
                Total Value: <span className="font-medium">${portfolioState.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </span>
            )}
          </div>
        </div>
        
        {portfolioState.stocks.length > 0 ? (
          <PortfolioTable 
            key={`table-${chartKey}`}
            stocks={filteredStocks} // Use filtered stocks to respect exclusions
            onDeletePosition={handleDeletePositionWrapper}
            onUpdatePosition={handleUpdatePositionWrapper}
            excludedTickers={excludedTickers}
            onToggleExclude={ticker => {
              setExcludedTickers(prev => {
                if (prev.includes(ticker)) {
                  return prev.filter(t => t !== ticker);
                } else {
                  return [...prev, ticker];
                }
              });
            }}
            onSellPosition={handleSellPositionClick}
          />
        ) : (
          <div className="bg-white p-10 rounded-lg shadow-sm text-center">
            <p className="text-gray-500 mb-4">No positions in this portfolio yet</p>
            <Button
              variant="outline"
              className="text-blue-600 border-blue-600"
              onClick={() => setIsAddingTicker(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Position
            </Button>
          </div>
        )}
      </div>
      )}
      {!isViewOnly && (
        <div className="flex justify-end gap-4">
          <Button 
            variant="outline"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Portfolio Settings
          </Button>
          <div className="flex items-center gap-2">
            <span 
              className={`inline-flex h-2 w-2 rounded-full ${
                marketStatus === 'open' ? 'bg-green-500' :
                marketStatus === 'pre-market' || marketStatus === 'after-hours' ? 'bg-yellow-500' :
                'bg-gray-500'
              }`}
            ></span>
            <span className="text-xs text-gray-600">
              {marketStatus === 'open' ? 'Market Open' :
              marketStatus === 'pre-market' ? 'Pre-Market' :
              marketStatus === 'after-hours' ? 'After-Hours' :
              'Market Closed'}
            </span>
          </div>
          {excludedTickers.length > 0 && (
            <Button 
              variant="outline" 
              className="text-amber-600 border-amber-600"
              onClick={() => {
                setExcludedTickers([]);
                localStorage.removeItem(`portfolio-${portfolio.id}-excluded-tickers`);
                toast.success("All position filters cleared");
              }}
            >
              Reset Filters ({excludedTickers.length})
            </Button>
          )}
          <Button 
            variant="outline" 
            className="text-red-600 border-red-600"
            onClick={async () => {
              try {
                // Clear caches first
                await portfolioApi.clearAllCaches();
                // Then do a full refresh
                await handleRefreshPrices();
                toast.success("Forced complete refresh successful");
              } catch (error) {
                toast.error("Force refresh failed");
              }
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Force Complete Refresh
          </Button>
          <Button 
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Delete Portfolio
          </Button>
        </div>
      )}
      
      {!isViewOnly && (
        <>
          <DeletePortfolioDialog
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            portfolioName={portfolioState.name}
            onConfirmDelete={handleDeletePortfolio}
            isDeleting={isDeleting}
          />
          <PortfolioSettingsDialog
            isOpen={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            portfolioName={portfolioState.name}
            onUpdateName={handleUpdatePortfolioName} 
            portfolioVisibility={PortfolioVisibility.PRIVATE} 
            portfolioId={portfolioState.id}         
          />
          <AddPositionDialog
            isOpen={isAddingTicker}
            onOpenChange={setIsAddingTicker}
            onAddPosition={handleAddPosition}
          />
          
          <SellPositionDialog
            isOpen={isSellPositionOpen}
            onOpenChange={setIsSellPositionOpen}
            position={selectedPosition}
            onSellPosition={handleSellPosition}
          />
        
        </>
      )}
      <PortfolioTransactionHistory portfolioId={portfolioState.id} />

    </div>
    
  );
};