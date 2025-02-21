
import { ArrowUpIcon, ArrowDownIcon, XIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CompanyTableRowProps {
  company: {
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
  const navigate = useNavigate();

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    // Prevent navigation if clicking the remove button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/analysis?ticker=${company.ticker}`);
  };

  return (
    <tr 
      className="hover:bg-gray-100 transition-colors odd:bg-white even:bg-gray-50 group cursor-pointer"
      onClick={handleRowClick}
    >
      <td className="px-2 py-1.5 text-sm text-gray-500">
        <div className="flex items-center">
          {index + 1}
          <button
            onClick={(e) => {
              e.stopPropagation();  // Prevent row click when removing
              onRemove(company.ticker);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-0.5 rounded-full hover:bg-gray-100"
          >
            <XIcon className="h-3 w-3 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </td>
      <td className="px-2 py-1.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
            <img 
              src={company.logoUrl} 
              alt={`${company.name} logo`}
              className="w-full h-full object-contain"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.ticker)}&background=random&color=fff&size=32`;
              }}
            />
          </div>
          <div className="font-medium text-sm text-gray-900">{company.name}</div>
        </div>
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
