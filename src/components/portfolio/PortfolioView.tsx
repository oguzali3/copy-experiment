import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, PlusCircle, MinusCircle } from "lucide-react";
import { toast } from "sonner";
import { PortfolioAllocationChart } from "./PortfolioAllocationChart";
import { PortfolioPerformanceChart } from "./PortfolioPerformanceChart";
import { PortfolioTable } from "./PortfolioTable";
import { Stock, Portfolio } from "./types";
import { PortfolioSettingsDialog } from "./dialogs/PortfolioSettingsDialog";
import { AddPositionDialog } from "./dialogs/AddPositionDialog";
import { TrimPositionDialog } from "./dialogs/TrimPositionDialog";

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
  const [isTrimmingPosition, setIsTrimmingPosition] = useState(false);

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
      currentPrice: Math.random() * 1000, // Mock price
      marketValue: Number(shares) * Number(avgPrice),
      percentOfPortfolio: 0,
      gainLoss: 0,
      gainLossPercent: 0
    };

    const updatedStocks = [...portfolio.stocks, newStock];
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

    toast.success(`Added ${newStock.name} to portfolio`);
  };

  const handleTrimPosition = (selectedStock: Stock, sharesToTrim: number) => {
    const updatedStocks = portfolio.stocks.map(stock => {
      if (stock.ticker === selectedStock.ticker) {
        const remainingShares = stock.shares - sharesToTrim; // Subtract shares for trimming
        if (remainingShares < 0) {
          toast.error("Cannot trim more shares than owned");
          return stock;
        }
        const marketValue = remainingShares * stock.currentPrice;
        return {
          ...stock,
          shares: remainingShares,
          marketValue,
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

    toast.success(`Trimmed ${sharesToTrim} shares of ${selectedStock.name}`);
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
          <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Portfolio Settings
          </Button>

          <Button 
            variant="outline" 
            className="text-orange-600 border-orange-600"
            onClick={() => setIsTrimmingPosition(true)}
          >
            <MinusCircle className="mr-2 h-4 w-4" />
            Trim Position
          </Button>

          <Button 
            variant="outline" 
            className="text-green-600 border-green-600"
            onClick={() => setIsAddingTicker(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Position
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

      <PortfolioTable 
        stocks={portfolio.stocks} 
        onDeletePosition={handleDeletePosition}
      />

      <div className="flex justify-end">
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

      <TrimPositionDialog
        isOpen={isTrimmingPosition}
        onOpenChange={setIsTrimmingPosition}
        stocks={portfolio.stocks}
        onTrimPosition={handleTrimPosition}
      />
    </div>
  );
};