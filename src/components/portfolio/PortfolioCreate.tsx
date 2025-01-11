import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { CompanySearch } from "@/components/CompanySearch";
import { Portfolio, Stock } from "./types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface PortfolioCreateProps {
  onSubmit: (portfolio: Portfolio) => void;
  onCancel: () => void;
}

export const PortfolioCreate = ({ onSubmit, onCancel }: PortfolioCreateProps) => {
  const [name, setName] = useState("");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [newShares, setNewShares] = useState<number>(0);
  const [newAvgPrice, setNewAvgPrice] = useState<number>(0);

  const handleAddStock = (company: any) => {
    setIsAddingStock(false);
    
    // Check if stock already exists in portfolio
    const existingStockIndex = stocks.findIndex(s => s.ticker === company.ticker);
    
    if (existingStockIndex >= 0) {
      // Update existing position
      const existingStock = stocks[existingStockIndex];
      
      // Calculate total shares (current shares + new shares)
      const totalShares = existingStock.shares + newShares;
      
      // Calculate new average price
      // ((current shares × current avg price) + (new shares × new avg price)) ÷ total shares
      const newAveragePrice = (
        (existingStock.shares * existingStock.avgPrice) + 
        (newShares * newAvgPrice)
      ) / totalShares;
      
      handleUpdateStock(existingStockIndex, totalShares, newAveragePrice);
      toast.info(`Updated position in ${company.ticker}`);
      return;
    }

    // Add as new position
    const newStock: Stock = {
      ticker: company.ticker,
      name: company.name,
      shares: newShares,
      avgPrice: newAvgPrice,
      currentPrice: Math.random() * 1000, // Mock price
      marketValue: newShares * newAvgPrice,
      percentOfPortfolio: 0,
      gainLoss: 0,
      gainLossPercent: 0
    };
    setStocks([...stocks, newStock]);
  };

  const handleUpdateStock = (index: number, newShares: number, newAvgPrice: number) => {
    const updatedStock = stocks[index];
    
    // Calculate new values for the position
    const marketValue = newShares * updatedStock.currentPrice;
    const gainLoss = marketValue - (newShares * newAvgPrice);
    const gainLossPercent = ((updatedStock.currentPrice - newAvgPrice) / newAvgPrice) * 100;

    // Update only the selected stock
    setStocks(prevStocks => prevStocks.map((stock, i) => 
      i === index ? {
        ...stock,
        shares: newShares,
        avgPrice: newAvgPrice,
        marketValue,
        gainLoss,
        gainLossPercent
      } : stock
    ));
  };

  const handleRemoveStock = (index: number) => {
    setStocks(stocks.filter((_, i) => i !== index));
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
          <div className="space-y-2">
            <label className="text-orange-500 font-medium">Portfolio Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Portfolio Name"
              className="border-b-orange-500 border-b-2"
            />
          </div>

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
                  <div className="py-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Number of Shares</label>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={newShares}
                        onChange={(e) => setNewShares(Number(e.target.value))}
                        placeholder="Enter number of shares"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Average Price</label>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={newAvgPrice}
                        onChange={(e) => setNewAvgPrice(Number(e.target.value))}
                        placeholder="Enter average price"
                      />
                    </div>
                    <CompanySearch onCompanySelect={handleAddStock} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {stocks.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticker</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shares</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stocks.map((stock, index) => (
                      <tr key={stock.ticker}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {stock.ticker}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stock.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {stock.shares}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          ${stock.avgPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStock(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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