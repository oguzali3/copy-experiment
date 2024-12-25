import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { MetricsSearch } from "./MetricsSearch";
import { CompanySearch } from "./CompanySearch";

const initialCompanies = [
  { rank: 1, name: "Apple Inc.", ticker: "AAPL", marketCap: "3.02T", price: "192.53", change: "+2.41%", isPositive: true },
  { rank: 2, name: "Microsoft", ticker: "MSFT", marketCap: "2.89T", price: "374.58", change: "+1.85%", isPositive: true },
  { rank: 3, name: "Alphabet", ticker: "GOOGL", marketCap: "1.89T", price: "141.80", change: "-0.45%", isPositive: false },
  { rank: 4, name: "Amazon", ticker: "AMZN", marketCap: "1.78T", price: "153.42", change: "+1.23%", isPositive: true },
  { rank: 5, name: "NVIDIA", ticker: "NVDA", marketCap: "1.22T", price: "495.22", change: "+3.12%", isPositive: true },
  { rank: 6, name: "Meta", ticker: "META", marketCap: "905B", price: "353.96", change: "-0.78%", isPositive: false },
  { rank: 7, name: "Tesla", ticker: "TSLA", marketCap: "857B", price: "248.48", change: "+2.15%", isPositive: true },
  { rank: 8, name: "Berkshire", ticker: "BRK.A", marketCap: "785B", price: "544,900", change: "+0.32%", isPositive: true },
  { rank: 9, name: "Eli Lilly", ticker: "LLY", marketCap: "674B", price: "571.22", change: "-1.45%", isPositive: false },
  { rank: 10, name: "JPMorgan", ticker: "JPM", marketCap: "498B", price: "172.26", change: "+0.89%", isPositive: true },
];

type SortDirection = "asc" | "desc" | null;
type SortField = "marketCap" | "price" | "change";

export const TopCompanies = () => {
  const [companies, setCompanies] = useState(initialCompanies);
  const [sortConfig, setSortConfig] = useState<{
    field: SortField | null;
    direction: SortDirection;
  }>({
    field: null,
    direction: null,
  });

  const handleSort = (field: SortField) => {
    let direction: SortDirection = "desc";
    
    if (sortConfig.field === field && sortConfig.direction === "desc") {
      direction = "asc";
    }

    const sortedCompanies = [...companies].sort((a, b) => {
      if (field === "marketCap") {
        const valueA = parseFloat(a[field].replace("T", "000").replace("B", ""));
        const valueB = parseFloat(b[field].replace("T", "000").replace("B", ""));
        return direction === "asc" ? valueA - valueB : valueB - valueA;
      } else if (field === "price") {
        const valueA = parseFloat(a[field].replace(",", ""));
        const valueB = parseFloat(b[field].replace(",", ""));
        return direction === "asc" ? valueA - valueB : valueB - valueA;
      } else if (field === "change") {
        const valueA = parseFloat(a[field].replace("%", ""));
        const valueB = parseFloat(b[field].replace("%", ""));
        return direction === "asc" ? valueA - valueB : valueB - valueA;
      }
      return 0;
    });

    setSortConfig({ field, direction });
    setCompanies(sortedCompanies);
  };

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

  const handleCompanySelect = (newCompany: any) => {
    if (!companies.find(c => c.ticker === newCompany.ticker)) {
      setCompanies(prev => [...prev, { ...newCompany, rank: prev.length + 1 }]);
    }
  };

  const handleRemoveCompany = (tickerToRemove: string) => {
    setCompanies(prev => prev.filter(company => company.ticker !== tickerToRemove));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[#111827]">Featured Companies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <MetricsSearch />
        <CompanySearch onCompanySelect={handleCompanySelect} />
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Company</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Ticker</th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("marketCap")}
                >
                  Market Cap
                  {getSortIcon("marketCap")}
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("price")}
                >
                  Price
                  {getSortIcon("price")}
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("change")}
                >
                  Change
                  {getSortIcon("change")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {companies.map((company, index) => (
                <tr key={company.ticker} className="hover:bg-gray-50 group">
                  <td className="px-4 py-3 text-sm text-gray-500 relative">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleRemoveCompany(company.ticker)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute -left-2 text-gray-400 hover:text-red-500"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                      <span className="ml-6">{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{company.name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">{company.ticker}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">${company.marketCap}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">${company.price}</td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center ${company.isPositive ? 'text-success' : 'text-warning'}`}>
                      {company.isPositive ? (
                        <ArrowUpIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 mr-1" />
                      )}
                      <span>{company.change}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};