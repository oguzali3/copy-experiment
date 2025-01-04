import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { Portfolio, Stock } from "./PortfolioContent";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { PortfolioSearch } from "./search/PortfolioSearch";
import { PortfolioStocksTable } from "./create/PortfolioStocksTable";
import { PortfolioHeader } from "./create/PortfolioHeader";

interface PortfolioCreateProps {
  onSubmit: (portfolio: Portfolio) => void;
  onCancel: () => void;
}

export const PortfolioCreate = ({ onSubmit, onCancel }: PortfolioCreateProps) => {
  const [name, setName] = useState("");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isAddingStock, setIsAddingStock] = useState(false);

  const handleAddStock = (company: any) => {
    setIsAddingStock(false);
    const newStock: Stock = {
      ticker: company.ticker,
      name: company.name,
      shares: 0,
      avgPrice: 0,
      currentPrice: 0,
      marketValue: 0,
      percentOfPortfolio: 0,
      gainLoss: 0,
      gainLossPercent: 0
    };
    setStocks([...stocks, newStock]);
  };

  const handleUpdateStock = (index: number, shares: number, avgPrice: number) => {
    const updatedStocks = stocks.map((stock, i) => {
      if (i === index) {
        const marketValue = shares * avgPrice;
        return {
          ...stock,
          shares,
          avgPrice,
          marketValue,
          gainLoss: marketValue - (shares * avgPrice),
          gainLossPercent: ((stock.currentPrice - avgPrice) / avgPrice) * 100
        };
      }
      return stock;
    });
    setStocks(updatedStocks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || stocks.length === 0) {
      toast.error("Please provide a portfolio name and add at least one stock");
      return;
    }

    const totalValue = stocks.reduce((sum, stock) => sum + stock.marketValue, 0);
    const stocksWithPercentage = stocks.map(stock => ({
      ...stock,
      percentOfPortfolio: (stock.marketValue / totalValue) * 100
    }));

    const portfolio: Portfolio = {
      id: Date.now().toString(),
      name: name.trim(),
      stocks: stocksWithPercentage,
      totalValue
    };

    onSubmit(portfolio);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Create New Portfolio</h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PortfolioHeader name={name} onNameChange={setName} />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Portfolio Holdings</h3>
              <Dialog open={isAddingStock} onOpenChange={setIsAddingStock}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-green-600 border-green-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Stock
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Stock to Portfolio</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <PortfolioSearch onStockSelect={handleAddStock} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <PortfolioStocksTable
              stocks={stocks}
              onUpdateStock={handleUpdateStock}
              onRemoveStock={(index) => setStocks(stocks.filter((_, i) => i !== index))}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || stocks.length === 0}
            >
              Create Portfolio
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};