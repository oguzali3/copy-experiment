import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { MetricsSearch } from "./MetricsSearch";
import { CompanySearch } from "./CompanySearch";
import { CompanyTableHeader } from "./CompanyTableHeader";
import { CompanyTableRow } from "./CompanyTableRow";
import { fetchFinancialData } from "@/utils/financialApi";

type SortDirection = "asc" | "desc" | null;
type SortField = "price" | "change";

interface ActiveStock {
  symbol: string;
  name: string;
  change: number;
  price: number;
  changesPercentage: number;
}

export const TopCompanies = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    field: SortField | null;
    direction: SortDirection;
  }>({
    field: null,
    direction: null,
  });

  useEffect(() => {
    const fetchMostActive = async () => {
      try {
        setIsLoading(true);
        const data = await fetchFinancialData('actives', '');
        const formattedData = data.slice(0, 10).map((stock: ActiveStock, index: number) => ({
          rank: index + 1,
          name: stock.name,
          ticker: stock.symbol,
          price: stock.price ? stock.price.toFixed(2) : 'N/A',
          change: stock.changesPercentage ? `${stock.changesPercentage.toFixed(2)}%` : 'N/A',
          isPositive: stock.change > 0
        }));
        console.log('Formatted data:', formattedData); // Debug log
        setCompanies(formattedData);
      } catch (error) {
        console.error('Error fetching active stocks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMostActive();
    // Refresh data every minute
    const interval = setInterval(fetchMostActive, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSort = (field: SortField) => {
    let direction: SortDirection = "desc";
    
    if (sortConfig.field === field && sortConfig.direction === "desc") {
      direction = "asc";
    }

    const sortedCompanies = [...companies].sort((a, b) => {
      if (field === "price") {
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

  const handleCompanySelect = (newCompany: any) => {
    if (!companies.find(c => c.ticker === newCompany.ticker)) {
      setCompanies(prev => [...prev, { ...newCompany, rank: prev.length + 1 }]);
    }
  };

  const handleRemoveCompany = (tickerToRemove: string) => {
    setCompanies(prev => prev.filter(company => company.ticker !== tickerToRemove));
  };

  const handleMetricSelect = (metricId: string) => {
    console.log("Metric selected:", metricId);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[#111827]">Most Active Stocks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <MetricsSearch onMetricSelect={handleMetricSelect} />
        <CompanySearch onCompanySelect={handleCompanySelect} />
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <CompanyTableHeader sortConfig={sortConfig} onSort={handleSort} />
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : companies.map((company, index) => (
                <CompanyTableRow
                  key={company.ticker}
                  company={company}
                  index={index}
                  onRemove={handleRemoveCompany}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};