import { Stock } from "../PortfolioContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface PortfolioStocksTableProps {
  stocks: Stock[];
  onUpdateStock: (index: number, shares: number, avgPrice: number) => void;
  onRemoveStock: (index: number) => void;
}

export const PortfolioStocksTable = ({ 
  stocks, 
  onUpdateStock, 
  onRemoveStock 
}: PortfolioStocksTableProps) => {
  if (stocks.length === 0) return null;

  return (
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
                  onChange={(e) => onUpdateStock(index, Number(e.target.value), stock.avgPrice)}
                  className="w-32"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Input
                  type="number"
                  min="0"
                  value={stock.avgPrice}
                  onChange={(e) => onUpdateStock(index, stock.shares, Number(e.target.value))}
                  className="w-32"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveStock(index)}
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
  );
};