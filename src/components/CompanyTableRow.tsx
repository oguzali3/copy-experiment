
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface CompanyTableRowProps {
  company: {
    rank: number;
    name: string;
    ticker: string;
    marketCap: string;
    price: string;
    change: string;
    isPositive: boolean;
    logoUrl?: string;
  };
  index: number;
  onRemove: (ticker: string) => void;
}

export const CompanyTableRow = ({ company, index, onRemove }: CompanyTableRowProps) => {
  return (
    <tr className={cn(
      "border-b border-gray-100 text-xs", 
      index % 2 === 0 ? "bg-white" : "bg-gray-50"
    )}>
      <td className="pl-4 py-3">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden mr-3 flex-shrink-0">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={`${company.name} logo`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <span className="text-gray-500 font-semibold text-xs">
                {company.ticker.substring(0, 2)}
              </span>
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{company.ticker}</div>
            <div className="text-gray-500 text-xs">NasdaqGS:{company.ticker}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-700">{company.name}</td>
      <td className="px-4 py-3 text-right text-gray-900 font-medium">{company.marketCap}</td>
      <td className="px-4 py-3 text-right text-gray-900 font-medium">{company.price}</td>
      <td className={`px-4 py-3 text-right font-medium ${company.isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {company.change}
      </td>
      <td className="pr-4 py-3 text-right">
        <div className="flex items-center justify-end space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-gray-700"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(company.ticker)}
            className="h-6 w-6 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
};
