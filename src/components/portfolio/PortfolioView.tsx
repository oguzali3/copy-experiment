import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Stock, Portfolio } from "./PortfolioContent";
import { useMarketData } from "./hooks/useMarketData";
import { PortfolioHeader } from "./components/PortfolioHeader";

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
  const [newPortfolioName, setNewPortfolioName] = useState(portfolio.name);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [shares, setShares] = useState("");
  const [avgPrice, setAvgPrice] = useState("");

  const { isLoadingMarketData, lastUpdated, updateAttempts } = useMarketData(portfolio, onUpdatePortfolio);

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
      currentPrice: 0,
      marketValue: 0,
      percentOfPortfolio: 0,
      gainLoss: 0,
      gainLossPercent: 0
    };

    const updatedStocks = [...portfolio.stocks, newStock];
    onUpdatePortfolio({
      ...portfolio,
      stocks: updatedStocks
    });

    setIsAddingTicker(false);
    setSelectedCompany(null);
    setShares("");
    setAvgPrice("");
    toast.success(`Added ${newStock.name} to portfolio`);
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
      <PortfolioHeader 
        portfolioName={portfolio.name}
        lastUpdated={lastUpdated}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAddPosition={() => setIsAddingTicker(true)}
      />

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
        isLoading={isLoadingMarketData && updateAttempts === 0}
        onDeletePosition={handleDeletePosition}
      />

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
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

      <Dialog open={isAddingTicker} onOpenChange={setIsAddingTicker}>
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