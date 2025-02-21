
import { ArrowUpIcon, ArrowDownIcon, XIcon } from "lucide-react";

interface CompanyTableRowProps {
  company: {
    name: string;
    ticker: string;
    marketCap: string;
    price: string;
    change: string;
    isPositive: boolean;
  };
  index: number;
  onRemove: (ticker: string) => void;
}

export const CompanyTableRow = ({ company, index, onRemove }: CompanyTableRowProps) => {
  return (
    <tr className="hover:bg-gray-100 transition-colors odd:bg-white even:bg-gray-50 group">
      <td className="px-2 py-1.5 text-sm text-gray-500">
        <div className="flex items-center">
          {index + 1}
          <button
            onClick={() => onRemove(company.ticker)}
            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-0.5 rounded-full hover:bg-gray-100"
          >
            <XIcon className="h-3 w-3 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </td>
      <td className="px-2 py-1.5">
        <div className="font-medium text-sm text-gray-900">{company.name}</div>
      </td>
      <td className="px-2 py-1.5 text-sm font-medium text-blue-600">{company.ticker}</td>
      <td className="px-2 py-1.5 text-sm text-gray-500">{company.marketCap}</td>
      <td className="px-2 py-1.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-gray-900">{company.price}</span>
          <div className={`flex items-center text-xs ${company.isPositive ? 'text-success' : 'text-warning'}`}>
            {company.isPositive ? (
              <ArrowUpIcon className="h-3 w-3 mr-0.5" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 mr-0.5" />
            )}
            <span>{company.change}</span>
          </div>
        </div>
      </td>
    </tr>
  );
};
