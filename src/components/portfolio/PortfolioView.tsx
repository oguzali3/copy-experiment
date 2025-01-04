import { useState } from "react";
import { toast } from "sonner";
import { PortfolioAllocationChart } from "./PortfolioAllocationChart";
import { PortfolioPerformanceChart } from "./PortfolioPerformanceChart";
import { PortfolioTable } from "./PortfolioTable";
import { Stock, Portfolio } from "./PortfolioContent";
import { useMarketData } from "./hooks/useMarketData";
import { PortfolioHeader } from "./components/PortfolioHeader";
import { PortfolioDialogs } from "./components/PortfolioDialogs";
import { usePortfolioData } from "./hooks/usePortfolioData";

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

  const { portfolio: dbPortfolio, isLoading, updatePortfolio, refreshPortfolio } = usePortfolioData(portfolio.id);
  const { isLoadingMarketData, lastUpdated, refreshMarketData } = useMarketData(portfolio, onUpdatePortfolio);

  const handleUpdatePortfolioName = async () => {
    await updatePortfolio({
      ...portfolio,
      name: newPortfolioName
    });
    setIsSettingsOpen(false);
  };

  const handleAddTicker = (company: any) => {
    setSelectedCompany(company);
  };

  const handleAddPosition = async () => {
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
    await updatePortfolio({
      ...portfolio,
      stocks: updatedStocks
    });

    setIsAddingTicker(false);
    setSelectedCompany(null);
    setShares("");
    setAvgPrice("");
    refreshMarketData();
  };

  const handleDeletePosition = async (ticker: string) => {
    const updatedStocks = portfolio.stocks.filter(stock => stock.ticker !== ticker);
    const totalValue = updatedStocks.reduce((sum, stock) => sum + stock.marketValue, 0);
    
    const stocksWithUpdatedPercentages = updatedStocks.map(stock => ({
      ...stock,
      percentOfPortfolio: (stock.marketValue / totalValue) * 100
    }));

    await updatePortfolio({
      ...portfolio,
      stocks: stocksWithUpdatedPercentages,
      totalValue
    });
  };

  const handleRefreshData = () => {
    refreshMarketData();
    refreshPortfolio();
  };

  if (isLoading) {
    return <div>Loading portfolio...</div>;
  }

  return (
    <div className="space-y-6">
      <PortfolioHeader 
        portfolioName={portfolio.name}
        lastUpdated={lastUpdated}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAddPosition={() => setIsAddingTicker(true)}
        onRefreshData={handleRefreshData}
        isRefreshing={isLoadingMarketData}
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
        isLoading={isLoadingMarketData}
        onDeletePosition={handleDeletePosition}
      />

      <PortfolioDialogs
        isSettingsOpen={isSettingsOpen}
        isAddingTicker={isAddingTicker}
        newPortfolioName={newPortfolioName}
        selectedCompany={selectedCompany}
        shares={shares}
        avgPrice={avgPrice}
        onSettingsClose={() => setIsSettingsOpen(false)}
        onAddTickerClose={() => setIsAddingTicker(false)}
        onPortfolioNameChange={setNewPortfolioName}
        onUpdatePortfolioName={handleUpdatePortfolioName}
        onAddTicker={handleAddTicker}
        onAddPosition={handleAddPosition}
        onSharesChange={setShares}
        onAvgPriceChange={setAvgPrice}
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