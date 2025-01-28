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
    <tr className="hover:bg-[#2c2c35] group">
      <td className="px-4 py-3 text-sm text-gray-300">
        <div className="flex items-center">
          {index + 1}
          <button
            onClick={() => onRemove(company.ticker)}
            className="opacity-0 group-hover:opacity-100 transition-opacity ml-3 p-1 rounded-full hover:bg-gray-700"
          >
            <XIcon className="h-4 w-4 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-white">{company.name}</div>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-blue-400">{company.ticker}</td>
      <td className="px-4 py-3 text-sm text-gray-300">${company.marketCap}</td>
      <td className="px-4 py-3 text-sm text-white">${company.price}</td>
      <td className="px-4 py-3">
        <div className={`flex items-center ${company.isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {company.isPositive ? (
            <ArrowUpIcon className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 mr-1" />
          )}
          <span>{company.change}</span>
        </div>
      </td>
    </tr>
  );
};