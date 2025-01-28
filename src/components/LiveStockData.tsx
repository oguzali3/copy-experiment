import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

const stocks = [
  { symbol: "AAPL", price: 182.52, change: 1.25, volume: "45.2M" },
  { symbol: "MSFT", price: 415.32, change: -0.45, volume: "22.1M" },
  { symbol: "GOOGL", price: 142.65, change: 2.10, volume: "18.5M" },
  { symbol: "AMZN", price: 178.25, change: -1.15, volume: "31.8M" },
];

export const LiveStockData = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stocks.map((stock) => (
        <Card key={stock.symbol} className="p-4 bg-card hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-foreground">{stock.symbol}</h3>
              <p className="text-sm text-muted-foreground">Vol: {stock.volume}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium text-foreground">${stock.price}</div>
              <div
                className={`flex items-center justify-end text-sm ${
                  stock.change > 0 ? "text-success" : "text-warning"
                }`}
              >
                {stock.change > 0 ? (
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 mr-1" />
                )}
                {Math.abs(stock.change)}%
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};