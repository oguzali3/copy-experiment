
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

type SortDirection = "asc" | "desc" | null;
type SortField = "marketCap" | "price" | "change";

interface CompanyTableHeaderProps {
  sortConfig: {
    field: SortField | null;
    direction: SortDirection;
  };
  onSort: (field: SortField) => void;
}

export const CompanyTableHeader = ({ sortConfig, onSort }: CompanyTableHeaderProps) => {
  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowDownIcon className="h-4 w-4 ml-1 inline-block text-gray-400" />;
    }
    return sortConfig.direction === "desc" ? (
      <ArrowDownIcon className="h-4 w-4 ml-1 inline-block text-blue-600" />
    ) : (
      <ArrowUpIcon className="h-4 w-4 ml-1 inline-block text-blue-600" />
    );
  };

  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Rank</th>
        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Company</th>
        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Ticker</th>
        <th 
          className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-blue-600"
          onClick={() => onSort("marketCap")}
        >
          Market Cap
          {getSortIcon("marketCap")}
        </th>
        <th 
          className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-blue-600"
          onClick={() => onSort("price")}
        >
          Price
          {getSortIcon("price")}
        </th>
      </tr>
    </thead>
  );
};
