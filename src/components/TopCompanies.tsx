
import { Card } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import { MetricsSearch } from "./MetricsSearch";
import { CompanySearch } from "./CompanySearch";
import { CompanyTableHeader } from "./CompanyTableHeader";
import { CompanyTableRow } from "./CompanyTableRow";
import { fetchFinancialData, fetchBatchQuotes, formatMarketCap } from "@/utils/financialApi";
import { toast } from "sonner";
import { RefreshCw, Info } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Company = {
  rank: number;
  name: string;
  ticker: string;
  marketCap: string;
  price: string;
  change: string;
  isPositive: boolean;
  currency: string;
  logoUrl?: string;
};

const initialCompanies: Company[] = [
  { rank: 1, name: "Apple Inc.", ticker: "AAPL", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 2, name: "Microsoft", ticker: "MSFT", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 3, name: "Alphabet", ticker: "GOOGL", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 4, name: "Amazon", ticker: "AMZN", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 5, name: "NVIDIA", ticker: "NVDA", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 6, name: "Meta", ticker: "META", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 7, name: "Tesla", ticker: "TSLA", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 8, name: "Berkshire Hathaway", ticker: "BRK-B", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    field: SortField | null;
    direction: SortDirection;
  }>({
    field: null,
    direction: null,
  });

  const fetchPrices = useCallback(async () => {
    if (isRefreshing) return; // Prevent concurrent refreshes
    
    try {
      setIsRefreshing(true);
      const tickers = companies.map(company => company.ticker);
      
      if (tickers.length === 0) {
        return; // Don't make API call if there are no companies
      }

      // Fetch all quotes in a single API call
      const quotes = await fetchBatchQuotes(tickers);
      
      if (!quotes || quotes.length === 0) {
        throw new Error('No quote data received');
      }

      const updatedCompanies = companies.map(company => {
        const quote = quotes.find(q => q.symbol === company.ticker);
        if (!quote) return company;

        return {
          ...company,
          price: quote.price.toFixed(2),
          change: `${quote.changesPercentage.toFixed(2)}%`,
          isPositive: quote.changesPercentage >= 0,
          marketCap: formatMarketCap(quote.marketCap),
          // Keep existing currency and logo as they don't change frequently
        };
      });

      setCompanies(updatedCompanies);
      toast.success('Prices updated successfully');
    } catch (error) {
      console.error('Error fetching prices:', error);
      toast.error('Failed to refresh prices. Please try again later.');
    } finally {
      setIsRefreshing(false);
    }
  }, [companies, isRefreshing]);

  const fetchInitialData = useCallback(async () => {
    try {
      setIsRefreshing(true);
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
                currency: profile.currency || 'USD',
                logoUrl: profile.image || undefined
              };
            }
            return company;
          } catch (error) {
            console.error(`Error fetching data for ${company.ticker}:`, error);
            return company;
          }
        })
      );

      setCompanies(updatedCompanies);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error("Failed to load company data");
    } finally {
      setIsRefreshing(false);
    }
  }, []); // No dependencies since this is only for initial load

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSort = useCallback((field: SortField) => {
    const newDirection: SortDirection = 
      sortConfig.field === field && sortConfig.direction === "desc" ? "asc" : "desc";

    const sortedCompanies = [...companies].sort((a, b) => {
      let valueA: number;
      let valueB: number;

      if (field === "marketCap") {
        valueA = parseFloat(a.marketCap.replace(/[TB]/g, '')) * 
          (a.marketCap.includes('T') ? 1000 : a.marketCap.includes('B') ? 1 : 0.001);
        valueB = parseFloat(b.marketCap.replace(/[TB]/g, '')) * 
          (b.marketCap.includes('T') ? 1000 : b.marketCap.includes('B') ? 1 : 0.001);
      } else if (field === "price") {
        valueA = parseFloat(a.price);
        valueB = parseFloat(b.price);
      } else {
        valueA = 0;
        valueB = 0;
      }

      return newDirection === "asc" ? valueA - valueB : valueB - valueA;
    });

    setCompanies(sortedCompanies);
    setSortConfig({ field, direction: newDirection });
  }, [companies, sortConfig]);

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
            currency: profile.currency || 'USD',
            logoUrl: profile.image || undefined
          };
          
          setCompanies(prev => {
            const newCompanies = [...prev, formattedCompany];
            if (sortConfig.field) {
              return newCompanies.sort((a, b) => {
                let valueA: number;
                let valueB: number;

                if (sortConfig.field === "marketCap") {
                  valueA = parseFloat(a.marketCap.replace(/[TB]/g, '')) * 
                    (a.marketCap.includes('T') ? 1000 : a.marketCap.includes('B') ? 1 : 0.001);
                  valueB = parseFloat(b.marketCap.replace(/[TB]/g, '')) * 
                    (b.marketCap.includes('T') ? 1000 : b.marketCap.includes('B') ? 1 : 0.001);
                } else if (sortConfig.field === "price") {
                  valueA = parseFloat(a.price);
                  valueB = parseFloat(b.price);
                } else {
                  return 0;
                }

                return sortConfig.direction === "asc" ? valueA - valueB : valueB - valueA;
              });
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

  const handleRefresh = () => {
    fetchPrices();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Featured Companies</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor market performance for leading companies
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="transition-all duration-200 hover:bg-gray-100 dark:bg-[#2b2b35] dark:text-white dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 transition-all duration-700 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <MetricsSearch onMetricSelect={handleMetricSelect} />
        <CompanySearch onCompanySelect={handleCompanySelect} />
      </div>

      <Card className="overflow-hidden rounded-lg border-gray-200 dark:border-gray-800 shadow-sm dark:bg-[#2b2b35]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <CompanyTableHeader sortConfig={sortConfig} onSort={handleSort} />
            <tbody>
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

      {companies.length === 0 && (
        <div className="flex flex-col items-center justify-center p-6 text-center dark:text-gray-400">
          <p className="text-base font-medium text-gray-700 dark:text-gray-300">No companies added yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Use the search above to add companies to your list
          </p>
        </div>
      )}
    </div>
  );
};
