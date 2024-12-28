import { useState } from "react";
import { PortfolioEmpty } from "./PortfolioEmpty";
import { PortfolioCreate } from "./PortfolioCreate";
import { PortfolioView } from "./PortfolioView";
import { Button } from "@/components/ui/button";

export type Stock = {
  ticker: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  percentOfPortfolio: number;
  gainLoss: number;
  gainLossPercent: number;
};

export type Portfolio = {
  id: string;
  name: string;
  stocks: Stock[];
  totalValue: number;
};

export const PortfolioContent = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePortfolio = (portfolio: Portfolio) => {
    setPortfolios([...portfolios, portfolio]);
    setSelectedPortfolio(portfolio);
    setIsCreating(false);
  };

  const handleDeletePortfolio = (id: string) => {
    setPortfolios(portfolios.filter(p => p.id !== id));
    if (selectedPortfolio?.id === id) {
      setSelectedPortfolio(null);
    }
  };

  const handleUpdatePortfolio = (updatedPortfolio: Portfolio) => {
    setPortfolios(portfolios.map(p => 
      p.id === updatedPortfolio.id ? updatedPortfolio : p
    ));
    setSelectedPortfolio(updatedPortfolio);
  };

  if (portfolios.length === 0 && !isCreating) {
    return <PortfolioEmpty onCreateClick={() => setIsCreating(true)} />;
  }

  if (isCreating) {
    return (
      <PortfolioCreate 
        onSubmit={handleCreatePortfolio}
        onCancel={() => setIsCreating(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {portfolios.map((portfolio) => (
          <Button
            key={portfolio.id}
            variant={selectedPortfolio?.id === portfolio.id ? "default" : "ghost"}
            onClick={() => setSelectedPortfolio(portfolio)}
            className={selectedPortfolio?.id === portfolio.id ? "bg-[#f5a623] hover:bg-[#f5a623]/90 text-white" : ""}
          >
            {portfolio.name}
          </Button>
        ))}
      </div>

      {selectedPortfolio && (
        <PortfolioView
          portfolio={selectedPortfolio}
          onAddPortfolio={() => setIsCreating(true)}
          onDeletePortfolio={handleDeletePortfolio}
          onUpdatePortfolio={handleUpdatePortfolio}
        />
      )}
    </div>
  );
};