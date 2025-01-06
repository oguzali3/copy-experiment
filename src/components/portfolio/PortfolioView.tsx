import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, PlusCircle, MinusCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CompanySearch } from "../CompanySearch";
import { PortfolioAllocationChart } from "./PortfolioAllocationChart";
import { PortfolioPerformanceChart } from "./PortfolioPerformanceChart";
import { PortfolioTable } from "./PortfolioTable";
import { Stock, Portfolio } from "./types";

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
  const [newPortfolioName, setNewPortfolioName] = useState(portfolio.name);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [shares, setShares] = useState("");
  const [avgPrice, setAvgPrice] = useState("");
  const [selectedStockForTrim, setSelectedStockForTrim] = useState<Stock | null>(null);
  const [sharesToTrim, setSharesToTrim] = useState("");

  const handleUpdatePortfolioName = () => {
    onUpdatePortfolio({
      ...portfolio,
      name: newPortfolioName
    });
    setIsSettingsOpen(false);
    toast.success("Portfolio name updated");
  };

  const handleAddTicker = (company: any) => {
    setSelectedCompany(company);
  };

  const handleAddPosition = () => {
    if (!selectedCompany || !shares || !avgPrice) {
      toast.error("Please fill in all fields");
      return;
    }

    const newStock: Stock = {
      ticker: selectedCompany.ticker,
      name: selectedCompany.name,
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

    setIsAddingTicker(false);
    setSelectedCompany(null);
    setShares("");
    setAvgPrice("");
    toast.success(`Added ${newStock.name} to portfolio`);
  };

  const handleTrimPosition = () => {
    if (!selectedStockForTrim || !sharesToTrim || Number(sharesToTrim) <= 0) {
      toast.error("Please select a stock and enter a valid number of shares to trim");
      return;
    }

    const sharesToRemove = Number(sharesToTrim);
    if (sharesToRemove >= selectedStockForTrim.shares) {
      toast.error("Cannot trim more shares than you own");
      return;
    }

    const updatedStocks = portfolio.stocks.map(stock => {
      if (stock.ticker === selectedStockForTrim.ticker) {
        const remainingShares = stock.shares - sharesToRemove;
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

    setIsTrimmingPosition(false);
    setSelectedStockForTrim(null);
    setSharesToTrim("");
    toast.success(`Trimmed ${sharesToRemove} shares of ${selectedStockForTrim.name}`);
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
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Portfolio Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Portfolio Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Portfolio Name
                  </label>
                  <Input
                    id="name"
                    value={newPortfolioName}
                    onChange={(e) => setNewPortfolioName(e.target.value)}
                  />
                </div>
                <Button onClick={handleUpdatePortfolioName}>
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isTrimmingPosition} onOpenChange={setIsTrimmingPosition}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-orange-600 border-orange-600">
                <MinusCircle className="mr-2 h-4 w-4" />
                Trim Position
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Trim Position</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Stock</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedStockForTrim?.ticker || ""}
                    onChange={(e) => {
                      const stock = portfolio.stocks.find(s => s.ticker === e.target.value);
                      setSelectedStockForTrim(stock || null);
                    }}
                  >
                    <option value="">Select a stock</option>
                    {portfolio.stocks.map(stock => (
                      <option key={stock.ticker} value={stock.ticker}>
                        {stock.name} ({stock.ticker}) - Current shares: {stock.shares}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedStockForTrim && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Number of Shares to Trim</label>
                    <Input
                      type="number"
                      value={sharesToTrim}
                      onChange={(e) => setSharesToTrim(e.target.value)}
                      placeholder="Enter number of shares to trim"
                      max={selectedStockForTrim.shares - 1}
                      min={1}
                    />
                  </div>
                )}
                <Button onClick={handleTrimPosition}>
                  Trim Position
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddingTicker} onOpenChange={setIsAddingTicker}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-green-600 border-green-600">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Position
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Position to Portfolio</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {!selectedCompany ? (
                  <CompanySearch onCompanySelect={handleAddTicker} />
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Selected Stock</label>
                      <div className="p-2 bg-gray-50 rounded">
                        {selectedCompany.name} ({selectedCompany.ticker})
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Number of Shares</label>
                      <Input
                        type="number"
                        value={shares}
                        onChange={(e) => setShares(e.target.value)}
                        placeholder="Enter number of shares"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Average Price</label>
                      <Input
                        type="number"
                        value={avgPrice}
                        onChange={(e) => setAvgPrice(e.target.value)}
                        placeholder="Enter average price"
                      />
                    </div>
                    <Button onClick={handleAddPosition}>
                      Add Position
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
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
    </div>
  );
};