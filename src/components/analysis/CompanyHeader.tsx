
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import { useStockWebSocket } from "@/hooks/useStockWebSocket";

interface CompanyHeaderProps {
  name: string;
  ticker: string;
  price: string;
  change: string;
  changePercent: string;
}

export const CompanyHeader = ({ name, ticker, price: initialPrice, change, changePercent }: CompanyHeaderProps) => {
  const { price: livePrice } = useStockWebSocket(ticker);
  
  // Use live price if available, otherwise fall back to initial price
  const displayPrice = livePrice?.toFixed(2) || initialPrice;

  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
        <span className="text-gray-500">${ticker}</span>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-gray-900">${displayPrice}</div>
        <div className={`flex items-center justify-end ${parseFloat(change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          <span>{change} ({changePercent}%)</span>
        </div>
      </div>
    </div>
  );
};
