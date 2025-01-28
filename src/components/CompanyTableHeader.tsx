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
    <thead className="bg-[#2c2c35]">
      <tr>
        <th className="px-4 py-3 text-left text-sm font-semibold text-white">Rank</th>
        <th className="px-4 py-3 text-left text-sm font-semibold text-white">Company</th>
        <th className="px-4 py-3 text-left text-sm font-semibold text-white">Ticker</th>
        <th 
          className="px-4 py-3 text-left text-sm font-semibold text-white cursor-pointer hover:text-blue-400"
          onClick={() => onSort("marketCap")}
        >
          Market Cap
          {getSortIcon("marketCap")}
        </th>
        <th 
          className="px-4 py-3 text-left text-sm font-semibold text-white cursor-pointer hover:text-blue-400"
          onClick={() => onSort("price")}
        >
          Price
          {getSortIcon("price")}
        </th>
        <th 
          className="px-4 py-3 text-left text-sm font-semibold text-white cursor-pointer hover:text-blue-400"
          onClick={() => onSort("change")}
        >
          Change
          {getSortIcon("change")}
        </th>
      </tr>
    </thead>
  );
};