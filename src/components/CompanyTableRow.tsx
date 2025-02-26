
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
    <tr className="transition-colors hover:bg-gray-50/50">
      <td className="py-3 px-4 text-sm">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {company.logoUrl ? (
              <div className="w-10 h-10 rounded-full bg-[#F1F0FB] p-2 flex items-center justify-center">
                <img
                  src={company.logoUrl}
                  alt={`${company.name} logo`}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <Avatar>
                <AvatarFallback className="bg-[#F1F0FB] text-gray-600">
                  {company.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <div>
            <div className="font-medium">{company.name}</div>
            <div className="text-gray-500">{company.ticker}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm">{company.marketCap}</td>
      <td className="py-3 px-4 text-sm">{company.price}</td>
      <td className={`py-3 px-4 text-sm ${company.isPositive ? 'text-success' : 'text-warning'}`}>
        {company.change}
      </td>
      <td className="py-3 px-4 text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(company.ticker)}
          className="h-8 w-8 text-gray-500 hover:text-gray-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
};
