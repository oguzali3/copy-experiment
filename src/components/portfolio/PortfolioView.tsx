import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { CompanySearch } from "../CompanySearch";
import { PortfolioAllocationChart } from "./PortfolioAllocationChart";
import { PortfolioPerformanceChart } from "./PortfolioPerformanceChart";
import { PortfolioTable } from "./PortfolioTable";
import { Stock, Portfolio } from "./PortfolioContent";

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
  const [marketData, setMarketData] = useState<Record<string, any>>({});
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch real-time market data for all stocks in the portfolio
  useEffect(() => {
    const fetchMarketData = async () => {
      if (portfolio.stocks.length === 0) return;
      
      setIsLoadingMarketData(true);
      try {
        const tickers = portfolio.stocks.map(stock => stock.ticker);
        const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
          body: { 
            endpoint: 'portfolio-operations',
            tickers 
          }
        });

        if (error) throw error;

        // Transform array to object for easier lookup
        const marketDataMap = data.reduce((acc: Record<string, any>, item: any) => {
          acc[item.ticker] = item;
          return acc;
        }, {});

        setMarketData(marketDataMap);
        setLastUpdated(new Date());
        
        // Update portfolio with real market data
        const updatedStocks = portfolio.stocks.map(stock => {
          const currentPrice = marketDataMap[stock.ticker]?.currentPrice || stock.currentPrice;
          const marketValue = currentPrice * stock.shares;
          const gainLoss = marketValue - (stock.avgPrice * stock.shares);
          const gainLossPercent = ((currentPrice - stock.avgPrice) / stock.avgPrice) * 100;

          return {
            ...stock,
            currentPrice,
            marketValue,
            gainLoss,
            gainLossPercent
          };
        });

        const totalValue = updatedStocks.reduce((sum, stock) => sum + stock.marketValue, 0);
        
        // Update percentages based on new market values
        const stocksWithUpdatedPercentages = updatedStocks.map(stock => ({
          ...stock,
          percentOfPortfolio: (stock.marketValue / totalValue) * 100
        }));

        onUpdatePortfolio({
          ...portfolio,
          stocks: stocksWithUpdatedPercentages,
          totalValue
        });

      } catch (error) {
        console.error('Error fetching market data:', error);
        toast.error('Failed to fetch market data');
      } finally {
        setIsLoadingMarketData(false);
      }
    };

    // Fetch initially and then every 3 minutes
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 180000); // 3 minutes in milliseconds

    return () => clearInterval(interval);
  }, [portfolio.stocks]);

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
      currentPrice: marketData[selectedCompany.ticker]?.currentPrice || 0,
      marketValue: 0, // Will be calculated when market data is fetched
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
    
    // Recalculate percentages for remaining stocks
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
        <div>
          <h1 className="text-2xl font-semibold">{portfolio.name}</h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
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
        isLoading={isLoadingMarketData}
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
