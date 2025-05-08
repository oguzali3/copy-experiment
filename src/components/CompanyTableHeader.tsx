
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
      return <ArrowDownIcon className="h-3 w-3 ml-1 inline-block text-gray-400 dark:text-gray-500" />;
    }
    return sortConfig.direction === "desc" ? (
      <ArrowDownIcon className="h-3 w-3 ml-1 inline-block text-gray-700 dark:text-gray-300" />
    ) : (
      <ArrowUpIcon className="h-3 w-3 ml-1 inline-block text-gray-700 dark:text-gray-300" />
    );
  };

  return (
    <thead className="bg-gray-50 dark:bg-[#27272f] border-b border-gray-200 dark:border-gray-800">
      <tr>
        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Ticker</th>
        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Company</th>
        <th 
          className="px-4 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200"
          onClick={() => onSort("marketCap")}
        >
          Market Cap
          {getSortIcon("marketCap")}
        </th>
        <th 
          className="px-4 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200"
          onClick={() => onSort("price")}
        >
          Price
          {getSortIcon("price")}
        </th>
        <th 
          className="px-4 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200"
          onClick={() => onSort("change")}
        >
          Change
          {getSortIcon("change")}
        </th>
        <th className="px-4 py-2"></th>
      </tr>
    </thead>
  );
};
