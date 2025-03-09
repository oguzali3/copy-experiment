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
  isLoading?: boolean;
}

export const PortfolioCreate = ({ onSubmit, onCancel, isLoading = false }: PortfolioCreateProps) => {
  const [name, setName] = useState("");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isAddingStock, setIsAddingStock] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddStock = (company: any) => {
    setIsAddingStock(false);
    
    // Check if stock already exists in portfolio
    if (stocks.some(s => s.ticker === company.ticker)) {
      toast.info(`${company.ticker} already exists in portfolio. Update shares and price in the table below.`);
      return;
    }

    const newStock: Stock = {
      ticker: company.ticker,
      name: company.name,
      shares: 0,
      avgPrice: 0,
      currentPrice: 0, // Set to 0, will be updated by backend
      marketValue: 0,
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
      totalValue,
      previousDayValue: totalValue, // Set initial previous day value to the same as total value
      dayChange: 0, // No change on day one
      dayChangePercent: 0, // No percentage change on day one
      lastPriceUpdate: new Date() // Current timestamp
    };

    onSubmit(portfolio);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              <span>Creating Portfolio...</span>
            </div>
          </div>
        </div>
      )}
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
                  <div className="py-4">
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
                          <Input
                            type="number"
                            min="0"
                            value={stock.shares}
                            onChange={(e) => handleUpdateStock(index, Number(e.target.value), stock.avgPrice)}
                            className="w-32"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Input
                            type="number"
                            min="0"
                            value={stock.avgPrice}
                            onChange={(e) => handleUpdateStock(index, stock.shares, Number(e.target.value))}
                            className="w-32"
                          />
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