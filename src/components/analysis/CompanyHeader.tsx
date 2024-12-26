import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";

interface CompanyHeaderProps {
  name: string;
  ticker: string;
  price: string;
  change: string;
  changePercent: string;
}

export const CompanyHeader = ({ name, ticker, price, change, changePercent }: CompanyHeaderProps) => {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
        <span className="text-gray-500">${ticker}</span>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-gray-900">${price}</div>
        <div className={`flex items-center justify-end ${parseFloat(change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          <span>{change} ({changePercent})</span>
        </div>
      </div>
    </div>
  );
};