
import { Card } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import { MetricsSearch } from "./MetricsSearch";
import { CompanySearch } from "./CompanySearch";
import { CompanyTableHeader } from "./CompanyTableHeader";
import { CompanyTableRow } from "./CompanyTableRow";
import { fetchFinancialData, formatMarketCap } from "@/utils/financialApi";
import { toast } from "sonner";

type Company = {
  rank: number;
  name: string;
  ticker: string;
  marketCap: string;
  price: string;
  change: string;
  isPositive: boolean;
  currency: string;
};

const initialCompanies: Company[] = [
  { rank: 1, name: "Apple Inc.", ticker: "AAPL", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 2, name: "Microsoft", ticker: "MSFT", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 3, name: "Alphabet", ticker: "GOOGL", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 4, name: "Amazon", ticker: "AMZN", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 5, name: "NVIDIA", ticker: "NVDA", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 6, name: "Meta", ticker: "META", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 7, name: "Tesla", ticker: "TSLA", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 8, name: "Berkshire", ticker: "BRK.A", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 9, name: "Eli Lilly", ticker: "LLY", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 10, name: "JPMorgan", ticker: "JPM", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
];

type SortDirection = "asc" | "desc" | null;
type SortField = "marketCap" | "price" | "change";

const getCurrencySymbol = (currency: string): string => {
  switch (currency) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'JPY': return '¥';
    case 'CNY': return '¥';
    case 'HKD': return 'HK$';
    default: return '$';
  }
};

export const TopCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [sortConfig, setSortConfig] = useState<{
    field: SortField | null;
    direction: SortDirection;
  }>({
    field: null,
    direction: null,
  });

  const fetchPrices = useCallback(async () => {
    try {
      const updatedCompanies = await Promise.all(
        companies.map(async (company) => {
          try {
            const [quoteData, profileData] = await Promise.all([
              fetchFinancialData('quote', company.ticker),
              fetchFinancialData('profile', company.ticker)
            ]);
            
            const quote = quoteData[0];
            const profile = profileData[0];
            
            if (quote && profile) {
              return {
                ...company,
                price: quote.price.toFixed(2),
                change: `${quote.changesPercentage.toFixed(2)}%`,
                isPositive: quote.changesPercentage >= 0,
                marketCap: formatMarketCap(quote.marketCap),
                currency: profile.currency || 'USD'
              };
            }
            return company;
          } catch (error) {
            console.error(`Error fetching quote for ${company.ticker}:`, error);
            return company;
          }
        })
      );

      setCompanies(prevCompanies => {
        // Only update if the number of companies hasn't changed
        if (prevCompanies.length === companies.length) {
          return updatedCompanies;
        }
        return prevCompanies;
      });
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  }, [companies]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);

    return () => clearInterval(interval);
  }, [fetchPrices]);

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
        const valueA = parseFloat(a[field]);
        const valueB = parseFloat(b[field]);
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

  const handleCompanySelect = async (newCompany: any) => {
    if (!companies.find(c => c.ticker === newCompany.ticker)) {
      try {
        const [quoteData, profileData] = await Promise.all([
          fetchFinancialData('quote', newCompany.ticker),
          fetchFinancialData('profile', newCompany.ticker)
        ]);
        
        const quote = quoteData[0];
        const profile = profileData[0];
        
        if (quote && profile) {
          const formattedCompany: Company = {
            ...newCompany,
            rank: companies.length + 1,
            price: quote.price.toFixed(2),
            change: `${quote.changesPercentage.toFixed(2)}%`,
            isPositive: quote.changesPercentage >= 0,
            marketCap: formatMarketCap(quote.marketCap),
            currency: profile.currency || 'USD'
          };
          
          // Update companies state with the new company
          setCompanies(prev => {
            const newCompanies = [...prev, formattedCompany];
            // Sort immediately if there's an active sort
            if (sortConfig.field) {
              return handleSort(sortConfig.field);
            }
            return newCompanies;
          });
          
          toast.success(`Added ${newCompany.name} to featured companies`);
        }
      } catch (error) {
        console.error(`Error fetching data for new company ${newCompany.ticker}:`, error);
        toast.error(`Failed to fetch data for ${newCompany.name}`);
      }
    }
  };

  const handleRemoveCompany = useCallback((tickerToRemove: string) => {
    setCompanies(prev => {
      const updatedCompanies = prev
        .filter(company => company.ticker !== tickerToRemove)
        .map((company, index) => ({
          ...company,
          rank: index + 1
        }));
      return updatedCompanies;
    });
  }, []);

  const handleMetricSelect = (metricId: string) => {
    console.log("Metric selected:", metricId);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[#111827]">Featured Companies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <MetricsSearch onMetricSelect={handleMetricSelect} />
        <CompanySearch onCompanySelect={handleCompanySelect} />
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <CompanyTableHeader sortConfig={sortConfig} onSort={handleSort} />
            <tbody className="divide-y divide-gray-200">
              {companies.map((company, index) => (
                <CompanyTableRow
                  key={company.ticker}
                  company={{
                    ...company,
                    marketCap: `${getCurrencySymbol(company.currency)}${company.marketCap}`,
                    price: `${getCurrencySymbol(company.currency)}${company.price}`
                  }}
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
