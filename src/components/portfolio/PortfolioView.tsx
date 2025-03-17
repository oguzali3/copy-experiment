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
// Import the new chart components
import { PortfolioValueChart } from "./PortfolioValueChart";
import { PortfolioPerformanceChart } from "./PortfolioPerformanceChart";
import portfolioApi from "@/services/portfolioApi";

interface PortfolioViewProps {
  portfolio: Portfolio;
  onAddPortfolio: () => void;
  onDeletePortfolio: (id: string) => void;
  onUpdatePortfolio: (portfolio: Portfolio) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAddPosition: (company: any, shares: string, avgPrice: string) => void;
  onUpdatePosition: (ticker: string, shares: number, avgPrice: number) => void;
  onRefreshPrices: (portfolioId: string) => Promise<void>;
  lastRefreshTime?: Date | null;
  onDeletePosition: (ticker: string) => void;
  marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours';
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
}: PortfolioViewProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddingTicker, setIsAddingTicker] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
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
  const chartKey = useMemo(() => 
    `${portfolioState.id}-${new Date(lastRefreshTime || 0).getTime()}`,
    [portfolioState.id, lastRefreshTime]
  );

  // Add a unique key for summary cards to force a refresh when portfolio changes
  const summaryKey = useMemo(() => 
    `summary-${portfolioState.id}-${portfolioState.totalValue}-${lastRefreshTime?.getTime() || 0}`,
    [portfolioState.id, portfolioState.totalValue, lastRefreshTime]
  );
  
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

  // Handle refresh prices with proper loading state feedback
  const handleRefreshPrices = useCallback(async () => {
    try {
      await onRefreshPrices(portfolioState.id);
      toast.success("Prices refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh prices");
      console.error("Error refreshing prices:", error);
    }
  }, [portfolioState.id, onRefreshPrices]);

  // Log portfolio updates for debugging
  useEffect(() => {
    console.log('Portfolio updated:', {
      id: portfolioState.id,
      name: portfolioState.name,
      totalValue: portfolioState.totalValue,
      dayChange: portfolioState.dayChange,
      dayChangePercent: portfolioState.dayChangePercent
    });
  }, [portfolioState]);

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
        </div>
      </div>

      {/* Add the summary cards here with stable props and a unique key */}
      <PortfolioSummaryCards
        key={summaryKey}
        totalValue={portfolioState.totalValue}
        dayChange={portfolioState.dayChange}
        dayChangePercent={portfolioState.dayChangePercent}
        stocks={portfolioState.stocks}
        previousDayValue={portfolioState.previousDayValue}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Portfolio Allocation</h2>
          <PortfolioAllocationChart 
            key={`allocation-chart-${chartKey}`}
            stocks={portfolioState.stocks} 
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
            />
          ) : (
            <div className="text-center text-gray-500 py-10">
              Save your portfolio to see historical value chart
            </div>
          )}
        </div>
      </div>
      
      {/* Add the performance chart with stable chartKey */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {portfolioState.id ? (
          <PortfolioPerformanceChart 
            key={`performance-chart-${chartKey}`} 
            portfolioId={portfolioState.id}
            portfolio={portfolioState}
            onUpdatePortfolio={onUpdatePortfolio}
          />
        ) : (
          <div className="text-center text-gray-500 py-10">
            Save your portfolio to see performance chart
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 italic">
            Tip: Click directly on the Shares or Average Price values in the table below to edit existing positions.
          </p>
          <div className="text-sm text-gray-500">
            Total Value: <span className="font-medium">${portfolioState.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        
        {portfolioState.stocks.length > 0 ? (
          <PortfolioTable 
            key={`table-${chartKey}`}
            stocks={portfolioState.stocks} 
            onDeletePosition={handleDeletePositionWrapper}
            onUpdatePosition={handleUpdatePositionWrapper}
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
      />

      <AddPositionDialog
        isOpen={isAddingTicker}
        onOpenChange={setIsAddingTicker}
        onAddPosition={handleAddPosition}
      />
    </div>
  );
};