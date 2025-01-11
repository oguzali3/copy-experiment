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
}

export const PortfolioView = ({
  portfolio,
  onAddPortfolio,
  onDeletePortfolio,
  onUpdatePortfolio,
}: PortfolioViewProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddingTicker, setIsAddingTicker] = useState(false);

  const handleUpdatePortfolioName = (newName: string) => {
    onUpdatePortfolio({
      ...portfolio,
      name: newName
    });
    toast.success("Portfolio name updated");
  };

  const handleAddPosition = (company: any, shares: string, avgPrice: string) => {
    if (!company || !shares || !avgPrice) {
      toast.error("Please fill in all fields");
      return;
    }

    const newStock: Stock = {
      ticker: company.ticker,
      name: company.name,
      shares: Number(shares),
      avgPrice: Number(avgPrice),
      currentPrice: 0,
      marketValue: 0,
      percentOfPortfolio: 0,
      gainLoss: 0,
      gainLossPercent: 0
    };

    const updatedStocks = [...portfolio.stocks, newStock];
    onUpdatePortfolio({
      ...portfolio,
      stocks: updatedStocks,
    });

    toast.success(`Added ${newStock.name} to portfolio`);
  };

  const handleUpdatePosition = (ticker: string, shares: number, avgPrice: number) => {
    const updatedStocks = portfolio.stocks.map(stock => {
      if (stock.ticker === ticker) {
        const marketValue = shares * stock.currentPrice;
        const gainLoss = marketValue - (shares * avgPrice);
        const gainLossPercent = ((stock.currentPrice - avgPrice) / avgPrice) * 100;
        
        return {
          ...stock,
          shares,
          avgPrice,
          marketValue,
          gainLoss,
          gainLossPercent
        };
      }
      return stock;
    });

    const totalValue = updatedStocks.reduce((sum, stock) => sum + stock.marketValue, 0);
    const stocksWithUpdatedPercentages = updatedStocks.map(stock => ({
      ...stock,
      percentOfPortfolio: (stock.marketValue / totalValue) * 100
    }));

    onUpdatePortfolio({
      ...portfolio,
      stocks: stocksWithUpdatedPercentages,
      totalValue
    });

    toast.success(`Updated position for ${ticker}`);
  };

  const handleDeletePosition = (ticker: string) => {
    const updatedStocks = portfolio.stocks.filter(stock => stock.ticker !== ticker);
    const totalValue = updatedStocks.reduce((sum, stock) => sum + stock.marketValue, 0);
    
    const stocksWithUpdatedPercentages = updatedStocks.map(stock => ({
      ...stock,
      percentOfPortfolio: (stock.marketValue / totalValue) * 100
    }));

    onUpdatePortfolio({
      ...portfolio,
      stocks: stocksWithUpdatedPercentages,
      totalValue
    });
    toast.success(`Removed ${ticker} from portfolio`);
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
          <PortfolioPerformanceChart timeframe="5D" />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600 italic">
          Tip: Click directly on the Shares or Average Price values in the table below to edit existing positions.
        </p>
        <PortfolioTable 
          stocks={portfolio.stocks} 
          onDeletePosition={handleDeletePosition}
          onUpdatePosition={handleUpdatePosition}
        />
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