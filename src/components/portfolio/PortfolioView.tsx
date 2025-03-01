import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Plus } from "lucide-react";
import { toast } from "sonner";
import { PortfolioAllocationChart } from "./PortfolioAllocationChart";
import { PortfolioPerformanceChart } from "./PortfolioPerformanceChart";
import { PortfolioTable } from "./PortfolioTable";
import { Stock, Portfolio } from "./types";
import { PortfolioSettingsDialog } from "./dialogs/PortfolioSettingsDialog";
import { AddPositionDialog } from "./dialogs/AddPositionDialog";

interface PortfolioViewProps {
  portfolio: Portfolio;
  onAddPortfolio: () => void;
  onDeletePortfolio: (id: string) => void;
  onUpdatePortfolio: (portfolio: Portfolio) => void;
  // Add direct handlers for position management
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAddPosition: (company: any, shares: string, avgPrice: string) => void;
  onUpdatePosition: (ticker: string, shares: number, avgPrice: number) => void;
  onDeletePosition: (ticker: string) => void;
}

export const PortfolioView = ({
  portfolio,
  onAddPortfolio,
  onDeletePortfolio,
  onUpdatePortfolio,
  onAddPosition,
  onUpdatePosition,
  onDeletePosition,
}: PortfolioViewProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddingTicker, setIsAddingTicker] = useState(false);
  const [performanceTimeframe, setPerformanceTimeframe] = useState("5D");

  const handleUpdatePortfolioName = (newName: string) => {
    onUpdatePortfolio({
      ...portfolio,
      name: newName
    });
    toast.success("Portfolio name updated");
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddPosition = (company: any, shares: string, avgPrice: string) => {
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
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{portfolio.name}</h1>
        <div className="flex items-center gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Portfolio Allocation</h2>
          <PortfolioAllocationChart stocks={portfolio.stocks} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Portfolio Performance</h2>
          <PortfolioPerformanceChart 
            timeframe={performanceTimeframe} 
            portfolioValue={portfolio.totalValue}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 italic">
            Tip: Click directly on the Shares or Average Price values in the table below to edit existing positions.
          </p>
          <div className="text-sm text-gray-500">
            Total Value: <span className="font-medium">${portfolio.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        
        {portfolio.stocks.length > 0 ? (
          <PortfolioTable 
            stocks={portfolio.stocks} 
            onDeletePosition={onDeletePosition}
            onUpdatePosition={onUpdatePosition}
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

        <Button 
          variant="destructive"
          onClick={() => onDeletePortfolio(portfolio.id)}
        >
          Delete Portfolio
        </Button>
      </div>

      <PortfolioSettingsDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        portfolioName={portfolio.name}
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